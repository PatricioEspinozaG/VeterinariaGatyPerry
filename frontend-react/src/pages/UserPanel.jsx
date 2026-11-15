import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate } from 'react-router'
import ClientOrdersList from '../components/ClientOrdersList.jsx'
import ClientAppointmentsList from '../components/ClientAppointmentsList.jsx'
import { getMyAppointments } from '../services/appointmentsApi.js'
import { getMyOrders } from '../services/ordersApi.js'
import { deleteMyPet, getMyPets } from '../services/petsApi.js'
import ClientPetHistory from '../components/ClientPetHistory.jsx'
import '../styles/app.css'

const sections = [
  { id: 'resumen', label: 'Resumen', path: '/mi-cuenta' },
  { id: 'compras', label: 'Mis compras', path: '/mi-cuenta/compras' },
  { id: 'mascotas', label: 'Mis mascotas', path: '/mi-cuenta/mascotas' },
  { id: 'citas', label: 'Mis citas', path: '/mi-cuenta/citas' },
]

function UserPanel({ currentUser, section = 'resumen' }) {
  const [pets, setPets] = useState([])
  const [petsLoading, setPetsLoading] = useState(true)
  const [petsLoadError, setPetsLoadError] = useState('')
  const [appointments, setAppointments] = useState([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [appointmentsError, setAppointmentsError] = useState('')
  const [ordersCount, setOrdersCount] = useState(0)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState('')
  const [pendingPet, setPendingPet] = useState(null)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (!currentUser?.id || currentUser.role !== 'cliente') return

    let active = true

    async function loadPets() {
      try {
        const result = await getMyPets()
        if (active) setPets(result)
      } catch (error) {
        if (active) {
          setPetsLoadError(error.message || 'No pudimos cargar tus mascotas.')
        }
      } finally {
        if (active) setPetsLoading(false)
      }
    }

    loadPets()

    return () => {
      active = false
    }
  }, [currentUser?.id, currentUser?.role])

  useEffect(() => {
    if (
      section !== 'resumen' ||
      !currentUser?.id ||
      currentUser.role !== 'cliente'
    ) {
      return
    }

    let active = true

    async function loadAppointments() {
      try {
        const result = await getMyAppointments()
        if (active) setAppointments(result)
      } catch (error) {
        if (active) {
          setAppointmentsError(error.message || 'No pudimos cargar tus citas.')
        }
      } finally {
        if (active) setAppointmentsLoading(false)
      }
    }

    loadAppointments()

    return () => {
      active = false
    }
  }, [currentUser?.id, currentUser?.role, section])

  useEffect(() => {
    if (
      section !== 'resumen' ||
      !currentUser?.id ||
      currentUser.role !== 'cliente'
    ) {
      return
    }

    let active = true

    async function loadOrdersCount() {
      try {
        const orders = await getMyOrders()
        if (active) setOrdersCount(orders.length)
      } catch (error) {
        if (active) {
          setOrdersError(error.message || 'No pudimos cargar tus compras.')
        }
      } finally {
        if (active) setOrdersLoading(false)
      }
    }

    loadOrdersCount()

    return () => {
      active = false
    }
  }, [currentUser?.id, currentUser?.role, section])

  if (!currentUser || currentUser.role !== 'cliente') {
    return <Navigate to="/login" replace />
  }

  const customerName = [
    currentUser.nombre || currentUser.name,
    currentUser.apellidos || currentUser.lastName,
  ].filter(Boolean).join(' ')

  function requestPetRemoval(pet) {
    setPendingPet(pet)
    setActionMessage('')
    setActionError('')
  }

  async function confirmPetRemoval() {
    if (!pendingPet) return

    try {
      await deleteMyPet(pendingPet.id)
      setPets((previous) => previous.filter(
        (pet) => String(pet.id) !== String(pendingPet.id),
      ))
      setActionMessage('La mascota se quitó de tu cuenta.')
      setPendingPet(null)
    } catch (error) {
      setActionError(error.message || 'No pudimos quitar la mascota.')
    }
  }

  return (
    <div className="admin-panel user-panel container">
      <div className="admin-header">
        <div className="admin-title">
          <h1>Mi cuenta</h1>
          <p className="muted">Hola, {customerName || currentUser.email}</p>
        </div>
      </div>

      <nav className="admin-nav user-panel-nav" aria-label="Secciones de mi cuenta">
        {sections.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.id === 'resumen'}
            className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="admin-main admin-main-background bg-vet-doodle">
        <div className="admin-main-content">
          {section === 'resumen' && (
            <section className="admin-view-card card shadow border-0 rounded-4 p-4 bg-white full">
              <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7 mb-2 d-inline-block">
                MI ESPACIO
              </span>
              <h2 className="h3 fw-bold text-dark">Resumen de tu cuenta</h2>
              <div className="admin-badges user-summary-stats">
                <div className="stat-card">
                  <strong>Compras</strong>
                  <div className="stat-value">
                    {ordersLoading ? '…' : ordersError ? '—' : ordersCount}
                  </div>
                </div>
                <div className="stat-card">
                  <strong>Mascotas</strong>
                  <div className="stat-value">{pets.length}</div>
                </div>
                <div className="stat-card">
                  <strong>Citas</strong>
                  <div className="stat-value">
                    {appointmentsLoading
                      ? '…'
                      : appointmentsError
                        ? '—'
                        : appointments.length}
                  </div>
                </div>
              </div>
              {ordersError && (
                <p className="admin-form-message error" role="alert">
                  {ordersError}
                </p>
              )}
              {appointmentsError && (
                <p className="admin-form-message error" role="alert">
                  {appointmentsError}
                </p>
              )}
            </section>
          )}

          {section === 'compras' && <ClientOrdersList />}

          {section === 'mascotas' && (
            <section className="admin-view-card card shadow border-0 rounded-4 p-4 bg-white full">
              <div className="admin-section-heading">
                <div>
                  <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7 mb-2 d-inline-block">
                    MIS MASCOTAS
                  </span>
                  <h2 className="h3 fw-bold text-dark">Mis mascotas</h2>
                </div>
                <Link
                  className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold shadow-sm"
                  to="/mascotas/nueva?returnTo=%2Fmi-cuenta%2Fmascotas"
                >
                  + Agregar mascota
                </Link>
              </div>

              {actionMessage && (
                <p className="admin-form-message success" role="status">
                  {actionMessage}
                </p>
              )}
              {actionError && (
                <p className="admin-form-message error" role="alert">
                  {actionError}
                </p>
              )}

              {petsLoading ? (
                <p role="status">Cargando mascotas...</p>
              ) : petsLoadError ? (
                <p className="admin-form-message error" role="alert">
                  {petsLoadError}
                </p>
              ) : pets.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">Aún no registras mascotas.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 user-mobile-card-table">
                    <thead className="table-light">
                      <tr>
                        <th>Nombre</th>
                        <th>Especie</th>
                        <th>Raza</th>
                        <th>Edad</th>
                        <th>Notas</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pets.map((pet) => (
                        <tr key={pet.id}>
                          <td className="fw-semibold" data-label="Nombre">
                            {pet.nombre}
                          </td>
                          <td data-label="Especie">{pet.especie}</td>
                          <td data-label="Raza">{pet.raza}</td>
                          <td data-label="Edad">{pet.edad} años</td>
                          <td data-label="Notas">{pet.notas || '-'}</td>
                          <td className="user-card-actions" data-label="Acciones">
                            <ClientPetHistory pet={pet} />
                            <button
                            className="btn btn-delete rounded-pill px-3 user-danger-action"
                              type="button"
                              onClick={() => requestPetRemoval(pet)}
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {section === 'citas' && (
            <ClientAppointmentsList
              returnTo="/mi-cuenta/citas"
              embedded
            />
          )}
        </div>

        {pendingPet && (
          <div className="overlay" role="presentation">
            <section
              className="overlay-panel admin-confirm-panel"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="account-removal-title"
              aria-describedby="account-removal-description"
            >
              <h2 id="account-removal-title" className="h4 fw-bold">
                Confirmar acción
              </h2>
              <p id="account-removal-description">
                ¿Quitar a {pendingPet.nombre} de tus mascotas?
              </p>
              <div className="form-actions">
                <button
                  className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold"
                  type="button"
                  onClick={() => setPendingPet(null)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-delete px-4 py-2 rounded-pill fw-semibold"
                  type="button"
                  onClick={confirmPetRemoval}
                >
                  Quitar
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserPanel