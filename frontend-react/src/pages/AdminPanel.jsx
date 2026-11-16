import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import AdminProductsList from '../components/AdminProductsList.jsx'
import AdminProductForm from '../components/AdminProductForm.jsx'
import AppointmentsList from '../components/AppointmentsList.jsx'
import {
  createProduct,
  discontinueProduct,
  listManagedProducts,
  updateProduct,
} from '../services/productos.js'
import { listManagedAppointments } from '../services/citas.js'
import {
  createAdminUser,
  deactivateAdminUser,
  listAdminUsers,
  updateAdminUser,
} from '../services/adminUsuarios.js'
import { validateEmail, validateUser } from '../utils/userValidation.js'
import { NavLink } from 'react-router'
import '../styles/app.css'

export default function AdminPanel({
  products,
  setProducts,
  onCatalogRefresh,
  onCurrentUserUpdate,
  currentUser,
  section = 'productos',
}) {
  const [editing, setEditing] = useState(null)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [productsLoading, setProductsLoading] = useState(section === 'productos')
  const [productsLoadError, setProductsLoadError] = useState('')
  const [productActionError, setProductActionError] = useState('')
  const [productDeleteLoading, setProductDeleteLoading] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [pendingDeletion, setPendingDeletion] = useState(null)
  const [adminUsers, setAdminUsers] = useState([])
  const [adminUsersLoading, setAdminUsersLoading] = useState(true)
  const [adminUsersLoadError, setAdminUsersLoadError] = useState('')
  const [userActionLoading, setUserActionLoading] = useState(false)
  const [userForm, setUserForm] = useState({
    name: '',
    lastName: '',
    run: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    region: 'Valparaíso',
    comuna: 'Valparaíso',
    direccion: '',
    role: 'cliente',
    active: true,
  })
  const [userFormError, setUserFormError] = useState('')
  const [userFormSuccess, setUserFormSuccess] = useState('')
  const [appointments, setAppointments] = useState([])
  const [appointmentsLoadError, setAppointmentsLoadError] = useState('')
  const handleAppointmentsChange = useCallback((items) => {
    setAppointments(items)
    setAppointmentsLoadError('')
  }, [])

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

  useEffect(() => {
    if (section !== 'productos' || currentUser?.role !== 'admin') return undefined

    let active = true
    listManagedProducts()
      .then((items) => {
        if (active) {
          setProducts(items)
          setProductsLoadError('')
        }
      })
      .catch((error) => {
        if (active) setProductsLoadError(error.message)
      })
      .finally(() => {
        if (active) setProductsLoading(false)
      })

    return () => {
      active = false
    }
  }, [currentUser?.role, section, setProducts])

  useEffect(() => {
    if (currentUser?.role !== 'admin') return undefined

    let active = true
    listManagedAppointments()
      .then((items) => {
        if (active) {
          setAppointments(items)
          setAppointmentsLoadError('')
        }
      })
      .catch((error) => {
        if (active) setAppointmentsLoadError(error.message)
      })

    return () => {
      active = false
    }
  }, [currentUser?.role])

  useEffect(() => {
    if (currentUser?.role !== 'admin') return undefined

    let active = true
    listAdminUsers()
      .then((items) => {
        if (active) {
          setAdminUsers(items)
          setAdminUsersLoadError('')
        }
      })
      .catch((error) => {
        if (active) setAdminUsersLoadError(error.message)
      })
      .finally(() => {
        if (active) setAdminUsersLoading(false)
      })

    return () => {
      active = false
    }
  }, [currentUser?.role])

  if (!currentUser || currentUser.role !== 'admin') return <Navigate to="/login" replace />

  const unidades = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)
  const pendientes = Array.isArray(appointments)
    ? appointments.filter((a) => {
      const s = (a.status || a.estado || '').toString().toLowerCase()
    return s === 'pendiente' || s === 'pending' || s === ''
    }).length
    : 0

  async function refreshCatalog() {
    if (!onCatalogRefresh) return
    try {
      await onCatalogRefresh()
    } catch (error) {
      setProductActionError(
        `El cambio se guardó, pero no se pudo actualizar la tienda: ${error.message}`,
      )
    }
  }

  async function handleCreate(product) {
    setProductActionError('')
    const created = await createProduct(product)
    setProducts((previous) => [
      created,
      ...previous.filter((item) => item.code !== created.code),
    ])
    setOverlayOpen(false)
    await refreshCatalog()
  }

  async function handleUpdate(code, updated) {
    setProductActionError('')
    const saved = await updateProduct(code, updated)
    setProducts((previous) => previous.map((product) => (
      product.code === code ? saved : product
    )))
    setEditing(null)
    setOverlayOpen(false)
    await refreshCatalog()
  }

  function handleDelete(code) {
    setProductActionError('')
    const product = products.find((item) => item.code === code)
    setPendingDeletion({ type: 'producto', item: product || { code } })
  }

  async function handleUserFormSubmit(event) {
    event.preventDefault()
    setUserFormError('')
    setUserFormSuccess('')

    const email = userForm.email.trim().toLowerCase()
    const emailError = validateEmail(email)
    if (emailError) {
      setUserFormError(emailError)
      return
    }
    if (adminUsers.some((user) => user.id !== editingUser?.id && user.email?.toLowerCase() === email)) {
      setUserFormError('Ya existe un usuario con ese correo.')
      return
    }

    if (editingUser) {
      const isEditingCurrentUser = editingUser.id === currentUser.id
      const isRemovingActiveAdmin = editingUser.role === 'admin'
        && editingUser.active
        && (userForm.role !== 'admin' || !userForm.active)
      const activeAdmins = adminUsers.filter((user) => user.role === 'admin' && user.active).length

      if (isEditingCurrentUser && (userForm.role !== 'admin' || !userForm.active)) {
        setUserFormError('No puedes cambiar el rol ni desactivar tu propia cuenta de administrador.')
        return
      }
      if (isRemovingActiveAdmin && activeAdmins <= 1) {
        setUserFormError('Debe permanecer al menos un administrador activo.')
        return
      }

      setUserActionLoading(true)
      try {
        const updatedUser = await updateAdminUser(editingUser.id, {
          nombre: userForm.name.trim(),
          apellidos: userForm.lastName.trim(),
          email,
          telefono: userForm.telefono.trim(),
          region: userForm.region,
          comuna: userForm.comuna,
          direccion: userForm.direccion.trim() || null,
          rol: userForm.role.toUpperCase(),
          activo: userForm.active,
        })
        setAdminUsers((previous) => previous.map((user) => (
          user.id === editingUser.id ? updatedUser : user
        )))
        if (editingUser.id === currentUser.id) {
          onCurrentUserUpdate?.(updatedUser)
        }
        setUserFormSuccess('Usuario actualizado correctamente.')
        setEditingUser(null)
        setShowUserForm(false)
      } catch (error) {
        setUserFormError(error.message)
      } finally {
        setUserActionLoading(false)
      }
      return
    }

    const validationErrors = validateUser({
      nombre: userForm.name,
      apellidos: userForm.lastName,
      run: userForm.run,
      email,
      telefono: userForm.telefono,
      password: userForm.password,
      confirmPassword: userForm.confirmPassword,
      region: userForm.region,
      comuna: userForm.comuna,
    }, adminUsers)
    if (Object.keys(validationErrors).length > 0) {
      setUserFormError(
        validationErrors.general || Object.values(validationErrors)[0],
      )
      return
    }

    setUserActionLoading(true)
    try {
      const createdUser = await createAdminUser({
        nombre: userForm.name.trim(),
        apellidos: userForm.lastName.trim(),
        run: userForm.run.trim(),
        email,
        telefono: userForm.telefono.trim(),
        password: userForm.password,
        confirmPassword: userForm.confirmPassword,
        region: userForm.region,
        comuna: userForm.comuna,
        direccion: userForm.direccion.trim() || null,
        rol: userForm.role.toUpperCase(),
        activo: userForm.active,
      })
      setAdminUsers((previous) => [createdUser, ...previous])
      setUserForm({
        name: '',
        lastName: '',
        run: '',
        email: '',
        telefono: '',
        password: '',
        confirmPassword: '',
        region: 'Valparaíso',
        comuna: 'Valparaíso',
        direccion: '',
        role: 'cliente',
        active: true,
      })
      setUserFormSuccess('Usuario agregado correctamente.')
    } catch (error) {
      setUserFormError(error.message)
    } finally {
      setUserActionLoading(false)
    }
  }

  function handleDeleteUser(user) {
    setUserFormError('')
    setUserFormSuccess('')

    if (user.id === currentUser.id) {
      setUserFormError('No puedes desactivar tu propia cuenta de administrador.')
      return
    }

    const activeAdmins = adminUsers.filter((item) => item.role === 'admin' && item.active).length
    if (user.role === 'admin' && user.active && activeAdmins <= 1) {
      setUserFormError('Debe permanecer al menos un administrador activo.')
      return
    }

    setPendingDeletion({ type: 'usuario', item: user })
  }

  async function confirmDeletion() {
    if (!pendingDeletion) return
    if (pendingDeletion.type === 'producto') {
      setProductActionError('')
      setProductDeleteLoading(true)
      try {
        await discontinueProduct(pendingDeletion.item.code)
        setProducts((previous) => previous.map((product) => (
          product.code === pendingDeletion.item.code
            ? { ...product, status: 'Descontinuado' }
            : product
        )))
        setPendingDeletion(null)
        await refreshCatalog()
      } catch (error) {
        setProductActionError(error.message)
      } finally {
        setProductDeleteLoading(false)
      }
      return
    }

    setUserActionLoading(true)
    try {
      await deactivateAdminUser(pendingDeletion.item.id)
      setAdminUsers((previous) => previous.map((user) => (
        user.id === pendingDeletion.item.id ? { ...user, active: false, activo: false } : user
      )))
      if (editingUser?.id === pendingDeletion.item.id) {
        setEditingUser(null)
        setShowUserForm(false)
      }
      setUserFormSuccess('Usuario desactivado correctamente.')
      setPendingDeletion(null)
    } catch (error) {
      setUserFormError(error.message)
    } finally {
      setUserActionLoading(false)
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
      {!editingUser && <h3 className="h5 fw-bold mb-0">Nuevo usuario</h3>}
      <label>Nombre
        <input name="name" value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} required />
      </label>
      <label>Apellidos
        <input name="lastName" value={userForm.lastName} onChange={(event) => setUserForm({ ...userForm, lastName: event.target.value })} required />
      </label>
      <label>RUN
        <input name="run" value={userForm.run} onChange={(event) => setUserForm({ ...userForm, run: event.target.value })} required={!editingUser} readOnly={Boolean(editingUser)} />
      </label>
      <label>Correo electrónico
        <input type="email" name="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} required />
      </label>
      <label>Teléfono de contacto
        <input type="tel" name="telefono" value={userForm.telefono} onChange={(event) => setUserForm({ ...userForm, telefono: event.target.value })} required />
      </label>
      {!editingUser && (
        <>
          <label>Contraseña
            <input type="password" name="password" minLength="8" maxLength="64" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} required autoComplete="new-password" />
          </label>
          <label>Confirmar contraseña
            <input type="password" name="confirmPassword" minLength="8" maxLength="64" value={userForm.confirmPassword} onChange={(event) => setUserForm({ ...userForm, confirmPassword: event.target.value })} required autoComplete="new-password" />
          </label>
        </>
      )}
      <label>Región
        <select name="region" value={userForm.region} onChange={(event) => setUserForm({ ...userForm, region: event.target.value })} required>
          <option value="Valparaíso">Valparaíso</option>
          <option value="Metropolitana">Metropolitana</option>
          <option value="O'Higgins">O'Higgins</option>
        </select>
      </label>
      <label>Comuna
        <select name="comuna" value={userForm.comuna} onChange={(event) => setUserForm({ ...userForm, comuna: event.target.value })} required>
          <option value="Valparaíso">Valparaíso</option>
          <option value="Viña del Mar">Viña del Mar</option>
          <option value="Quilpué">Quilpué</option>
          <option value="Rancagua">Rancagua</option>
          <option value="Santiago">Santiago</option>
        </select>
      </label>
      <label>Dirección
        <input name="direccion" value={userForm.direccion} onChange={(event) => setUserForm({ ...userForm, direccion: event.target.value })} />
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
        <button className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold shadow-sm" type="submit" disabled={userActionLoading}>{userActionLoading ? 'Guardando...' : editingUser ? 'Guardar cambios' : 'Crear usuario'}</button>
        <button className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold" type="button" onClick={closeUserForm} disabled={userActionLoading}>Cancelar</button>
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
        {appointmentsLoadError && (
          <p className="admin-form-message error" role="alert">{appointmentsLoadError}</p>
        )}
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
            <div className="stat-value">{adminUsers.length}</div>
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
                    disabled={productsLoading || Boolean(productsLoadError)}
                    onClick={() => { setEditing(null); setOverlayOpen(true) }}
                  >
                    <span className="fab-plus" aria-hidden="true">+</span>
                    <span className="fab-label">Nuevo Producto</span>
                  </button>
                </div>
                {productsLoadError && <p className="admin-form-message error" role="alert">{productsLoadError}</p>}
                {productActionError && !pendingDeletion && <p className="admin-form-message error" role="alert">{productActionError}</p>}
                {productsLoading ? (
                  <p className="text-center py-5" role="status">Cargando productos de administración...</p>
                ) : !productsLoadError ? (
                  <AdminProductsList
                    products={products}
                    onEdit={(product) => { setEditing(product); setOverlayOpen(true) }}
                    onDelete={handleDelete}
                  />
                ) : null}
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
                <button className="fab-pill" type="button" aria-label={showUserForm && !editingUser ? 'Cancelar creación de usuario' : 'Agregar usuario'} disabled={adminUsersLoading || Boolean(adminUsersLoadError)} onClick={() => {
                  setShowUserForm((shown) => !shown)
                  setEditingUser(null)
                  setUserForm({
                    name: '',
                    lastName: '',
                    run: '',
                    email: '',
                    telefono: '',
                    password: '',
                    confirmPassword: '',
                    region: 'Valparaíso',
                    comuna: 'Valparaíso',
                    direccion: '',
                    role: 'cliente',
                    active: true,
                  })
                  setUserFormError('')
                  setUserFormSuccess('')
                }}>
                  <span className="fab-plus" aria-hidden="true">+</span>
                  <span className="fab-label">{showUserForm && !editingUser ? 'Cancelar' : 'Agregar usuario'}</span>
                </button>
              </div>
              {adminUsersLoadError && <p className="admin-form-message error" role="alert">{adminUsersLoadError}</p>}
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
                      {adminUsersLoading && <tr><td colSpan="5" className="text-center text-secondary py-4" role="status">Cargando usuarios...</td></tr>}
                      {!adminUsersLoading && !adminUsersLoadError && adminUsers.length === 0 && <tr><td colSpan="5" className="text-center text-secondary py-4">No hay usuarios registrados.</td></tr>}
                      {adminUsers.map((user) => (
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
                                  run: user.run || '',
                                  email: user.email || '',
                                  telefono: user.telefono || '',
                                  region: user.region || 'Valparaíso',
                                  comuna: user.comuna || 'Valparaíso',
                                  direccion: user.direccion || '',
                                  password: '',
                                  confirmPassword: '',
                                  role: user.role || 'cliente',
                                  active: user.active !== false,
                                })
                                setShowUserForm(true)
                                setUserFormError('')
                                setUserFormSuccess('')
                              }}>Editar</button>
                              <button className="btn btn-delete" type="button" disabled={user.id === currentUser.id || userActionLoading} onClick={() => handleDeleteUser(user)}>Desactivar</button>
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
            <AppointmentsList
              userRole="admin"
              adminMode
              users={adminUsers}
              onAppointmentsChange={handleAppointmentsChange}
            />
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
              onCreate={handleCreate}
              onUpdate={handleUpdate}
              onCancel={() => { setOverlayOpen(false); setEditing(null) }}
            />
          </div>
        </div>
      )}

      {pendingDeletion && (
        <div className="overlay" role="presentation">
          <section className="overlay-panel admin-confirm-panel" role="alertdialog" aria-modal="true" aria-labelledby="delete-confirm-title" aria-describedby="delete-confirm-description">
            <h2 id="delete-confirm-title" className="h4 fw-bold">
              {pendingDeletion.type === 'producto' ? 'Confirmar descontinuación' : 'Confirmar desactivación'}
            </h2>
            <p id="delete-confirm-description">
              {pendingDeletion.type === 'producto'
                ? `¿Descontinuar el producto “${pendingDeletion.item.name || pendingDeletion.item.code}”? Dejará de aparecer en la tienda, pero permanecerá en el registro.`
                : `¿Desactivar al usuario “${[pendingDeletion.item.name, pendingDeletion.item.lastName].filter(Boolean).join(' ')}”? No podrá iniciar sesión, pero su registro se conservará.`}
            </p>
            {pendingDeletion.type === 'producto' && productActionError && (
              <p className="admin-form-message error" role="alert">{productActionError}</p>
            )}
            {pendingDeletion.type === 'usuario' && userFormError && (
              <p className="admin-form-message error" role="alert">{userFormError}</p>
            )}
            <div className="form-actions">
              <button className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold" type="button" disabled={productDeleteLoading || userActionLoading} onClick={() => { setPendingDeletion(null); setUserFormError('') }}>Cancelar</button>
              <button className="btn btn-delete px-4 py-2 rounded-pill fw-semibold" type="button" disabled={productDeleteLoading || userActionLoading} onClick={confirmDeletion}>
                {productDeleteLoading || userActionLoading
                  ? pendingDeletion.type === 'producto' ? 'Descontinuando...' : 'Desactivando...'
                  : pendingDeletion.type === 'producto' ? 'Descontinuar' : 'Desactivar'}
              </button>
            </div>
          </section>
        </div>
      )}

    </div>
  )
}