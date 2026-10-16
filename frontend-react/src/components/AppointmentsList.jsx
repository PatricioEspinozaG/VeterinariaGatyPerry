import { useState } from 'react';
import { useNavigate } from 'react-router';
import { readStorage, writeStorage } from '../services/storage.js';
import { services } from '../data/services.js';

function getCustomerName(user) {
  return [user.name || user.nombre, user.lastName || user.apellidos].filter(Boolean).join(' ') || user.email;
}

function getAppointmentStatus(appointment) {
  const status = (appointment.estado || appointment.status || 'Pendiente').toString().toLowerCase()
  const statusLabels = {
    pendiente: 'Pendiente',
    pending: 'Pendiente',
    confirmada: 'Confirmada',
    confirmed: 'Confirmada',
    completada: 'Completada',
    completed: 'Completada',
    cancelada: 'Cancelada',
    cancelled: 'Cancelada',
    canceled: 'Cancelada',
  }
  return Object.hasOwn(statusLabels, status)
    ? statusLabels[status]
    : appointment.estado || appointment.status || 'Pendiente'
}

function generateAppointmentId() {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : Date.now().toString()
}

export default function AppointmentsList({ userRole = 'cliente', currentUserId, readOnly = false, adminMode = false, receptionMode = false, embedded = false, users = [], returnTo = '', initialAppointments }) {
  const navigate = useNavigate();
  const [citas, setCitas] = useState(() => initialAppointments ?? readStorage('appointments', []));
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [appointmentPendingDeletion, setAppointmentPendingDeletion] = useState(null);
  const [appointmentPendingCancellation, setAppointmentPendingCancellation] = useState(null);
  const [cancellationError, setCancellationError] = useState('');
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    userId: '',
    petName: '',
    servicio: services[0]?.name || '',
    fecha: '',
    hora: '',
    estado: 'Pendiente',
    motivo: '',
  });

  const canManageAppointments = (adminMode && userRole === 'admin') || (receptionMode && userRole === 'recepcion');
  const managementMode = adminMode || receptionMode;
  const clientes = users.filter((user) => user.role === 'cliente' && user.active !== false);
  const today = new Date().toISOString().split('T')[0];

  const handleCambiarEstado = (id, nuevoEstado) => {
    const actualizadas = citas.map((c) =>
      c.id === id ? { ...c, estado: nuevoEstado } : c
    );
    if (!writeStorage('appointments', actualizadas)) return false;
    setCitas(actualizadas);
    return true;
  };

  const confirmCancellation = () => {
    if (!appointmentPendingCancellation) return
    if (!handleCambiarEstado(appointmentPendingCancellation.id, 'Cancelada')) {
      setCancellationError('No se pudo cancelar la cita en este navegador.')
      return
    }
    setAppointmentPendingCancellation(null)
    setCancellationError('')
  }

  const openCreateForm = () => {
    setEditingAppointmentId(null);
    setFormData({
      userId: '',
      petName: '',
      servicio: services[0]?.name || '',
      fecha: '',
      hora: '',
      estado: 'Pendiente',
      motivo: '',
    });
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (appointment) => {
    setEditingAppointmentId(appointment.id);
    setFormData({
      userId: appointment.userId || '',
      petName: appointment.petName || '',
      servicio: appointment.servicio || services[0]?.name || '',
      fecha: appointment.fecha || '',
      hora: appointment.hora || '',
      estado: appointment.estado || 'Pendiente',
      motivo: appointment.motivo || '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleDelete = () => {
    if (!canManageAppointments || !appointmentPendingDeletion) return;
    const updated = citas.filter((item) => String(item.id) !== String(appointmentPendingDeletion.id));
    if (!writeStorage('appointments', updated)) {
      window.alert('No se pudo eliminar la cita en este navegador.');
      return;
    }
    setCitas(updated);
    setAppointmentPendingDeletion(null);
  };

  const handleSaveAppointment = (event) => {
    event.preventDefault();
    if (!canManageAppointments) return;

    const customer = clientes.find((user) => String(user.id) === String(formData.userId));
    if (!customer) {
      setFormError('Selecciona un cliente válido.');
      return;
    }
    if (formData.fecha < today) {
      setFormError('La fecha de la cita no puede ser anterior a hoy.');
      return;
    }

    const appointment = {
      id: editingAppointmentId ?? generateAppointmentId(),
      userId: customer.id,
      petName: formData.petName.trim(),
      servicio: formData.servicio,
      fecha: formData.fecha,
      hora: formData.hora,
      estado: formData.estado,
      motivo: formData.motivo.trim(),
    };
    const updated = editingAppointmentId === null
      ? [appointment, ...citas]
      : citas.map((item) => (
          String(item.id) === String(editingAppointmentId)
            ? { ...item, ...appointment }
            : item
        ));

    if (!writeStorage('appointments', updated)) {
      setFormError('No se pudo guardar la cita en este navegador.');
      return;
    }
    setCitas(updated);
    setShowForm(false);
    setEditingAppointmentId(null);
    setFormError('');
  };

  const userId = currentUserId || localStorage.getItem('currentUserId');
  const citasFiltradas = citas.filter((c) => {
    if (userRole === 'cliente' && String(c.userId) !== String(userId)) return false;
    if (filtroEstado === 'todas') return true;
    return getAppointmentStatus(c).toLowerCase() === filtroEstado.toLowerCase();
  });

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-warning text-dark';
      case 'Confirmada':
        return 'bg-info text-dark';
      case 'Completada':
        return 'bg-success text-white';
      case 'Cancelada':
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  const appointmentFormContent = (
    <form className="admin-form admin-user-form mb-4" onSubmit={handleSaveAppointment}>
      <div className="admin-section-heading">
        {editingAppointmentId === null && <h2>Nueva cita</h2>}
        {editingAppointmentId !== null && !managementMode && <h2>Editar cita</h2>}
        <button className="btn" type="button" onClick={() => setShowForm(false)}>Cancelar</button>
      </div>
      <label>Cliente
        <select
          value={formData.userId}
          onChange={(event) => setFormData({ ...formData, userId: event.target.value })}
          required
        >
          <option value="">Selecciona un cliente</option>
          {clientes.map((client) => (
            <option key={client.id} value={client.id}>
              {getCustomerName(client)} · {client.email}
            </option>
          ))}
        </select>
      </label>
      <label>Mascota
        <input
          value={formData.petName}
          onChange={(event) => setFormData({ ...formData, petName: event.target.value })}
          maxLength="50"
          required
        />
      </label>
      <label>Servicio
        <select
          value={formData.servicio}
          onChange={(event) => setFormData({ ...formData, servicio: event.target.value })}
          required
        >
          {!services.some((service) => service.name === formData.servicio) && formData.servicio && (
            <option value={formData.servicio}>{formData.servicio}</option>
          )}
          {services.map((service) => (
            <option key={service.code} value={service.name}>{service.name}</option>
          ))}
        </select>
      </label>
      <label>Fecha
        <input
          type="date"
          min={today}
          value={formData.fecha}
          onChange={(event) => setFormData({ ...formData, fecha: event.target.value })}
          required
        />
      </label>
      <label>Hora
        <select
          value={formData.hora}
          onChange={(event) => setFormData({ ...formData, hora: event.target.value })}
          required
        >
          <option value="">Selecciona una hora</option>
          {['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00'].map((time) => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
      </label>
      <label>Estado
        <select
          value={formData.estado}
          onChange={(event) => setFormData({ ...formData, estado: event.target.value })}
        >
          {['Pendiente', 'Confirmada', 'Completada', 'Cancelada'].map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </label>
      <label>Motivo
        <textarea
          value={formData.motivo}
          onChange={(event) => setFormData({ ...formData, motivo: event.target.value })}
          maxLength="200"
          required
        />
      </label>
      {formError && <p className="admin-form-message error" role="alert">{formError}</p>}
      <div className="form-actions">
        <button className="btn btn-primary" type="submit">{editingAppointmentId === null ? 'Crear cita' : 'Guardar cambios'}</button>
      </div>
    </form>
  );

  return (
    <>
    <div className={managementMode ? 'admin-appointments-content' : embedded ? 'appointments-list-embedded' : 'bg-vet-doodle min-vh-100 py-5'}>
      <div className="container">
        <div className="row justify-content-center">
          <div className={managementMode || embedded ? 'col-12' : 'col-12 col-lg-10'}>
            <div className="card shadow border-0 rounded-4 p-4 bg-white">
              
              {/* Encabezado */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <div>
                  <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7 mb-2 d-inline-block">
                    {adminMode || readOnly ? 'INFORMACIÓN DE CITAS' : 'GESTIÓN DE CITAS'}
                  </span>
                  <h1 className="h3 fw-bold text-dark mb-0">{adminMode || readOnly ? 'Citas registradas' : 'Citas Veterinarias'}</h1>
                </div>
                {canManageAppointments ? (
                  <button
                    className={adminMode ? 'fab-pill' : 'btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold shadow-sm'}
                    onClick={openCreateForm}
                    aria-label="Agregar cita"
                  >
                    {adminMode && <span className="fab-plus" aria-hidden="true">+</span>}
                    {adminMode
                      ? <span className="fab-label">Agregar cita</span>
                      : '+ Agregar cita'}
                  </button>
                ) : !readOnly && (
                  <button
                    className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold shadow-sm"
                    onClick={() => navigate(returnTo ? `/citas/nueva?returnTo=${encodeURIComponent(returnTo)}` : '/citas/nueva')}
                  >
                    + Agendar Nueva Cita
                  </button>
                )}
              </div>

              {/* Filtros */}
              <div className="row mb-4">
                <div className="col-12 col-md-4">
                  <label htmlFor="filtroEstado" className="form-label fw-medium text-dark small">Filtrar por estado:</label>
                  <select
                    id="filtroEstado"
                    className="form-select rounded-3"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="todas">Todas las citas</option>
                    <option value="Pendiente">Pendientes</option>
                    <option value="Confirmada">Confirmadas</option>
                    <option value="Completada">Completadas</option>
                    <option value="Cancelada">Canceladas</option>
                  </select>
                </div>
              </div>

              {canManageAppointments && showForm && editingAppointmentId === null && appointmentFormContent}

              {/* Tabla de Citas */}
              {citasFiltradas.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No hay citas registradas en esta categoría.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className={`table table-hover align-middle${managementMode ? ' admin-appointments-table' : embedded ? ' user-appointments-table' : ''}`}>
                    <thead className="table-light">
                      <tr>
                        {(managementMode || readOnly) && <th>Cliente</th>}
                        <th>Mascota</th>
                        <th>Servicio</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        {(managementMode || readOnly) && <th>Motivo</th>}
                        {(canManageAppointments || (!readOnly && !managementMode)) && <th>Acciones</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {citasFiltradas.map((cita) => {
                        const customer = users.find((user) => String(user.id) === String(cita.userId));
                        const estadoCita = getAppointmentStatus(cita)
                        const estadoNormalizado = estadoCita.toLowerCase()
                        const puedeCancelar = ['pendiente', 'confirmada'].includes(estadoNormalizado)
                        return (
                        <tr key={cita.id}>
                          {(managementMode || readOnly) && (
                            <td data-label="Cliente">
                              {customer
                                ? getCustomerName(customer)
                                : cita.usuarioNombre || '-'}
                            </td>
                          )}
                          <td className="fw-semibold text-dark" data-label="Mascota">{cita.petName}</td>
                          <td data-label="Servicio">{cita.servicio}</td>
                          <td data-label="Fecha">{cita.fecha}</td>
                          <td data-label="Hora">{cita.hora} hrs</td>
                          <td data-label="Estado">
                            <span className={`badge rounded-pill px-3 py-2 ${getBadgeClass(estadoCita)}`}>
                              {estadoCita}
                            </span>
                          </td>
                          {(managementMode || readOnly) && <td data-label="Motivo">{cita.motivo || '-'}</td>}
                          {canManageAppointments && (
                            <td className="action-cell" data-label="Acciones">
                              <div className="action-buttons">
                                <button className="btn btn-edit" type="button" onClick={() => openEditForm(cita)}>Editar</button>
                                <button className="btn btn-delete" type="button" onClick={() => setAppointmentPendingDeletion(cita)}>Eliminar</button>
                              </div>
                            </td>
                          )}
                          {!readOnly && !managementMode && <td className={embedded ? 'user-appointment-actions' : ''} data-label={embedded ? 'Acciones' : undefined}>
                            {userRole !== 'cliente' ? (
                              <select
                                className="form-select form-select-sm rounded-3"
                                value={cita.estado}
                                onChange={(e) => handleCambiarEstado(cita.id, e.target.value)}
                              >
                                <option value="Pendiente">Pendiente</option>
                                <option value="Confirmada">Confirmar</option>
                                <option value="Completada">Completar</option>
                                <option value="Cancelada">Cancelar</option>
                              </select>
                            ) : (
                              puedeCancelar && (
                                <button
                                  className="btn btn-outline-danger btn-sm rounded-pill px-3 user-cancel-appointment"
                                  type="button"
                                  onClick={() => {
                                    setAppointmentPendingCancellation(cita)
                                    setCancellationError('')
                                  }}
                                >
                                  Cancelar cita
                                </button>
                              )
                            )}
                          </td>}
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
    {canManageAppointments && showForm && editingAppointmentId !== null && (
      <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="appointment-edit-title">
        <div className="overlay-panel admin-edit-panel">
          <button className="overlay-close" type="button" onClick={() => setShowForm(false)} aria-label="Cerrar edición de cita">×</button>
          <h2 id="appointment-edit-title" className="h4 fw-bold mb-3">Editar cita</h2>
          {appointmentFormContent}
        </div>
      </div>
    )}
    {canManageAppointments && appointmentPendingDeletion && (
      <div className="overlay" role="presentation">
        <section className="overlay-panel admin-confirm-panel" role="alertdialog" aria-modal="true" aria-labelledby="appointment-delete-title" aria-describedby="appointment-delete-description">
          <h2 id="appointment-delete-title" className="h4 fw-bold">Confirmar eliminación</h2>
          <p id="appointment-delete-description">
            ¿Eliminar la cita de “{appointmentPendingDeletion.petName || 'esta mascota'}”?
            {' '}Esta acción no se puede deshacer.
          </p>
          <div className="form-actions">
            <button className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold" type="button" onClick={() => setAppointmentPendingDeletion(null)}>Cancelar</button>
            <button className="btn btn-delete px-4 py-2 rounded-pill fw-semibold" type="button" onClick={handleDelete}>Eliminar</button>
          </div>
        </section>
      </div>
    )}
    {appointmentPendingCancellation && userRole === 'cliente' && (
      <div className="overlay" role="presentation">
        <section className="overlay-panel admin-confirm-panel" role="alertdialog" aria-modal="true" aria-labelledby="appointment-cancel-title" aria-describedby="appointment-cancel-description">
          <h2 id="appointment-cancel-title" className="h4 fw-bold">Cancelar cita</h2>
          <p id="appointment-cancel-description">
            ¿Quieres cancelar la cita de “{appointmentPendingCancellation.petName}”?
          </p>
          {cancellationError && <p className="admin-form-message error" role="alert">{cancellationError}</p>}
          <div className="form-actions">
            <button className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold" type="button" onClick={() => setAppointmentPendingCancellation(null)}>Volver</button>
            <button className="btn btn-delete px-4 py-2 rounded-pill fw-semibold" type="button" onClick={confirmCancellation}>Sí, cancelar cita</button>
          </div>
        </section>
      </div>
    )}
    </>
  );
}
