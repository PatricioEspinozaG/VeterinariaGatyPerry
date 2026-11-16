import { useEffect, useState } from 'react'
import { Navigate, NavLink } from 'react-router'
import { listManagedOrders, updateManagedOrderStatus } from '../services/pedidos.js'
import { money } from '../utils/format.js'
import '../styles/app.css'

const statusLabels = {
  REGISTRADO: 'Registrado',
  EN_PREPARACION: 'En preparación',
  LISTO_PARA_RETIRO: 'Listo para retiro',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
}

function nextStatus(order) {
  if (order.status === 'REGISTRADO') return 'EN_PREPARACION'
  if (order.status === 'EN_PREPARACION') {
    return order.deliveryMethod === 'retiro'
      ? 'LISTO_PARA_RETIRO'
      : 'EN_CAMINO'
  }
  if (order.status === 'LISTO_PARA_RETIRO' || order.status === 'EN_CAMINO') {
    return 'ENTREGADO'
  }
  return null
}

function orderDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Fecha no disponible'
    : date.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
}

function deliveryDetails(order) {
  if (order.deliveryMethod === 'retiro') return 'Retiro en clínica'
  return [order.address, order.commune, order.region].filter(Boolean).join(', ')
    || 'Dirección no disponible'
}

export default function OrdersManagementPanel({ currentUser }) {
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const isAdmin = currentUser?.role === 'admin'
  const isReception = currentUser?.role === 'recepcion'

  useEffect(() => {
    if (!isAdmin && !isReception) return undefined

    let active = true
    listManagedOrders()
      .then((items) => {
        if (active) {
          setOrders(items)
          setOrdersError('')
          setActionError('')
        }
      })
      .catch((error) => {
        if (active) setOrdersError(error.message)
      })
      .finally(() => {
        if (active) setOrdersLoading(false)
      })

    return () => {
      active = false
    }
  }, [isAdmin, isReception, refreshKey])

  if (!isAdmin && !isReception) return <Navigate to="/login" replace />

  const normalizedSearch = search.trim().toLowerCase()
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = !statusFilter || order.status === statusFilter
    const matchesSearch = !normalizedSearch
      || [
        order.id,
        order.customerName,
        order.customerEmail,
        ...order.items.map((item) => item.name),
      ].some((value) => value?.toLowerCase().includes(normalizedSearch))
    return matchesStatus && matchesSearch
  })

  async function handleStatusChange(order, status) {
    setUpdatingOrderId(order.id)
    setActionError('')
    setActionMessage('')
    try {
      const updated = await updateManagedOrderStatus(
        order.id,
        status,
        order.version,
      )
      setOrders((previous) => previous.map((item) => (
        item.id === order.id ? updated : item
      )))
      setActionMessage(`El pedido #${order.id} ahora está ${statusLabels[status]}.`)
    } catch (error) {
      setActionError(`Pedido #${order.id}: ${error.message}`)
    } finally {
      setUpdatingOrderId('')
    }
  }

  return (
    <div className="admin-panel container">
      <div className="admin-header">
        <div className="admin-title">
          <h1>Gestión de pedidos</h1>
          <p className="muted">
            {isAdmin ? 'Administración' : 'Recepción'} · revisa y actualiza la preparación y entrega.
          </p>
        </div>
      </div>

      <nav className="admin-nav" aria-label={isAdmin ? 'Secciones de administración' : 'Secciones de recepción'}>
        {isAdmin ? (
          <>
            <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>Productos</NavLink>
            <NavLink to="/admin/usuarios" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>Usuarios</NavLink>
            <NavLink to="/admin/citas" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>Citas</NavLink>
            <NavLink to="/admin/clinica" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>Clínica</NavLink>
            <NavLink to="/admin/pedidos" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>Pedidos</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/recepcion" end className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>Citas</NavLink>
            <NavLink to="/recepcion/pedidos" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>Pedidos</NavLink>
          </>
        )}
      </nav>

      <main className="admin-main admin-main-background bg-vet-doodle">
        <section className="admin-view-card card shadow border-0 rounded-4 p-4 bg-white full">
          <div className="admin-section-heading">
            <div>
              <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7 mb-2 d-inline-block">
                PEDIDOS DE LA TIENDA
              </span>
              <h2 className="h3 fw-bold text-dark">Pedidos registrados</h2>
            </div>
            <button
              className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold"
              type="button"
              disabled={ordersLoading || Boolean(updatingOrderId)}
              onClick={() => {
                setOrdersLoading(true)
                setRefreshKey((previous) => previous + 1)
              }}
            >
              Actualizar
            </button>
          </div>

          {ordersError && <p className="admin-form-message error" role="alert">{ordersError}</p>}
          {actionError && <p className="admin-form-message error" role="alert">{actionError}</p>}
          {actionMessage && <p className="admin-form-message success" role="status">{actionMessage}</p>}

          <div className="admin-form admin-order-filters">
            <label>Buscar pedido o cliente
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ID, nombre, correo o producto"
              />
            </label>
            <label>Estado
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">Todos los estados</option>
                {Object.entries(statusLabels).map(([status, label]) => (
                  <option key={status} value={status}>{label}</option>
                ))}
              </select>
            </label>
          </div>

          {ordersLoading ? (
            <p className="text-center py-5" role="status">Cargando pedidos...</p>
          ) : !ordersError && filteredOrders.length === 0 ? (
            <p className="text-center py-5 text-muted">
              {orders.length === 0 ? 'Todavía no hay pedidos registrados.' : 'No hay pedidos que coincidan con los filtros.'}
            </p>
          ) : !ordersError && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 user-mobile-card-table">
                <thead className="table-light">
                  <tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Entrega</th><th>Productos</th><th>Total</th><th>Estado</th><th>Acción</th></tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const next = nextStatus(order)
                    return (
                      <tr key={order.id}>
                        <td data-label="Pedido">#{order.id}</td>
                        <td data-label="Cliente">
                          <strong>{order.customerName}</strong>
                          <div>{order.customerEmail}</div>
                        </td>
                        <td data-label="Fecha">{orderDate(order.createdAt)}</td>
                        <td data-label="Entrega">
                          {order.deliveryMethod === 'envio' ? 'Envío' : 'Retiro'}
                          <div>{deliveryDetails(order)}</div>
                        </td>
                        <td data-label="Productos">
                          {order.items.map((item) => (
                            <div key={item.code}>{item.name} × {item.quantity}</div>
                          ))}
                        </td>
                        <td data-label="Total" className="fw-semibold">{money(order.total || 0)}</td>
                        <td data-label="Estado">
                          <span className="badge rounded-pill admin-user-role">
                            {statusLabels[order.status] || order.status}
                          </span>
                        </td>
                        <td className="action-cell" data-label="Acción">
                          {next ? (
                            <button
                              className="btn btn-edit"
                              type="button"
                              disabled={Boolean(updatingOrderId)}
                              onClick={() => handleStatusChange(order, next)}
                            >
                              {updatingOrderId === order.id
                                ? 'Guardando...'
                                : `Marcar: ${statusLabels[next]}`}
                            </button>
                          ) : <span className="text-secondary">Proceso finalizado</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
