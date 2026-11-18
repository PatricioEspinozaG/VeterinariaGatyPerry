import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  cancelMyAppointment,
  getMyAppointments,
} from '../services/appointmentsApi.js'
import { getMyPets } from '../services/petsApi.js'

const statusNames = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
}

const statusClasses = {
  PENDIENTE: 'bg-warning text-dark',
  CONFIRMADA: 'bg-info text-dark',
  COMPLETADA: 'bg-success text-white',
  CANCELADA: 'bg-danger text-white',
}

export default function ClientAppointmentsList({ embedded = false, returnTo = '' }) {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('todas')
  const [pendingCancellation, setPendingCancellation] = useState(null)
  const [cancellationError, setCancellationError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    let active = true

    async function loadAppointments() {
      try {
        const [result, pets] = await Promise.all([
          getMyAppointments(),
          getMyPets(),
        ])

        if (!active) return

        setAppointments(result.map((appointment) => ({
          ...appointment,
          petName: pets.find(
            (pet) => String(pet.id) === String(appointment.mascotaId),
          )?.nombre || `Mascota #${appointment.mascotaId}`,
        })))
      } catch (cause) {
        if (active) setError(cause.message || 'No pudimos cargar tus citas.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadAppointments()
    return () => { active = false }
  }, [])

  async function confirmCancellation() {
    if (!pendingCancellation || cancelling) return

    setCancelling(true)
    setCancellationError('')

    try {
      const updated = await cancelMyAppointment(pendingCancellation.id)
      setAppointments((previous) => previous.map((appointment) => (
        appointment.id === updated.id
          ? { ...appointment, ...updated }
          : appointment
      )))
      setPendingCancellation(null)
    } catch (cause) {
      setCancellationError(cause.message || 'No pudimos cancelar la cita.')
    } finally {
      setCancelling(false)
    }
  }

  const visibleAppointments = appointments.filter((appointment) => (
    filter === 'todas' || appointment.estado === filter
  ))

  const createUrl = returnTo
    ? `/citas/nueva?returnTo=${encodeURIComponent(returnTo)}`
    : '/citas/nueva'

  return (
    <>
      <div className={embedded ? 'appointments-list-embedded' : 'bg-vet-doodle min-vh-100 py-5'}>
        <div className="container">
          <div className="card shadow border-0 rounded-4 p-4 bg-white">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
              <div>
                <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold mb-2">
                  GESTIÓN DE CITAS
                </span>
                <h1 className="h3 fw-bold text-dark mb-0">Citas Veterinarias</h1>
              </div>
              <button
                className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold shadow-sm"
                type="button"
                onClick={() => navigate(createUrl)}
              >
                + Agendar Nueva Cita
              </button>
            </div>

            <div className="row mb-4">
              <div className="col-12 col-md-4">
                <label htmlFor="filtroCitasCliente" className="form-label fw-medium text-dark small">
                  Filtrar por estado:
                </label>
                <select
                  id="filtroCitasCliente"
                  className="form-select rounded-3"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  <option value="todas">Todas las citas</option>
                  <option value="PENDIENTE">Pendientes</option>
                  <option value="CONFIRMADA">Confirmadas</option>
                  <option value="COMPLETADA">Completadas</option>
                  <option value="CANCELADA">Canceladas</option>
                </select>
              </div>
            </div>

            {loading ? (
              <p role="status">Cargando citas...</p>
            ) : error ? (
              <p className="admin-form-message error" role="alert">{error}</p>
            ) : visibleAppointments.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-0">No hay citas registradas en esta categoría.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle user-appointments-table">
                  <thead className="table-light">
                    <tr>
                      <th>Mascota</th>
                      <th>Servicio</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleAppointments.map((appointment) => {
                      const canCancel = ['PENDIENTE', 'CONFIRMADA']
                        .includes(appointment.estado)

                      return (
                        <tr key={appointment.id}>
                          <td className="fw-semibold text-dark" data-label="Mascota">
                            {appointment.petName}
                          </td>
                          <td data-label="Servicio">{appointment.servicio}</td>
                          <td data-label="Fecha">{appointment.fecha}</td>
                          <td data-label="Hora">{appointment.hora.slice(0, 5)} hrs</td>
                          <td data-label="Estado">
                            <span className={`badge rounded-pill px-3 py-2 ${statusClasses[appointment.estado] || 'bg-secondary text-white'}`}>
                              {statusNames[appointment.estado] || appointment.estado}
                            </span>
                          </td>
                          <td className="user-appointment-actions" data-label="Acciones">
                            {canCancel && (
                              <button
                                className="btn btn-delete btn-sm rounded-pill px-3 user-danger-action"
                                type="button"
                                onClick={() => {
                                  setPendingCancellation(appointment)
                                  setCancellationError('')
                                }}
                              >
                                Cancelar cita
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {pendingCancellation && (
        <div className="overlay" role="presentation">
          <section
            className="overlay-panel admin-confirm-panel"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="client-cancel-title"
          >
            <h2 id="client-cancel-title" className="h4 fw-bold">Cancelar cita</h2>
            <p>¿Quieres cancelar la cita de “{pendingCancellation.petName}”?</p>
            {cancellationError && (
              <p className="admin-form-message error" role="alert">{cancellationError}</p>
            )}
            <div className="form-actions">
              <button
                className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold"
                type="button"
                onClick={() => setPendingCancellation(null)}
                disabled={cancelling}
              >
                Volver
              </button>
              <button
                className="btn btn-delete px-4 py-2 rounded-pill fw-semibold"
                type="button"
                onClick={confirmCancellation}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelando...' : 'Sí, cancelar cita'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}