import { useState } from 'react';
import { useNavigate } from 'react-router';
import { readStorage, writeStorage } from '../services/storage.js';
import { services } from '../data/services.js';

function getCustomerName(user) {
  return [user.name || user.nombre, user.lastName || user.apellidos].filter(Boolean).join(' ') || user.email;
}

export default function AppointmentsList({ userRole = 'cliente', currentUserId, readOnly = false, adminMode = false, receptionMode = false, embedded = false, users = [], returnTo = '' }) {
  const navigate = useNavigate();
  const [citas, setCitas] = useState(() => readStorage('appointments', []));
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
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
    writeStorage('appointments', actualizadas);
    setCitas(actualizadas);
  };

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

  const handleDelete = (appointment) => {
    if (!canManageAppointments || !window.confirm(`¿Eliminar la cita de ${appointment.petName || 'esta mascota'}?`)) return;
    const updated = citas.filter((item) => String(item.id) !== String(appointment.id));
    if (!writeStorage('appointments', updated)) {
      window.alert('No se pudo eliminar la cita en este navegador.');
      return;
    }
    setCitas(updated);
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
      id: editingAppointmentId ?? (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Date.now().toString()),
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
    if (userRole === 'cliente' && c.userId !== userId) return false;
    if (filtroEstado === 'todas') return true;
    return (c.estado || c.status || '').toLowerCase() === filtroEstado.toLowerCase();
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

  return (
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
                    className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold shadow-sm"
                    onClick={openCreateForm}
                  >
                    + Agregar cita
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

              {canManageAppointments && showForm && (
                <form className="admin-form admin-user-form mb-4" onSubmit={handleSaveAppointment}>
                  <div className="admin-section-heading">
                    <h2>{editingAppointmentId === null ? 'Nueva cita' : 'Editar cita'}</h2>
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
              )}

              {/* Tabla de Citas */}
              {citasFiltradas.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No hay citas registradas en esta categoría.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
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
                        return (
                        <tr key={cita.id}>
                          {(managementMode || readOnly) && (
                            <td>
                              {customer
                                ? getCustomerName(customer)
                                : cita.usuarioNombre || '-'}
                            </td>
                          )}
                          <td className="fw-semibold text-dark">{cita.petName}</td>
                          <td>{cita.servicio}</td>
                          <td>{cita.fecha}</td>
                          <td>{cita.hora} hrs</td>
                          <td>
                            <span className={`badge rounded-pill px-3 py-2 ${getBadgeClass(cita.estado)}`}>
                              {cita.estado}
                            </span>
                          </td>
                          {(managementMode || readOnly) && <td>{cita.motivo || '-'}</td>}
                          {canManageAppointments && (
                            <td>
                              <div className="action-buttons">
                                <button className="btn btn-edit" type="button" onClick={() => openEditForm(cita)}>Editar</button>
                                <button className="btn btn-delete" type="button" onClick={() => handleDelete(cita)}>Eliminar</button>
                              </div>
                            </td>
                          )}
                          {!readOnly && !managementMode && <td>
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
                              cita.estado === 'Pendiente' && (
                                <button
                                  className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                  onClick={() => handleCambiarEstado(cita.id, 'Cancelada')}
                                >
                                  Cancelar
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
  );
}
