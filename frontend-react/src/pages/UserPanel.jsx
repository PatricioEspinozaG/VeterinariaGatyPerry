import { Link, NavLink, Navigate } from 'react-router'
import AppointmentsList from '../components/AppointmentsList.jsx'
import { readStorage } from '../services/storage.js'
import { money } from '../utils/format.js'
import '../styles/app.css'

const sections = [
  { id: 'resumen', label: 'Resumen', path: '/mi-cuenta' },
  { id: 'compras', label: 'Mis compras', path: '/mi-cuenta/compras' },
  { id: 'mascotas', label: 'Mis mascotas', path: '/mi-cuenta/mascotas' },
  { id: 'citas', label: 'Mis citas', path: '/mi-cuenta/citas' },
]

function UserPanel({ currentUser, orders = [], section = 'resumen' }) {
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
  const pets = readStorage('pets', []).filter((pet) => String(pet.userId) === userId)
  const appointments = readStorage('appointments', []).filter((appointment) => String(appointment.userId) === userId)

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
              {userOrders.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">Todavía no tienes compras registradas.</p>
                  <Link className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold" to="/productos">Ver productos</Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light"><tr><th>Pedido</th><th>Fecha</th><th>Productos</th><th>Entrega</th><th>Total</th></tr></thead>
                    <tbody>
                      {userOrders.map((order) => (
                        <tr key={order.id}>
                          <td><Link to={`/compra/${order.id}`}>#{order.id}</Link></td>
                          <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-CL') : 'Sin fecha'}</td>
                          <td>{(order.items || []).map((item) => `${item.name} × ${item.quantity}`).join(', ') || 'Detalle no disponible'}</td>
                          <td>{order.delivery?.method === 'envio' ? 'Envío' : 'Retiro en clínica'}</td>
                          <td className="fw-semibold">{money(order.total || 0)}</td>
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
              {pets.length === 0 ? (
                <div className="text-center py-5"><p className="text-muted">Aún no registras mascotas.</p></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light"><tr><th>Nombre</th><th>Especie</th><th>Raza</th><th>Edad</th><th>Notas</th></tr></thead>
                    <tbody>
                      {pets.map((pet) => (
                        <tr key={pet.id}><td className="fw-semibold">{pet.nombre}</td><td>{pet.especie}</td><td>{pet.raza}</td><td>{pet.edad} años</td><td>{pet.notas || '-'}</td></tr>
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
      </div>
    </div>
  )
}

export default UserPanel
