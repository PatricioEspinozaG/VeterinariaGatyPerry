import { useState } from 'react'
import { Link, NavLink, Navigate } from 'react-router'
import AppointmentsList from '../components/AppointmentsList.jsx'
import { readStorage, writeStorage } from '../services/storage.js'
import { money } from '../utils/format.js'
import '../styles/app.css'

const sections = [
  { id: 'resumen', label: 'Resumen', path: '/mi-cuenta' },
  { id: 'compras', label: 'Mis compras', path: '/mi-cuenta/compras' },
  { id: 'mascotas', label: 'Mis mascotas', path: '/mi-cuenta/mascotas' },
  { id: 'citas', label: 'Mis citas', path: '/mi-cuenta/citas' },
]

function UserPanel({ currentUser, orders = [], setOrders, section = 'resumen' }) {
  const [pets, setPets] = useState(() => (
    readStorage('pets', []).filter((pet) => String(pet.userId) === String(currentUser?.id))
  ))
  const [pendingAction, setPendingAction] = useState(null)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  if (!currentUser || currentUser.role !== 'cliente') return <Navigate to="/login" replace />

  const userId = String(currentUser.id)
  const email = currentUser.email?.toLowerCase()
  const customerName = [currentUser.nombre || currentUser.name, currentUser.apellidos || currentUser.lastName]
    .filter(Boolean)
    .join(' ')
  const userOrders = orders.filter((order) => (
    String(order.userId || '') === userId ||
    (!order.userId && order.delivery?.email?.toLowerCase() === email)
  ))
  const appointments = readStorage('appointments', []).filter((appointment) => String(appointment.userId) === userId)

  function requestRemoval(type, item) {
    setPendingAction({ type, item })
    setActionMessage('')
    setActionError('')
  }

  function confirmRemoval() {
    if (!pendingAction) return

    if (pendingAction.type === 'compra') {
      setOrders((previous) => previous.filter((order) => order.id !== pendingAction.item.id))
      setActionMessage('La compra se quitó del historial.')
    } else {
      const updatedPets = readStorage('pets', []).filter((pet) => (
        String(pet.userId) !== userId || String(pet.id) !== String(pendingAction.item.id)
      ))
      if (!writeStorage('pets', updatedPets)) {
        setActionError('No se pudo quitar la mascota en este navegador.')
        return
      }
      setPets(updatedPets.filter((pet) => String(pet.userId) === userId))
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
                <div className="stat-card"><strong>Compras</strong><div className="stat-value">{userOrders.length}</div></div>
                <div className="stat-card"><strong>Mascotas</strong><div className="stat-value">{pets.length}</div></div>
                <div className="stat-card"><strong>Citas</strong><div className="stat-value">{appointments.length}</div></div>
              </div>
              <div className="user-panel-shortcuts">
                <Link className="button button-primary" to="/mi-cuenta/compras">Ver historial de compras</Link>
                <Link className="button button-secondary" to="/mi-cuenta/mascotas">Administrar mascotas</Link>
                <Link className="button button-secondary" to="/mi-cuenta/citas">Revisar mis citas</Link>
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
              {userOrders.length === 0 ? (
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
                          <td data-label="Entrega">{order.delivery?.method === 'envio' ? 'Envío' : 'Retiro en clínica'}</td>
                          <td className="fw-semibold" data-label="Total">{money(order.total || 0)}</td>
                          <td className="user-card-actions" data-label="Acciones">
                            <button className="btn btn-delete" type="button" onClick={() => requestRemoval('compra', order)}>Quitar</button>
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
              {pets.length === 0 ? (
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
