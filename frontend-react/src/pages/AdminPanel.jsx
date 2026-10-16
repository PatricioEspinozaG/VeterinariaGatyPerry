import { useState } from 'react'
import { Navigate } from 'react-router'
import { readStorage } from '../services/storage.js'
import AdminProductsList from '../components/AdminProductsList.jsx'
import AdminProductForm from '../components/AdminProductForm.jsx'
import AppointmentsList from '../components/AppointmentsList.jsx'
import { NavLink } from 'react-router'
import '../styles/app.css'

export default function AdminPanel({ products, setProducts, users, currentUser, section = 'productos' }) {
  if (!currentUser || currentUser.role !== 'admin') return <Navigate to="/login" replace />

  const [editing, setEditing] = useState(null)
  const [showFab, setShowFab] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [userForm, setUserForm] = useState({ name: '', lastName: '', email: '', password: '', role: 'cliente' })
  const [userFormError, setUserFormError] = useState('')
  const [userFormSuccess, setUserFormSuccess] = useState('')

  const unidades = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)
  const appointments = readStorage('appointments', []) || []
  const pendientes = Array.isArray(appointments)
    ? appointments.filter((a) => {
        const s = (a.status || a.estado || '').toString().toLowerCase()
        return s === 'pendiente' || s === 'pending' || s === 'pending' || s === ''
      }).length
    : 0

  function handleCreate(product) {
    setProducts((prev) => [product, ...prev])
    // mostrar el FAB al crear un producto por primera vez (y conservarlo)
    setShowFab(true)
  }

  function handleUpdate(code, updated) {
    setProducts((prev) => prev.map((p) => (p.code === code ? { ...p, ...updated } : p)))
    setEditing(null)
  }

  function handleDelete(code) {
    if (!confirm('¿Eliminar producto?')) return
    setProducts((prev) => prev.filter((p) => p.code !== code))
  }

  function handleCreateUser(event) {
    event.preventDefault()
    setUserFormError('')
    setUserFormSuccess('')

    const email = userForm.email.trim().toLowerCase()
    if (users.some((user) => user.email?.toLowerCase() === email)) {
      setUserFormError('Ya existe un usuario con ese correo.')
      return
    }

    const newUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name: userForm.name.trim(),
      lastName: userForm.lastName.trim(),
      email,
      password: userForm.password,
      role: userForm.role,
      active: true,
    }
    setUsers((previous) => [newUser, ...previous])
    setUserForm({ name: '', lastName: '', email: '', password: '', role: 'cliente' })
    setUserFormSuccess('Usuario agregado correctamente.')
  }

  return (
    <div className="admin-panel container">
      <div className="admin-header">
        <div className="admin-title">
          <h1>Panel de administración</h1>
          <p className="muted">Administrador {currentUser.name} · {currentUser.role}</p>
        </div>
      </div>

      <nav className="admin-nav" aria-label="Secciones de administración">
        <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>Productos</NavLink>
        <NavLink to="/admin/usuarios" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>Usuarios</NavLink>
        <NavLink to="/admin/citas" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>Citas</NavLink>
      </nav>

      <div className="admin-hero">
        <div className="admin-badges">
          <div className="stat-card">
            <strong>Productos</strong>
            <div className="stat-value">{products.length}</div>
          </div>
          <div className="stat-card">
            <strong>Unidades</strong>
            <div className="stat-value">{unidades}</div>
          </div>
          <div className="stat-card">
            <strong>Usuarios</strong>
            <div className="stat-value">{users.length}</div>
          </div>
          <div className="stat-card">
            <strong>Citas pendientes</strong>
            <div className="stat-value">{pendientes}</div>
          </div>
        </div>
      </div>

      <div className="admin-main admin-main-background bg-vet-doodle">
        <div className={`admin-main-content${section === 'productos' && editing ? ' wide' : ''}`}>
        {section === 'productos' && (
          <>
            <div className={`admin-left admin-view-card card shadow border-0 rounded-4 p-4 bg-white ${!editing ? 'full' : ''}`}>
              <div className="admin-section-heading">
                <div>
                  <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7 mb-2 d-inline-block">INFORMACIÓN DE PRODUCTOS</span>
                  <h2 className="h3 fw-bold text-dark">Productos registrados</h2>
                </div>
              </div>
              <AdminProductsList products={products} onEdit={(p) => setEditing(p)} onDelete={handleDelete} />
            </div>
            {editing && (
              <aside className="admin-right card shadow border-0 rounded-4 bg-white">
                <h3>Editar producto</h3>
                <AdminProductForm
                  key={editing.code}
                  product={editing}
                  onCreate={handleCreate}
                  onUpdate={handleUpdate}
                  onCancel={() => setEditing(null)}
                />
              </aside>
            )}
          </>
        )}
        {section === 'usuarios' && (
          <section className="admin-left admin-view-card card shadow border-0 rounded-4 p-4 bg-white full">
            <div className="admin-section-heading">
              <div>
                <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7 mb-2 d-inline-block">INFORMACIÓN DE USUARIOS</span>
                <h2 className="h3 fw-bold text-dark">Usuarios registrados</h2>
              </div>
              <button className={showUserForm ? 'btn btn-outline-secondary' : 'btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold shadow-sm'} type="button" onClick={() => { setShowUserForm((shown) => !shown); setUserFormError(''); setUserFormSuccess('') }}>
                {showUserForm ? 'Cancelar' : 'Agregar usuario'}
              </button>
            </div>
            {showUserForm && (
              <form className="admin-form admin-user-form" onSubmit={handleCreateUser}>
                <label>Nombre
                  <input name="name" value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} required />
                </label>
                <label>Apellidos
                  <input name="lastName" value={userForm.lastName} onChange={(event) => setUserForm({ ...userForm, lastName: event.target.value })} required />
                </label>
                <label>Correo electrónico
                  <input type="email" name="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} required />
                </label>
                <label>Contraseña
                  <input type="password" name="password" minLength="8" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} required />
                </label>
                <label>Rol
                  <select name="role" value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}>
                    <option value="cliente">Cliente</option>
                    <option value="recepcion">Recepción</option>
                    <option value="admin">Administrador</option>
                  </select>
                </label>
                {userFormError && <p className="admin-form-message error" role="alert">{userFormError}</p>}
                {userFormSuccess && <p className="admin-form-message success" role="status">{userFormSuccess}</p>}
                <div className="form-actions">
                  <button className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold shadow-sm" type="submit">Guardar usuario</button>
                </div>
              </form>
            )}
            <div className="admin-table">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{[user.name, user.lastName].filter(Boolean).join(' ') || '-'}</td>
                      <td>{user.email || '-'}</td>
                      <td>{user.role || 'cliente'}</td>
                      <td>{user.active ? 'Activo' : 'Inactivo'}</td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
        {section === 'citas' && <AppointmentsList userRole="admin" adminMode users={users} />}
        </div>
      </div>

      {/* Floating action pill: reemplaza la acción de crear en la sidebar */}
      {section === 'productos' && (
        <button
          className="fab-pill"
          aria-label="Nuevo Producto"
          onClick={() => { setOverlayOpen(true); setEditing(null); setShowFab(true) }}
        >
          <span className="fab-plus">+</span>
          <span className="fab-label">Nuevo Producto</span>
        </button>
      )}

      {/* Overlay modal para crear/editar producto usando el mismo formulario */}
      {overlayOpen && (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="overlay-panel">
            <button className="overlay-close" onClick={() => setOverlayOpen(false)} aria-label="Cerrar">×</button>
            <AdminProductForm
              product={null}
              onCreate={(p) => { handleCreate(p); setOverlayOpen(false) }}
              onUpdate={(code, upd) => { handleUpdate(code, upd); setOverlayOpen(false) }}
              onCancel={() => setOverlayOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
