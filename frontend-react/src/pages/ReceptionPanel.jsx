import { Navigate, NavLink } from 'react-router'
import AppointmentsList from '../components/AppointmentsList.jsx'
import '../styles/app.css'

export default function ReceptionPanel({ currentUser, users = [] }) {
  if (!currentUser || currentUser.role !== 'recepcion') return <Navigate to="/login" replace />

  return (
    <div className="admin-panel reception-panel container">
      <div className="admin-header">
        <div className="admin-title">
          <h1>Panel de recepción</h1>
          <p className="muted">Recepción {currentUser.name || currentUser.nombre || currentUser.email}</p>
        </div>
      </div>

      <nav className="admin-nav" aria-label="Secciones de recepción">
        <NavLink to="/recepcion" end className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
          Citas
        </NavLink>
      </nav>

      <div className="admin-main admin-main-background bg-vet-doodle">
        <div className="admin-main-content">
          <AppointmentsList userRole={currentUser.role} receptionMode users={users} />
        </div>
      </div>
    </div>
  )
}
