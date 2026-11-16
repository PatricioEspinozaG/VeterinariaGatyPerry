import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  cancelAppointment,
  changeManagedAppointmentStatus,
  createManagedAppointment,
  listAppointments,
  listManagedAppointments,
  rescheduleManagedAppointment,
} from '../services/citas.js';
import { listAppointmentClients } from '../services/clientes.js';
import { listManagedPets, listPets } from '../services/mascotas.js';
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

function mapManagedAppointment(appointment, clients, petsByClientId) {
  const userId = String(appointment.userId)
  const mascotaId = String(appointment.mascotaId)
  const client = clients.find((item) => String(item.id) === userId)
  const pet = petsByClientId[userId]?.find((item) => String(item.id) === mascotaId)

  return {
    ...appointment,
    userId,
    mascotaId,
    petId: mascotaId,
    usuarioNombre: client ? getCustomerName(client) : `Cliente #${userId}`,
    petName: pet?.nombre || `Mascota #${mascotaId}`,
    hora: String(appointment.hora).slice(0, 5),
    estado: getAppointmentStatus(appointment),
  }
}

function getApiAppointmentStatus(status) {
  return {
    Pendiente: 'PENDIENTE',
    Confirmada: 'CONFIRMADA',
    Completada: 'COMPLETADA',
    Cancelada: 'CANCELADA',
  }[status] || status
}

export default function AppointmentsList({ userRole = 'cliente', currentUserId, readOnly = false, adminMode = false, receptionMode = false, embedded = false, users = [], returnTo = '', initialAppointments, onAppointmentsChange }) {
  const navigate = useNavigate();
  const managementMode = adminMode || receptionMode;
  const clientApiMode = userRole === 'cliente' && !managementMode && !readOnly;
  const userId = currentUserId || localStorage.getItem('currentUserId');
  const [citas, setCitas] = useState(() => (
    clientApiMode || managementMode ? [] : initialAppointments ?? readStorage('appointments', [])
  ));
  const [appointmentsLoading, setAppointmentsLoading] = useState(clientApiMode || managementMode);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [managedClients, setManagedClients] = useState([]);
  const [managedPetsByClientId, setManagedPetsByClientId] = useState({});
  const [petsLoadingClientId, setPetsLoadingClientId] = useState(null);
  const [appointmentActionLoading, setAppointmentActionLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [editingAppointmentVersion, setEditingAppointmentVersion] = useState(null);
  const [appointmentPendingDeletion, setAppointmentPendingDeletion] = useState(null);
  const [appointmentPendingCancellation, setAppointmentPendingCancellation] = useState(null);
  const [cancellationError, setCancellationError] = useState('');
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    userId: '',
    petId: '',
    servicio: services[0]?.name || '',
    fecha: '',
    hora: '',
    motivo: '',
  });

  useEffect(() => {
    if (!clientApiMode) return undefined

    let active = true
    Promise.all([listAppointments(), listPets()])
      .then(([appointments, pets]) => {
        const petNames = new Map(pets.map((pet) => [String(pet.id), pet.nombre]))
        const mappedAppointments = appointments.map((appointment) => ({
          ...appointment,
          userId: String(appointment.userId),
          petId: String(appointment.mascotaId),
          petName: petNames.get(String(appointment.mascotaId)) || `Mascota #${appointment.mascotaId}`,
          hora: String(appointment.hora).slice(0, 5),
        }))
        if (active) {
          setCitas(mappedAppointments)
          setAppointmentsError('')
        }
      })
      .catch((error) => {
        if (active) setAppointmentsError(error.message)
      })
      .finally(() => {
        if (active) setAppointmentsLoading(false)
      })

    return () => {
      active = false
    }
  }, [clientApiMode, userId])

  useEffect(() => {
    if (!managementMode) return undefined

    let active = true
    Promise.all([listManagedAppointments(), listAppointmentClients()])
      .then(async ([appointments, clients]) => {
        const clientIds = [...new Set(appointments.map((appointment) => String(appointment.userId)))]
        const petEntries = await Promise.all(clientIds.map(async (clientId) => [
          clientId,
          await listManagedPets(clientId),
        ]))
        const petsByClientId = Object.fromEntries(petEntries)
        const mappedAppointments = appointments.map((appointment) => (
          mapManagedAppointment(appointment, clients, petsByClientId)
        ))

        if (active) {
          setManagedClients(clients)
          setManagedPetsByClientId(petsByClientId)
          setCitas(mappedAppointments)
          onAppointmentsChange?.(mappedAppointments)
          setAppointmentsError('')
        }
      })
      .catch((error) => {
        if (active) setAppointmentsError(error.message)
      })
      .finally(() => {
        if (active) setAppointmentsLoading(false)
      })

    return () => {
      active = false
    }
  }, [managementMode, onAppointmentsChange])

  useEffect(() => {
    if (!managementMode || !formData.userId) return undefined

    const clientId = String(formData.userId)
    if (Object.hasOwn(managedPetsByClientId, clientId)) return undefined

    let active = true
    Promise.resolve().then(() => {
      if (active) setPetsLoadingClientId(clientId)
    })
    listManagedPets(clientId)
      .then((pets) => {
        if (active) {
          setManagedPetsByClientId((current) => ({ ...current, [clientId]: pets }))
        }
      })
      .catch((error) => {
        if (active) setFormError(error.message)
      })
      .finally(() => {
        if (active) {
          setPetsLoadingClientId((current) => (
            current === clientId ? null : current
          ))
        }
      })

    return () => {
      active = false
    }
  }, [managementMode, formData.userId, managedPetsByClientId])

  const canManageAppointments = (adminMode && userRole === 'admin') || (receptionMode && userRole === 'recepcion');
  const clientes = managementMode
    ? managedClients
    : users.filter((user) => user.role === 'cliente' && user.active !== false);
  const formPets = managedPetsByClientId[String(formData.userId)] || [];
  const petsLoading = String(formData.userId) === petsLoadingClientId;
  const today = new Date().toISOString().split('T')[0];

  const handleCambiarEstado = (id, nuevoEstado) => {
    const actualizadas = citas.map((c) =>
      c.id === id ? { ...c, estado: nuevoEstado } : c
    );
    if (!writeStorage('appointments', actualizadas)) return false;
    setCitas(actualizadas);
    return true;
  };

  const handleManagedStatusChange = async (appointment, status) => {
    setAppointmentActionLoading(true)
    setAppointmentsError('')
    try {
      const updated = await changeManagedAppointmentStatus(appointment.id, status)
      const next = citas.map((item) => (
        String(item.id) === String(appointment.id)
          ? {
              ...item,
              estado: getAppointmentStatus(updated),
              version: updated.version,
            }
          : item
      ))
      setCitas(next)
      onAppointmentsChange?.(next)
    } catch (error) {
      setAppointmentsError(error.message)
    } finally {
      setAppointmentActionLoading(false)
    }
  }

  const confirmCancellation = async () => {
    if (!appointmentPendingCancellation) return
    if (clientApiMode) {
      setCancellationLoading(true)
      try {
        const updated = await cancelAppointment(appointmentPendingCancellation.id)
        setCitas((previous) => previous.map((appointment) => (
          String(appointment.id) === String(appointmentPendingCancellation.id)
            ? { ...appointment, estado: updated.estado }
            : appointment
        )))
        setAppointmentPendingCancellation(null)
        setCancellationError('')
      } catch (error) {
        setCancellationError(error.message)
      } finally {
        setCancellationLoading(false)
      }
      return
    }

    if (!handleCambiarEstado(appointmentPendingCancellation.id, 'Cancelada')) {
      setCancellationError('No se pudo cancelar la cita en este navegador.')
      return
    }
    setAppointmentPendingCancellation(null)
    setCancellationError('')
  }

  const openCreateForm = () => {
    setEditingAppointmentId(null);
    setEditingAppointmentVersion(null);
    setFormData({
      userId: '',
      petId: '',
      servicio: services[0]?.name || '',
      fecha: '',
      hora: '',
      motivo: '',
    });
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (appointment) => {
    setEditingAppointmentId(appointment.id);
    setEditingAppointmentVersion(appointment.version);
    setFormData({
      userId: appointment.userId || '',
      petId: appointment.petId || appointment.mascotaId || '',
      servicio: appointment.servicio || services[0]?.name || '',
      fecha: appointment.fecha || '',
      hora: appointment.hora || '',
      motivo: appointment.motivo || '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!canManageAppointments || !appointmentPendingDeletion) return;
    setAppointmentActionLoading(true)
    setAppointmentsError('')
    try {
      const updated = await changeManagedAppointmentStatus(
        appointmentPendingDeletion.id,
        'CANCELADA',
      )
      const next = citas.map((item) => (
        String(item.id) === String(appointmentPendingDeletion.id)
          ? {
              ...item,
              estado: getAppointmentStatus(updated),
              version: updated.version,
            }
          : item
      ))
      setCitas(next)
      onAppointmentsChange?.(next)
      setAppointmentPendingDeletion(null)
      setCancellationError('')
    } catch (error) {
      setCancellationError(error.message)
    } finally {
      setAppointmentActionLoading(false)
    }
  };

  const handleSaveAppointment = async (event) => {
    event.preventDefault();
    if (!canManageAppointments) return;

    const customer = clientes.find((user) => String(user.id) === String(formData.userId));
    if (!customer) {
      setFormError('Selecciona un cliente válido.');
      return;
    }
    const pet = formPets.find((item) => String(item.id) === String(formData.petId));
    if (!pet) {
      setFormError('Selecciona una mascota válida.');
      return;
    }
    if (editingAppointmentId !== null && editingAppointmentVersion == null) {
      setFormError('No se pudo verificar la versión de la cita. Vuelve a cargarla.')
      return
    }
    if (formData.fecha <= today) {
      setFormError('La fecha de la cita debe ser futura.');
      return;
    }

    const appointment = {
      mascotaId: Number(pet.id),
      servicio: formData.servicio,
      fecha: formData.fecha,
      hora: formData.hora,
      motivo: formData.motivo.trim(),
    };
    setAppointmentActionLoading(true)
    setFormError('')
    try {
      const saved = editingAppointmentId === null
        ? await createManagedAppointment(Number(customer.id), appointment)
        : await rescheduleManagedAppointment(
            editingAppointmentId,
            Number(editingAppointmentVersion),
            appointment,
          )
      const petsByClientId = {
        ...managedPetsByClientId,
        [String(customer.id)]: formPets,
      }
      const mapped = mapManagedAppointment(saved, managedClients, petsByClientId)
      setManagedPetsByClientId(petsByClientId)
      const next = (
        editingAppointmentId === null
          ? [mapped, ...citas]
          : citas.map((item) => (
              String(item.id) === String(editingAppointmentId) ? mapped : item
            ))
      )
      setCitas(next)
      onAppointmentsChange?.(next)
      setShowForm(false)
      setEditingAppointmentId(null)
      setEditingAppointmentVersion(null)
      setAppointmentsError('')
    } catch (error) {
      setFormError(error.message)
    } finally {
      setAppointmentActionLoading(false)
    }
  };

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
          onChange={(event) => setFormData({
            ...formData,
            userId: event.target.value,
            petId: '',
          })}
          disabled={editingAppointmentId !== null}
          required
        >
          <option value="">Selecciona un cliente</option>
          {clientes.map((client) => (
            <option key={client.id} value={client.id}>
              {getCustomerName(client)} · #{client.id}
            </option>
          ))}
        </select>
      </label>
      <label>Mascota
        <select
          value={formData.petId}
          onChange={(event) => setFormData({ ...formData, petId: event.target.value })}
          disabled={!formData.userId || petsLoading || formPets.length === 0}
          required
        >
          <option value="">
            {petsLoading ? 'Cargando mascotas...' : 'Selecciona una mascota'}
          </option>
          {formPets.map((pet) => (
            <option key={pet.id} value={pet.id}>{pet.nombre}</option>
          ))}
        </select>
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
        <button className="btn btn-primary" type="submit" disabled={appointmentActionLoading || petsLoading}>
          {appointmentActionLoading
            ? 'Guardando...'
            : editingAppointmentId === null ? 'Crear cita' : 'Guardar cambios'}
        </button>
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

              {(clientApiMode || managementMode) && appointmentsError && (
                <p className="admin-form-message error" role="alert">{appointmentsError}</p>
              )}

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
              {(clientApiMode || managementMode) && appointmentsLoading ? (
                <p className="text-center py-5" role="status">
                  {managementMode ? 'Cargando citas...' : 'Cargando tus citas...'}
                </p>
              ) : (clientApiMode || managementMode) && appointmentsError ? null : citasFiltradas.length === 0 ? (
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
                        const customer = clientes.find((user) => String(user.id) === String(cita.userId));
                        const estadoCita = getAppointmentStatus(cita)
                        const estadoNormalizado = estadoCita.toLowerCase()
                        const puedeCancelar = ['pendiente', 'confirmada'].includes(estadoNormalizado)
                        const estadosDisponibles = estadoNormalizado === 'pendiente'
                          ? [
                              ['PENDIENTE', 'Pendiente'],
                              ['CONFIRMADA', 'Confirmar'],
                              ['CANCELADA', 'Cancelar'],
                            ]
                          : estadoNormalizado === 'confirmada'
                            ? [
                                ['CONFIRMADA', 'Confirmada'],
                                ['COMPLETADA', 'Completar'],
                                ['CANCELADA', 'Cancelar'],
                              ]
                            : [[getApiAppointmentStatus(estadoCita), estadoCita]]
                        const estadoFinalizado = ['completada', 'cancelada'].includes(estadoNormalizado)
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
                                <button
                                  className="btn btn-edit"
                                  type="button"
                                  onClick={() => openEditForm(cita)}
                                  disabled={estadoFinalizado || appointmentActionLoading}
                                >
                                  Editar
                                </button>
                                <select
                                  className="form-select form-select-sm rounded-3"
                                  aria-label={`Cambiar estado de cita de ${cita.petName}`}
                                  value={getApiAppointmentStatus(estadoCita)}
                                  disabled={estadoFinalizado || appointmentActionLoading}
                                  onChange={(event) => {
                                    if (event.target.value === 'CANCELADA') {
                                      setAppointmentPendingDeletion(cita)
                                      setCancellationError('')
                                    } else {
                                      handleManagedStatusChange(cita, event.target.value)
                                    }
                                  }}
                                >
                                  {estadosDisponibles.map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                  ))}
                                </select>
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
          <h2 id="appointment-delete-title" className="h4 fw-bold">Confirmar cancelación</h2>
          <p id="appointment-delete-description">
            ¿Cancelar la cita de “{appointmentPendingDeletion.petName || 'esta mascota'}”?
            {' '}La cita quedará registrada como cancelada.
          </p>
          {cancellationError && <p className="admin-form-message error" role="alert">{cancellationError}</p>}
          <div className="form-actions">
            <button className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold" type="button" onClick={() => setAppointmentPendingDeletion(null)} disabled={appointmentActionLoading}>Volver</button>
            <button className="btn btn-delete px-4 py-2 rounded-pill fw-semibold" type="button" onClick={handleDelete} disabled={appointmentActionLoading}>
              {appointmentActionLoading ? 'Cancelando...' : 'Cancelar cita'}
            </button>
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
            <button className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold" type="button" onClick={() => setAppointmentPendingCancellation(null)} disabled={cancellationLoading}>Volver</button>
            <button className="btn btn-delete px-4 py-2 rounded-pill fw-semibold" type="button" onClick={confirmCancellation} disabled={cancellationLoading}>{cancellationLoading ? 'Cancelando...' : 'Sí, cancelar cita'}</button>
          </div>
        </section>
      </div>
    )}
    </>
  );
}
