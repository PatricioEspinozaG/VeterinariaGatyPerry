import { Navigate, NavLink } from 'react-router'
import ManagedAppointmentsList from '../components/ManagedAppointmentsList.jsx'
import '../styles/app.css'

export default function ReceptionPanel({ currentUser, users = [] }) {
  if (!currentUser || currentUser.role !== 'recepcion') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="admin-panel reception-panel container">
      <div className="admin-header">
        <div className="admin-title">
          <h1>Panel de recepción</h1>
          <p className="muted">
            Recepción {currentUser.name || currentUser.nombre || currentUser.email}
          </p>
        </div>
      </div>

      <nav className="admin-nav" aria-label="Secciones de recepción">
        <NavLink
          to="/recepcion"
          end
          className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
        >
          Citas
        </NavLink>
        <NavLink to="/recepcion/pedidos" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
          Pedidos
        </NavLink>
      </nav>

      <div className="admin-main admin-main-background bg-vet-doodle">
        <div className="admin-main-content wide">
          <ManagedAppointmentsList users={users} />
        </div>
      </div>
    </div>
  )
}