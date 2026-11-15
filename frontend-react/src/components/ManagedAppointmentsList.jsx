import { useEffect, useState } from 'react'
import {
  changeManagedAppointmentStatus,
  getManagedAppointments,
} from '../services/appointmentsApi.js'

const statusLabels = {
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

const allowedTransitions = {
  PENDIENTE: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA'],
  CONFIRMADA: ['CONFIRMADA', 'COMPLETADA', 'CANCELADA'],
}

function getCustomerName(user) {
  return [
    user.nombre || user.name,
    user.apellidos || user.lastName,
  ].filter(Boolean).join(' ') || user.email || `Cliente #${user.id}`
}

export default function ManagedAppointmentsList({
  users = [],
  onAppointmentsChange,
}) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [filter, setFilter] = useState('todas')

  useEffect(() => {
    let active = true

    async function loadAppointments() {
      try {
        const result = await getManagedAppointments()

        if (active) {
          setAppointments(result)
          onAppointmentsChange?.(result)
        }
      } catch (cause) {
        if (active) {
          setError(cause.message || 'No pudimos cargar las citas.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadAppointments()

    return () => {
      active = false
    }
  }, [onAppointmentsChange])

  async function handleStatusChange(appointment, estado) {
    setUpdatingId(appointment.id)
    setError('')

    try {
      const updated = await changeManagedAppointmentStatus(
        appointment.id,
        estado,
      )

      const nextAppointments = appointments.map((item) => (
        item.id === updated.id ? updated : item
      ))

      setAppointments(nextAppointments)
      onAppointmentsChange?.(nextAppointments)
    } catch (cause) {
      setError(cause.message || 'No pudimos actualizar el estado.')
    } finally {
      setUpdatingId(null)
    }
  }

  const visibleAppointments = appointments.filter((appointment) => (
    filter === 'todas' || appointment.estado === filter
  ))

  return (
    <section className="admin-view-card card shadow border-0 rounded-4 p-4 bg-white full">
      <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7 mb-2 d-inline-block">
        GESTIÓN DE CITAS
      </span>
      <h2 className="h3 fw-bold text-dark">Citas registradas</h2>

      <div className="row mb-4">
        <div className="col-12 col-md-4">
          <label htmlFor="managedAppointmentFilter" className="form-label">
            Filtrar por estado
          </label>
          <select
            id="managedAppointmentFilter"
            className="form-select"
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

      {error && (
        <p className="admin-form-message error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p role="status">Cargando citas...</p>
      ) : visibleAppointments.length === 0 ? (
        <p className="text-muted">
          No hay citas registradas en esta categoría.
        </p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle admin-appointments-table">
            <thead className="table-light">
              <tr>
                <th>Cliente</th>
                <th>Mascota</th>
                <th>Servicio</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Estado</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {visibleAppointments.map((appointment) => {
                const customer = users.find(
                  (user) => String(user.id) === String(appointment.userId),
                )
                const transitions = allowedTransitions[appointment.estado]

                return (
                  <tr key={appointment.id}>
                    <td data-label="Cliente">
                      {customer
                        ? getCustomerName(customer)
                        : `Cliente #${appointment.userId}`}
                    </td>
                    <td data-label="Mascota">#{appointment.mascotaId}</td>
                    <td data-label="Servicio">{appointment.servicio}</td>
                    <td data-label="Fecha">{appointment.fecha}</td>
                    <td data-label="Hora">{appointment.hora.slice(0, 5)}</td>
                    <td data-label="Estado">
                      {transitions ? (
                        <select
                          className="form-select form-select-sm"
                          aria-label={`Estado de cita ${appointment.id}`}
                          value={appointment.estado}
                          disabled={updatingId === appointment.id}
                          onChange={(event) => handleStatusChange(
                            appointment,
                            event.target.value,
                          )}
                        >
                          {transitions.map((status) => (
                            <option key={status} value={status}>
                              {statusLabels[status]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`badge rounded-pill px-3 py-2 ${
                            statusClasses[appointment.estado]
                              || 'bg-secondary text-white'
                          }`}
                        >
                          {statusLabels[appointment.estado]
                            || appointment.estado}
                        </span>
                      )}
                    </td>
                    <td data-label="Motivo">{appointment.motivo}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}