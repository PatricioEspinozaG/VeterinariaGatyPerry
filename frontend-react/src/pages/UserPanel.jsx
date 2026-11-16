import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate } from 'react-router'
import AppointmentsList from '../components/AppointmentsList.jsx'
import { listAppointments } from '../services/citas.js'
import { listPetClinicalHistory } from '../services/clinica.js'
import { deletePet, listPets } from '../services/mascotas.js'
import { listOrders } from '../services/pedidos.js'
import { money } from '../utils/format.js'
import '../styles/app.css'

const sections = [
  { id: 'resumen', label: 'Resumen', path: '/mi-cuenta' },
  { id: 'compras', label: 'Mis compras', path: '/mi-cuenta/compras' },
  { id: 'mascotas', label: 'Mis mascotas', path: '/mi-cuenta/mascotas' },
  { id: 'citas', label: 'Mis citas', path: '/mi-cuenta/citas' },
  { id: 'historial', label: 'Historial clínico', path: '/mi-cuenta/historial' },
]

function formatClinicalDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Fecha no disponible'
    : date.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
}

function UserPanel({ currentUser, orders = [], setOrders, section = 'resumen' }) {
  const [pets, setPets] = useState([])
  const [petsLoading, setPetsLoading] = useState(true)
  const [petsError, setPetsError] = useState('')
  const [appointmentsCount, setAppointmentsCount] = useState(0)
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [appointmentsError, setAppointmentsError] = useState('')
  const [clinicalHistoryQuery, setClinicalHistoryQuery] = useState({
    key: '',
    items: [],
    error: '',
    loading: true,
  })
  const [ordersQuery, setOrdersQuery] = useState({
    key: '',
    items: [],
    error: '',
    loading: true,
  })
  const [pendingAction, setPendingAction] = useState(null)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const currentUserId = currentUser?.id
  const currentUserRole = currentUser?.role
  const ordersQueryKey = `${currentUserId || ''}:${section}`
  const currentOrdersQuery = ordersQuery.key === ordersQueryKey ? ordersQuery : null
  const backendOrders = currentOrdersQuery?.items || []
  const ordersLoading = !currentOrdersQuery || currentOrdersQuery.loading
  const ordersError = currentOrdersQuery?.error || ''
  const petIdsKey = pets.map((pet) => String(pet.id)).join(',')
  const clinicalHistoryKey = `${currentUserId || ''}:${petIdsKey}`
  const currentClinicalHistoryQuery = clinicalHistoryQuery.key === clinicalHistoryKey
    ? clinicalHistoryQuery
    : null
  const clinicalHistoryLoading = petsLoading
    || (!petsError && pets.length > 0
      && (!currentClinicalHistoryQuery || currentClinicalHistoryQuery.loading))
  const clinicalHistoryError = petsError || currentClinicalHistoryQuery?.error || ''

  useEffect(() => {
    if (!currentUserId || currentUserRole !== 'cliente') return undefined

    let active = true
    listPets()
      .then((items) => {
        if (active) {
          setPets(items)
          setPetsError('')
        }
      })
      .catch((error) => {
        if (active) setPetsError(error.message)
      })
      .finally(() => {
        if (active) setPetsLoading(false)
      })

    return () => {
      active = false
    }
  }, [currentUserId, currentUserRole])

  useEffect(() => {
    if (
      !currentUserId
      || currentUserRole !== 'cliente'
      || (section !== 'resumen' && section !== 'compras')
    ) {
      return undefined
    }

    let active = true
    listOrders()
      .then((items) => {
        if (active) {
          setOrdersQuery({
            key: ordersQueryKey,
            items,
            error: '',
            loading: false,
          })
        }
      })
      .catch((error) => {
        if (active) {
          setOrdersQuery({
            key: ordersQueryKey,
            items: [],
            error: error.message,
            loading: false,
          })
        }
      })

    return () => {
      active = false
    }
  }, [currentUserId, currentUserRole, ordersQueryKey, section])

  useEffect(() => {
    if (!currentUserId || currentUserRole !== 'cliente' || section !== 'resumen') {
      return undefined
    }

    let active = true
    listAppointments()
      .then((items) => {
        if (active) {
          setAppointmentsCount(items.length)
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
  }, [currentUserId, currentUserRole, section])

  useEffect(() => {
    if (
      !currentUserId
      || currentUserRole !== 'cliente'
      || section !== 'historial'
      || petsLoading
    ) {
      return undefined
    }

    const key = `${currentUserId}:${pets.map((pet) => String(pet.id)).join(',')}`
    if (petsError || pets.length === 0) return undefined

    let active = true
    Promise.all(pets.map(async (pet) => {
      const history = await listPetClinicalHistory(pet.id)
      return {
        petId: String(pet.id),
        petName: pet.nombre,
        records: history.registros,
      }
    }))
      .then((items) => {
        if (active) {
          setClinicalHistoryQuery({ key, items, error: '', loading: false })
        }
      })
      .catch((error) => {
        if (active) {
          setClinicalHistoryQuery({ key, items: [], error: error.message, loading: false })
        }
      })

    return () => {
      active = false
    }
  }, [currentUserId, currentUserRole, pets, petsError, petsLoading, section])

  if (!currentUser || currentUser.role !== 'cliente') return <Navigate to="/login" replace />

  const userId = String(currentUser.id)
  const email = currentUser.email?.toLowerCase()
  const customerName = [currentUser.nombre || currentUser.name, currentUser.apellidos || currentUser.lastName]
    .filter(Boolean)
    .join(' ')
  const localOrders = orders.filter((order) => (
    String(order.userId || '') === userId ||
    (!order.userId && order.delivery?.email?.toLowerCase() === email)
  ))
  const backendOrderIds = new Set(backendOrders.map((order) => String(order.id)))
  const userOrders = [
    ...backendOrders.map((order) => ({
      ...order,
      persisted: true,
      delivery: { method: order.deliveryMethod },
    })),
    ...localOrders.filter((order) => !backendOrderIds.has(String(order.id))),
  ]
  function requestRemoval(type, item) {
    setPendingAction({ type, item })
    setActionMessage('')
    setActionError('')
  }

  async function confirmRemoval() {
    if (!pendingAction) return

    if (pendingAction.type === 'compra') {
      setOrders((previous) => previous.filter((order) => order.id !== pendingAction.item.id))
      setActionMessage('La compra se quitó del historial.')
    } else {
      try {
        await deletePet(pendingAction.item.id)
      } catch (error) {
        setActionError(error.message)
        return
      }
      setPets((previous) => previous.filter((pet) => String(pet.id) !== String(pendingAction.item.id)))
      setActionMessage('La mascota se quitó de tu cuenta.')
    }

    setPendingAction(null)
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
                <div className="stat-card"><strong>Compras</strong><div className="stat-value">{ordersLoading ? '...' : userOrders.length}</div></div>
                <div className="stat-card"><strong>Mascotas</strong><div className="stat-value">{petsLoading ? '...' : pets.length}</div></div>
                <div className="stat-card"><strong>Citas</strong><div className="stat-value">{appointmentsLoading ? '...' : appointmentsCount}</div></div>
              </div>
              {petsError && <p className="admin-form-message error" role="alert">{petsError}</p>}
              {appointmentsError && <p className="admin-form-message error" role="alert">{appointmentsError}</p>}
              {ordersError && <p className="admin-form-message error" role="alert">{ordersError}</p>}
              <div className="user-panel-shortcuts">
                <Link className="button button-primary" to="/mi-cuenta/compras">Ver historial de compras</Link>
                <Link className="button button-secondary" to="/mi-cuenta/mascotas">Administrar mascotas</Link>
                <Link className="button button-secondary" to="/mi-cuenta/citas">Revisar mis citas</Link>
                <Link className="button button-secondary" to="/mi-cuenta/historial">Ver historial clínico</Link>
              </div>
            </section>
          )}

          {section === 'compras' && (
            <section className="admin-view-card card shadow border-0 rounded-4 p-4 bg-white full">
              <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7 mb-2 d-inline-block">
                HISTORIAL DE COMPRAS
              </span>
              <h2 className="h3 fw-bold text-dark">Mis compras</h2>
              {actionMessage && <p className="admin-form-message success" role="status">{actionMessage}</p>}
              {ordersError && <p className="admin-form-message error" role="alert">{ordersError}</p>}
              {ordersLoading ? (
                <p className="text-center py-5" role="status">Cargando tus compras...</p>
              ) : userOrders.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">Todavía no tienes compras registradas.</p>
                  <Link className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold" to="/productos">Ver productos</Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 user-mobile-card-table">
                    <thead className="table-light"><tr><th>Pedido</th><th>Fecha</th><th>Productos</th><th>Entrega</th><th>Total</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {userOrders.length === 0 && <tr><td colSpan="6" className="text-center text-secondary py-4">No hay compras registradas.</td></tr>}
                      {userOrders.map((order) => (
                        <tr key={order.id}>
                          <td data-label="Pedido"><Link to={`/compra/${order.id}`}>#{order.id}</Link></td>
                          <td data-label="Fecha">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-CL') : 'Sin fecha'}</td>
                          <td data-label="Productos">{(order.items || []).map((item) => `${item.name} × ${item.quantity}`).join(', ') || 'Detalle no disponible'}</td>
                          <td data-label="Entrega">{(order.delivery?.method ?? order.deliveryMethod) === 'envio' ? 'Envío' : 'Retiro en clínica'}</td>
                          <td className="fw-semibold" data-label="Total">{money(order.total || 0)}</td>
                          <td className="user-card-actions" data-label="Acciones">
                            {!order.persisted && (
                              <button className="btn btn-delete" type="button" onClick={() => requestRemoval('compra', order)}>Quitar</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {section === 'mascotas' && (
            <section className="admin-view-card card shadow border-0 rounded-4 p-4 bg-white full">
              <div className="admin-section-heading">
                <div>
                  <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7 mb-2 d-inline-block">MIS MASCOTAS</span>
                  <h2 className="h3 fw-bold text-dark">Mis mascotas</h2>
                </div>
                <Link className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold shadow-sm" to="/mascotas/nueva?returnTo=%2Fmi-cuenta%2Fmascotas">+ Agregar mascota</Link>
              </div>
              {actionMessage && <p className="admin-form-message success" role="status">{actionMessage}</p>}
              {actionError && <p className="admin-form-message error" role="alert">{actionError}</p>}
              {petsError && <p className="admin-form-message error" role="alert">{petsError}</p>}
              {petsLoading ? (
                <p className="text-center py-5" role="status">Cargando tus mascotas...</p>
              ) : petsError ? null : pets.length === 0 ? (
                <div className="text-center py-5"><p className="text-muted">Aún no registras mascotas.</p></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 user-mobile-card-table">
                    <thead className="table-light"><tr><th>Nombre</th><th>Especie</th><th>Raza</th><th>Edad</th><th>Notas</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {pets.length === 0 && <tr><td colSpan="6" className="text-center text-secondary py-4">Aún no registras mascotas.</td></tr>}
                      {pets.map((pet) => (
                        <tr key={pet.id}>
                          <td className="fw-semibold" data-label="Nombre">{pet.nombre}</td>
                          <td data-label="Especie">{pet.especie}</td>
                          <td data-label="Raza">{pet.raza}</td>
                          <td data-label="Edad">{pet.edad} años</td>
                          <td data-label="Notas">{pet.notas || '-'}</td>
                          <td className="user-card-actions" data-label="Acciones">
                            <button className="btn btn-delete" type="button" onClick={() => requestRemoval('mascota', pet)}>Quitar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {section === 'historial' && (
            <section className="admin-view-card card shadow border-0 rounded-4 p-4 bg-white full">
              <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7 mb-2 d-inline-block">
                SALUD DE TUS MASCOTAS
              </span>
              <h2 className="h3 fw-bold text-dark">Historial clínico</h2>
              {clinicalHistoryError && (
                <p className="admin-form-message error" role="alert">{clinicalHistoryError}</p>
              )}
              {clinicalHistoryLoading ? (
                <p className="text-center py-5" role="status">Cargando el historial clínico...</p>
              ) : clinicalHistoryError ? null : pets.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">Registra una mascota para consultar su historial clínico.</p>
                  <Link
                    className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold"
                    to="/mascotas/nueva?returnTo=%2Fmi-cuenta%2Fhistorial"
                  >
                    Agregar mascota
                  </Link>
                </div>
              ) : (
                <div className="d-grid gap-4">
                  {(currentClinicalHistoryQuery?.items || []).map((group) => (
                    <section key={group.petId} aria-labelledby={`historial-mascota-${group.petId}`}>
                      <h3 id={`historial-mascota-${group.petId}`} className="h5 fw-bold">
                        {group.petName}
                      </h3>
                      {group.records.length === 0 ? (
                        <p className="text-muted">Aún no hay registros clínicos para esta mascota.</p>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover align-middle mb-0 user-mobile-card-table">
                            <thead className="table-light">
                              <tr><th>Fecha</th><th>Registro</th><th>Detalle</th><th>Profesional</th><th>Estado</th></tr>
                            </thead>
                            <tbody>
                              {group.records.map((record) => (
                                <tr key={`${record.tipo}-${record.id}`}>
                                  <td data-label="Fecha">{formatClinicalDate(record.fecha)}</td>
                                  <td data-label="Registro">{record.tipo === 'VACUNA' ? 'Vacuna' : 'Atención'}</td>
                                  <td data-label="Detalle">
                                    <strong>
                                      {record.tipo === 'VACUNA'
                                        ? record.nombreVacuna || 'Vacuna registrada'
                                        : record.motivo || 'Atención registrada'}
                                    </strong>
                                    {record.diagnostico && <div>Diagnóstico: {record.diagnostico}</div>}
                                    {record.tratamiento && <div>Tratamiento: {record.tratamiento}</div>}
                                  </td>
                                  <td data-label="Profesional">{record.profesionalResponsable || '-'}</td>
                                  <td data-label="Estado">
                                    <span className={`badge rounded-pill ${record.estado === 'ACTIVA' ? 'text-bg-success' : 'text-bg-secondary'}`}>
                                      {record.estado === 'ACTIVA' ? 'Activa' : 'Anulada'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              )}
            </section>
          )}

          {section === 'citas' && (
            <AppointmentsList
              userRole={currentUser.role}
              currentUserId={currentUser.id}
              users={[currentUser]}
              returnTo="/mi-cuenta/citas"
              embedded
            />
          )}
        </div>
        {pendingAction && (
          <div className="overlay" role="presentation">
            <section className="overlay-panel admin-confirm-panel" role="alertdialog" aria-modal="true" aria-labelledby="account-removal-title" aria-describedby="account-removal-description">
              <h2 id="account-removal-title" className="h4 fw-bold">Confirmar acción</h2>
              <p id="account-removal-description">
                {pendingAction.type === 'compra'
                  ? `¿Quitar el pedido #${pendingAction.item.id} de tu historial?`
                  : `¿Quitar a ${pendingAction.item.nombre} de tus mascotas?`}
              </p>
              <div className="form-actions">
                <button className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold" type="button" onClick={() => setPendingAction(null)}>Cancelar</button>
                <button className="btn btn-delete px-4 py-2 rounded-pill fw-semibold" type="button" onClick={confirmRemoval}>Quitar</button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserPanel
