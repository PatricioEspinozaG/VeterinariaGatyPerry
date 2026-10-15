import { useState } from 'react'
import { Navigate } from 'react-router'
import { readStorage, STORAGE_KEYS } from '../services/storage.js'
import AdminProductsList from '../components/AdminProductsList.jsx'
import AdminProductForm from '../components/AdminProductForm.jsx'
import '../styles/app.css'

export default function AdminPanel({ products, setProducts, users, currentUser }) {
  if (!currentUser || currentUser.role !== 'admin') return <Navigate to="/login" replace />

  const [editing, setEditing] = useState(null)
  const [showFab, setShowFab] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(false)

  const unidades = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)
  const appointments = readStorage(STORAGE_KEYS.appointments, []) || []
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

  return (
    <div className="admin-panel container">
      <div className="admin-header">
        <div className="admin-title">
          <h1>Panel de administración</h1>
          <p className="muted">Administrador {currentUser.name} · {currentUser.role}</p>
        </div>
      </div>

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

      <div className="admin-main">
        <div className={`admin-left ${!editing ? 'full' : ''}`}>
          <h2>Productos registrados</h2>
          <AdminProductsList products={products} onEdit={(p) => setEditing(p)} onDelete={handleDelete} />
        </div>
        {editing && (
          <aside className="admin-right">
            <>
              <h3>Editar producto</h3>
              <AdminProductForm
                key={editing.code}
                product={editing}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onCancel={() => setEditing(null)}
              />
            </>
          </aside>
        )}
      </div>

      {/* Floating action pill: reemplaza la acción de crear en la sidebar */}
      {(
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
