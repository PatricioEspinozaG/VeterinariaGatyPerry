import { useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import { readStorage } from '../services/storage.js'
import { ensureDemoAppointment } from '../utils/appointments.js'
import AdminProductsList from '../components/AdminProductsList.jsx'
import AdminProductForm from '../components/AdminProductForm.jsx'
import AppointmentsList from '../components/AppointmentsList.jsx'
import { NavLink } from 'react-router'
import '../styles/app.css'

export default function AdminPanel({ products, setProducts, users, setUsers, currentUser, section = 'productos' }) {
  const [editing, setEditing] = useState(null)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [pendingDeletion, setPendingDeletion] = useState(null)
  const [userForm, setUserForm] = useState({ name: '', lastName: '', email: '', password: '', role: 'cliente', active: true })
  const [userFormError, setUserFormError] = useState('')
  const [userFormSuccess, setUserFormSuccess] = useState('')
  const [appointmentInitialization] = useState(() => (
    section === 'citas' && currentUser?.role === 'admin' ? ensureDemoAppointment(users) : null
  ))

  useEffect(() => {
    const updateFloatingButtonPosition = () => {
      const footer = document.querySelector('.site-footer')
      const footerTop = footer?.getBoundingClientRect().top ?? window.innerHeight
      document.querySelectorAll('.admin-panel .fab-pill').forEach((button) => {
        const bottom = Number.parseFloat(window.getComputedStyle(button).bottom) || 0
        const offset = Math.max(0, window.innerHeight - footerTop - bottom + 12)
        button.style.setProperty('--fab-footer-offset', `${offset}px`)
      })
    }

    updateFloatingButtonPosition()
    window.addEventListener('scroll', updateFloatingButtonPosition, { passive: true })
    window.addEventListener('resize', updateFloatingButtonPosition)
    return () => {
      window.removeEventListener('scroll', updateFloatingButtonPosition)
      window.removeEventListener('resize', updateFloatingButtonPosition)
    }
  }, [])

  if (!currentUser || currentUser.role !== 'admin') return <Navigate to="/login" replace />

  const unidades = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)
  const appointments = appointmentInitialization?.appointments || readStorage('appointments', []) || []
  const pendientes = Array.isArray(appointments)
    ? appointments.filter((a) => {
      const s = (a.status || a.estado || '').toString().toLowerCase()
      return s === 'pendiente' || s === 'pending' || s === 'pending' || s === ''
    }).length
    : 0

  function handleCreate(product) {
    setProducts((prev) => [product, ...prev])
  }

  function handleUpdate(code, updated) {
    setProducts((prev) => prev.map((p) => (p.code === code ? { ...p, ...updated } : p)))
    setEditing(null)
    setOverlayOpen(false)
  }

  function handleDelete(code) {
    const product = products.find((item) => item.code === code)
    setPendingDeletion({ type: 'producto', item: product || { code } })
  }

  function handleUserFormSubmit(event) {
    event.preventDefault()
    setUserFormError('')
    setUserFormSuccess('')

    const email = userForm.email.trim().toLowerCase()
    if (users.some((user) => user.id !== editingUser?.id && user.email?.toLowerCase() === email)) {
      setUserFormError('Ya existe un usuario con ese correo.')
      return
    }

    if (editingUser) {
      const isEditingCurrentUser = editingUser.id === currentUser.id
      const isRemovingActiveAdmin = editingUser.role === 'admin'
        && editingUser.active
        && (userForm.role !== 'admin' || !userForm.active)
      const activeAdmins = users.filter((user) => user.role === 'admin' && user.active).length

      if (isEditingCurrentUser && (userForm.role !== 'admin' || !userForm.active)) {
        setUserFormError('No puedes cambiar el rol ni desactivar tu propia cuenta de administrador.')
        return
      }
      if (isRemovingActiveAdmin && activeAdmins <= 1) {
        setUserFormError('Debe permanecer al menos un administrador activo.')
        return
      }

      const updatedUser = {
        ...editingUser,
        name: userForm.name.trim(),
        lastName: userForm.lastName.trim(),
        email,
        role: userForm.role,
        active: userForm.active,
        ...(userForm.password ? { password: userForm.password } : {}),
      }
      setUsers((previous) => previous.map((user) => (user.id === editingUser.id ? updatedUser : user)))
      setUserFormSuccess('Usuario actualizado correctamente.')
      setEditingUser(null)
      setShowUserForm(false)
      return
    }

    const newUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name: userForm.name.trim(),
      lastName: userForm.lastName.trim(),
      email,
      password: userForm.password,
      role: userForm.role,
      active: userForm.active,
    }
    setUsers((previous) => [newUser, ...previous])
    setUserForm({ name: '', lastName: '', email: '', password: '', role: 'cliente', active: true })
    setUserFormSuccess('Usuario agregado correctamente.')
  }

  function handleDeleteUser(user) {
    setUserFormError('')
    setUserFormSuccess('')

    if (user.id === currentUser.id) {
      setUserFormError('No puedes eliminar tu propia cuenta de administrador.')
      return
    }

    const activeAdmins = users.filter((item) => item.role === 'admin' && item.active).length
    if (user.role === 'admin' && user.active && activeAdmins <= 1) {
      setUserFormError('Debe permanecer al menos un administrador activo.')
      return
    }

    setPendingDeletion({ type: 'usuario', item: user })
  }

  function confirmDeletion() {
    if (!pendingDeletion) return
    if (pendingDeletion.type === 'producto') {
      setProducts((previous) => previous.filter((product) => product.code !== pendingDeletion.item.code))
    } else {
      setUsers((previous) => previous.filter((user) => user.id !== pendingDeletion.item.id))
      if (editingUser?.id === pendingDeletion.item.id) {
        setEditingUser(null)
        setShowUserForm(false)
      }
      setUserFormSuccess('Usuario eliminado correctamente.')
    }
    setPendingDeletion(null)
  }

  function closeUserForm() {
    setShowUserForm(false)
    setEditingUser(null)
    setUserFormError('')
    setUserFormSuccess('')
  }

  const userFormContent = (
    <form className="admin-form admin-user-form" onSubmit={handleUserFormSubmit}>
      {!editingUser && <h3 className="h5 fw-bold mb-0">Nuevo usuario</h3>}
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
        <input type="password" name="password" minLength="8" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} required={!editingUser} autoComplete="new-password" />
        {editingUser && <small className="text-secondary">Déjala en blanco para conservar la contraseña actual.</small>}
      </label>
      <label>Rol
        <select name="role" value={userForm.role} disabled={editingUser?.id === currentUser?.id} onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}>
          <option value="cliente">Cliente</option>
          <option value="recepcion">Recepción</option>
          <option value="admin">Administrador</option>
        </select>
      </label>
      <label>Estado
        <select name="active" value={userForm.active ? 'active' : 'inactive'} disabled={editingUser?.id === currentUser?.id} onChange={(event) => setUserForm({ ...userForm, active: event.target.value === 'active' })}>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </label>
      {userFormError && <p className="admin-form-message error" role="alert">{userFormError}</p>}
      <div className="form-actions">
        <button className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold shadow-sm" type="submit">{editingUser ? 'Guardar cambios' : 'Crear usuario'}</button>
        <button className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold" type="button" onClick={closeUserForm}>Cancelar</button>
      </div>
    </form>
  )

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
                  <button
                    className="fab-pill"
                    aria-label="Nuevo Producto"
                    onClick={() => { setEditing(null); setOverlayOpen(true) }}
                  >
                    <span className="fab-plus" aria-hidden="true">+</span>
                    <span className="fab-label">Nuevo Producto</span>
                  </button>
                </div>
                <AdminProductsList products={products} onEdit={(p) => { setEditing(p); setOverlayOpen(true) }} onDelete={handleDelete} />
              </div>
            </>
          )}
          {section === 'usuarios' && (
            <section className="admin-left admin-view-card card shadow border-0 rounded-4 p-4 bg-white full">
              <div className="admin-section-heading">
                <div>
                  <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7 mb-2 d-inline-block">INFORMACIÓN DE USUARIOS</span>
                  <h2 className="h3 fw-bold text-dark">Usuarios registrados</h2>
                </div>
                <button className="fab-pill" type="button" aria-label={showUserForm && !editingUser ? 'Cancelar creación de usuario' : 'Agregar usuario'} onClick={() => {
                  setShowUserForm((shown) => !shown)
                  setEditingUser(null)
                  setUserForm({ name: '', lastName: '', email: '', password: '', role: 'cliente', active: true })
                  setUserFormError('')
                  setUserFormSuccess('')
                }}>
                  <span className="fab-plus" aria-hidden="true">+</span>
                  <span className="fab-label">{showUserForm && !editingUser ? 'Cancelar' : 'Agregar usuario'}</span>
                </button>
              </div>
              {showUserForm && !editingUser && userFormContent}
              {userFormError && !editingUser && <p className="admin-form-message error" role="alert">{userFormError}</p>}
              {userFormSuccess && <p className="admin-form-message success" role="status">{userFormSuccess}</p>}
              <div className="admin-table">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 admin-users-table">
                    <thead className="table-light">
                      <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                      {users.length === 0 && <tr><td colSpan="5" className="text-center text-secondary py-4">No hay usuarios registrados.</td></tr>}
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td data-label="Nombre">{[user.name, user.lastName].filter(Boolean).join(' ') || '-'}</td>
                          <td data-label="Correo">{user.email || '-'}</td>
                          <td data-label="Rol"><span className="badge rounded-pill admin-user-role">{user.role === 'admin' ? 'Administrador' : user.role === 'recepcion' ? 'Recepción' : 'Cliente'}</span></td>
                          <td data-label="Estado"><span className={`badge rounded-pill ${user.active !== false ? 'text-bg-success' : 'text-bg-secondary'}`}>{user.active !== false ? 'Activo' : 'Inactivo'}</span></td>
                          <td className="action-cell" data-label="Acciones">
                            <div className="action-buttons">
                              <button className="btn btn-edit" type="button" onClick={() => {
                                setEditingUser(user)
                                setUserForm({
                                  name: user.name || '',
                                  lastName: user.lastName || '',
                                  email: user.email || '',
                                  password: '',
                                  role: user.role || 'cliente',
                                  active: user.active !== false,
                                })
                                setShowUserForm(true)
                                setUserFormError('')
                                setUserFormSuccess('')
                              }}>Editar</button>
                              <button className="btn btn-delete" type="button" disabled={user.id === currentUser.id} onClick={() => handleDeleteUser(user)}>Eliminar</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
          {section === 'citas' && (
            <>
              {appointmentInitialization?.error && <p className="admin-form-message error" role="alert">{appointmentInitialization.error}</p>}
              <AppointmentsList userRole="admin" adminMode users={users} initialAppointments={appointments} />
            </>
          )}
        </div>
      </div>

      {showUserForm && editingUser && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="user-edit-title">
          <div className="overlay-panel admin-edit-panel">
            <button className="overlay-close" type="button" onClick={closeUserForm} aria-label="Cerrar edición de usuario">×</button>
            <h2 id="user-edit-title" className="h4 fw-bold mb-3">Editar usuario</h2>
            {userFormContent}
          </div>
        </div>
      )}

      {overlayOpen && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby={editing ? 'product-edit-title' : 'product-create-title'}>
          <div className="overlay-panel admin-edit-panel">
            <button className="overlay-close" type="button" onClick={() => { setOverlayOpen(false); setEditing(null) }} aria-label="Cerrar">×</button>
            <h2 id={editing ? 'product-edit-title' : 'product-create-title'} className="h4 fw-bold mb-3">{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
            <AdminProductForm
              key={editing?.code || 'new'}
              product={editing}
              onCreate={(p) => { handleCreate(p); setOverlayOpen(false) }}
              onUpdate={(code, upd) => { handleUpdate(code, upd); setOverlayOpen(false) }}
              onCancel={() => { setOverlayOpen(false); setEditing(null) }}
            />
          </div>
        </div>
      )}

      {pendingDeletion && (
        <div className="overlay" role="presentation">
          <section className="overlay-panel admin-confirm-panel" role="alertdialog" aria-modal="true" aria-labelledby="delete-confirm-title" aria-describedby="delete-confirm-description">
            <h2 id="delete-confirm-title" className="h4 fw-bold">Confirmar eliminación</h2>
            <p id="delete-confirm-description">
              ¿Eliminar {pendingDeletion.type === 'producto'
                ? `el producto “${pendingDeletion.item.name || pendingDeletion.item.code}”`
                : `al usuario “${[pendingDeletion.item.name, pendingDeletion.item.lastName].filter(Boolean).join(' ')}”`}?
              {' '}Esta acción no se puede deshacer.
            </p>
            <div className="form-actions">
              <button className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold" type="button" onClick={() => setPendingDeletion(null)}>Cancelar</button>
              <button className="btn btn-delete px-4 py-2 rounded-pill fw-semibold" type="button" onClick={confirmDeletion}>Eliminar</button>
            </div>
          </section>
        </div>
      )}

    </div>
  )
}