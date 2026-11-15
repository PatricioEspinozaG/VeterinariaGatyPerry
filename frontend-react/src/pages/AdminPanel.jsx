import { useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import { getManagedAppointments } from '../services/appointmentsApi.js'
import AdminProductsList from '../components/AdminProductsList.jsx'
import AdminProductForm from '../components/AdminProductForm.jsx'
import ManagedAppointmentsList from '../components/ManagedAppointmentsList.jsx'
import { validateEmail } from '../utils/userValidation.js'
import { NavLink } from 'react-router'
import { createProduct, discontinueProduct, updateProduct } from '../services/productsApi.js'
import { createAdminUser, deactivateAdminUser, getAdminUsers, updateAdminUser } from '../services/adminUsersApi.js'
import '../styles/app.css'

const emptyUserForm = {
  name: '', lastName: '', run: '', email: '', phone: '', password: '',
  region: "O'Higgins", commune: 'Rancagua', address: '', role: 'cliente', active: true,
}

export default function AdminPanel({ products, setProducts, currentUser, section = 'productos' }) {
  const [editing, setEditing] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(false)
  const [deleteProductError, setDeleteProductError] = useState('')
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [pendingDeletion, setPendingDeletion] = useState(null)
  const [userForm, setUserForm] = useState(emptyUserForm)
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState('')
  const [savingUser, setSavingUser] = useState(false)
  const [userFormError, setUserFormError] = useState('')
  const [userFormSuccess, setUserFormSuccess] = useState('')
  const [managedAppointments, setManagedAppointments] = useState(null)

  useEffect(() => {
    const updateFloatingButtonPosition = () => {
      const footer = document.querySelector('.site-footer')
      const footerTop = footer?.getBoundingClientRect().top ?? window.innerHeight
      document.querySelectorAll('.admin-panel .fab-pill').forEach((button) => {
        const bottom = Number.parseFloat(window.getComputedStyle(button).bottom) || 0
        const desiredOffset = Math.max(0, window.innerHeight - footerTop - bottom + 12)
        const maxOffset = Math.max(0, window.innerHeight - bottom - button.offsetHeight - 16)
        const offset = Math.min(desiredOffset, maxOffset)
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
  useEffect(() => {
    if (currentUser?.role !== 'admin') return undefined
    let active = true
    getAdminUsers()
      .then((result) => { if (active) setUsers(result) })
      .catch((cause) => { if (active) setUsersError(cause.message || 'No pudimos cargar los usuarios.') })
      .finally(() => { if (active) setUsersLoading(false) })
    return () => { active = false }
  }, [currentUser?.role])

  useEffect(() => {
    if (currentUser?.role !== 'admin' || section === 'citas') {
      return undefined
    }

    let active = true

    getManagedAppointments()
      .then((appointments) => {
        if (active) setManagedAppointments(appointments)
      })
      .catch(() => {
        // El contador conserva “—” si no se pueden cargar las citas.
      })

    return () => {
      active = false
    }
  }, [currentUser?.role, section])

  if (!currentUser || currentUser.role !== 'admin') return <Navigate to="/login" replace />

  const unidades = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)
  const pendientes = managedAppointments === null
    ? '—'
    : managedAppointments.filter(
      (appointment) => appointment.estado === 'PENDIENTE',
    ).length

  async function handleCreate(product) {
    const created = await createProduct(product)
    setProducts((previous) => [created, ...previous])
    setOverlayOpen(false)
  }

  async function handleUpdate(code, updated) {
    const saved = await updateProduct(code, updated)
    setProducts((previous) =>
      previous.map((item) => (item.code === code ? saved : item)),
    )
    setEditing(null)
    setOverlayOpen(false)
  }

  function handleDelete(code) {
    const product = products.find((item) => item.code === code)
    setPendingDeletion({ type: 'producto', item: product || { code } })
  }

  async function handleUserFormSubmit(event) {
    event.preventDefault()
    setUserFormError('')
    setUserFormSuccess('')
    const emailError = validateEmail(userForm.email.trim())
    if (emailError) { setUserFormError(emailError); return }
    if (!editingUser && !userForm.run.trim()) { setUserFormError('El RUN es obligatorio.'); return }
    if (users.some((user) => user.id !== editingUser?.id && user.email?.toLowerCase() === userForm.email.trim().toLowerCase())) {
      setUserFormError('Ya existe un usuario con ese correo.')
      return
    }
    setSavingUser(true)
    try {
      if (editingUser) {
        const saved = await updateAdminUser(editingUser.id, userForm)
        setUsers((previous) => previous.map((user) => user.id === saved.id ? saved : user))
        setUserFormSuccess('Usuario actualizado correctamente.')
      } else {
        const created = await createAdminUser(userForm)
        setUsers((previous) => [created, ...previous])
        setUserFormSuccess('Usuario agregado correctamente.')
      }
      setShowUserForm(false)
      setEditingUser(null)
      setUserForm(emptyUserForm)
    } catch (cause) {
      setUserFormError(cause.message || 'No pudimos guardar el usuario.')
    } finally {
      setSavingUser(false)
    }
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

  async function confirmDeletion() {
    if (!pendingDeletion) return

    if (pendingDeletion.type === 'producto') {
      setDeletingProduct(true)
      setDeleteProductError('')

      try {
        await discontinueProduct(pendingDeletion.item.code)
        setProducts((previous) =>
          previous.map((product) =>
            product.code === pendingDeletion.item.code
              ? { ...product, status: 'Descontinuado' }
              : product,
          ),
        )
        setPendingDeletion(null)
      } catch (error) {
        setDeleteProductError(error.message || 'No pudimos descontinuar el producto.')
      } finally {
        setDeletingProduct(false)
      }
      return
    }

    setSavingUser(true)
    try {
      await deactivateAdminUser(pendingDeletion.item.id)
      setUsers((previous) => previous.map((user) => user.id === pendingDeletion.item.id ? { ...user, active: false } : user))
      setUserFormSuccess('Usuario desactivado correctamente.')
      setPendingDeletion(null)
    } catch (cause) {
      setUserFormError(cause.message || 'No pudimos desactivar el usuario.')
      setPendingDeletion(null)
    } finally {
      setSavingUser(false)
    }
  }

  function closeUserForm() {
    setShowUserForm(false)
    setEditingUser(null)
    setUserFormError('')
    setUserFormSuccess('')
  }

  const userFormContent = (
    <form className="admin-form admin-user-form" onSubmit={handleUserFormSubmit}>
      <label>Nombre<input value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} required maxLength="80" /></label>
      <label>Apellidos<input value={userForm.lastName} onChange={(event) => setUserForm({ ...userForm, lastName: event.target.value })} required maxLength="100" /></label>
      <label>RUN<input value={userForm.run} onChange={(event) => setUserForm({ ...userForm, run: event.target.value })} required readOnly={Boolean(editingUser)} maxLength="16" /></label>
      <label>Correo electrónico<input type="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} required maxLength="254" /></label>
      <label>Teléfono<input value={userForm.phone} onChange={(event) => setUserForm({ ...userForm, phone: event.target.value })} required maxLength="20" /></label>
      {!editingUser && <label>Contraseña<input type="password" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} required minLength="8" maxLength="64" autoComplete="new-password" /></label>}
      <label>Región<input value={userForm.region} onChange={(event) => setUserForm({ ...userForm, region: event.target.value })} required maxLength="80" /></label>
      <label>Comuna<input value={userForm.commune} onChange={(event) => setUserForm({ ...userForm, commune: event.target.value })} required maxLength="80" /></label>
      <label>Dirección<input value={userForm.address} onChange={(event) => setUserForm({ ...userForm, address: event.target.value })} maxLength="200" /></label>
      <label>Rol
        <select value={userForm.role} disabled={editingUser?.id === currentUser?.id} onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}>
          <option value="cliente">Cliente</option><option value="recepcion">Recepción</option><option value="admin">Administrador</option>
        </select>
      </label>
      <label>Estado
        <select value={userForm.active ? 'active' : 'inactive'} disabled={editingUser?.id === currentUser?.id} onChange={(event) => setUserForm({ ...userForm, active: event.target.value === 'active' })}>
          <option value="active">Activo</option><option value="inactive">Inactivo</option>
        </select>
      </label>
      {userFormError && <p className="admin-form-message error" role="alert">{userFormError}</p>}
      <div className="form-actions">
        <button className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold" disabled={savingUser} type="submit">{savingUser ? 'Guardando...' : editingUser ? 'Guardar cambios' : 'Crear usuario'}</button>
        <button className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold" type="button" disabled={savingUser} onClick={closeUserForm}>Cancelar</button>
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
            <div className="stat-value">{usersLoading || usersError ? '-' : users.length}</div>
          </div>
          <div className="stat-card">
            <strong>Citas pendientes</strong>
            <div className="stat-value">{pendientes}</div>
          </div>
        </div>
      </div>

      <div className="admin-main admin-main-background bg-vet-doodle">
        <div className={`admin-main-content${(section === 'citas' || (section === 'productos' && editing)) ? ' wide' : ''}`}>
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
                  setUserForm(emptyUserForm)
                  setUserFormError('')
                  setUserFormSuccess('')
                }}>
                  <span className="fab-plus" aria-hidden="true">+</span>
                  <span className="fab-label">{showUserForm && !editingUser ? 'Cancelar' : 'Agregar usuario'}</span>
                </button>
              </div>
              {userFormError && !showUserForm && <p className="admin-form-message error" role="alert">{userFormError}</p>}
              {userFormSuccess && <p className="admin-form-message success" role="status">{userFormSuccess}</p>}
              {usersError && <p className="admin-form-message error" role="alert">{usersError}</p>}
              {usersLoading && <p role="status">Cargando usuarios...</p>}
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
                                  run: user.run || '',
                                  phone: user.phone || '',
                                  region: user.region || '',
                                  commune: user.commune || '',
                                  address: user.address || '',
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
                              <button className="btn btn-delete" type="button" disabled={user.id === currentUser.id || !user.active} onClick={() => handleDeleteUser(user)}>Desactivar</button>
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
            <ManagedAppointmentsList
              users={users}
              onAppointmentsChange={setManagedAppointments}
            />
          )}
        </div>
      </div>

      {showUserForm && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="user-form-title">
          <div className="overlay-panel admin-edit-panel">
            <button className="overlay-close" type="button" onClick={closeUserForm} aria-label="Cerrar formulario de usuario">×</button>
            <h2 id="user-form-title" className="h4 fw-bold mb-3">{editingUser ? 'Editar usuario' : 'Nuevo usuario'}</h2>
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
              onCreate={handleCreate}
              onUpdate={handleUpdate}
              onCancel={() => { setOverlayOpen(false); setEditing(null) }}
            />
          </div>
        </div>
      )}

      {pendingDeletion && (
        <div className="overlay" role="presentation">
          <section
            className="overlay-panel admin-confirm-panel"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
            aria-describedby="delete-confirm-description"
          >
            <h2 id="delete-confirm-title" className="h4 fw-bold">
              {pendingDeletion.type === 'producto'
                ? 'Confirmar descontinuación'
                : 'Confirmar desactivación'}
            </h2>

            <p id="delete-confirm-description">
              {pendingDeletion.type === 'producto'
                ? `¿Descontinuar el producto "${pendingDeletion.item.name || pendingDeletion.item.code}"? Dejará de aparecer en el catálogo.`
                : `¿Desactivar al usuario "${[pendingDeletion.item.name, pendingDeletion.item.lastName].filter(Boolean).join(' ')}"? Podrá seguir figurando en el historial.`}
            </p>

            {deleteProductError && (
              <p className="admin-form-message error" role="alert">
                {deleteProductError}
              </p>
            )}

            <div className="form-actions">
              <button
                className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold"
                type="button"
                onClick={() => setPendingDeletion(null)}
                disabled={deletingProduct || savingUser}
              >
                Cancelar
              </button>
              <button
                className="btn btn-delete px-4 py-2 rounded-pill fw-semibold"
                type="button"
                onClick={confirmDeletion}
                disabled={deletingProduct || savingUser}
              >
                {deletingProduct
                  ? 'Procesando...'
                  : pendingDeletion.type === 'producto'
                    ? 'Descontinuar'
                    : 'Desactivar'}
              </button>
            </div>
          </section>
        </div>
      )}

    </div>
  )
}