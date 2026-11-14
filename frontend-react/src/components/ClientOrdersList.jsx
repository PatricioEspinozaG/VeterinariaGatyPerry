import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getMyOrders } from '../services/ordersApi.js'
import { money } from '../utils/format.js'

export default function ClientOrdersList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadOrders() {
      try {
        const result = await getMyOrders()

        if (active) {
          setOrders(result.map((order) => ({
            ...order,
            delivery: { method: order.deliveryMethod },
          })))
        }
      } catch (cause) {
        if (active) {
          setError(cause.message || 'No pudimos cargar tus compras.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadOrders()

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="admin-view-card card shadow border-0 rounded-4 p-4 bg-white full">
      <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7 mb-2 d-inline-block">
        HISTORIAL DE COMPRAS
      </span>
      <h2 className="h3 fw-bold text-dark">Mis compras</h2>

      {loading ? (
        <p role="status">Cargando compras...</p>
      ) : error ? (
        <p className="admin-form-message error" role="alert">{error}</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">Todavía no tienes compras registradas.</p>
          <Link
            className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold"
            to="/productos"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 user-mobile-card-table">
            <thead className="table-light">
              <tr>
                <th>Pedido</th>
                <th>Fecha</th>
                <th>Productos</th>
                <th>Entrega</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td data-label="Pedido">
                    <Link to={`/compra/${order.id}`}>#{order.id}</Link>
                  </td>
                  <td data-label="Fecha">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString('es-CL')
                      : 'Sin fecha'}
                  </td>
                  <td data-label="Productos">
                    {(order.items || [])
                      .map((item) => `${item.name} × ${item.quantity}`)
                      .join(', ') || 'Detalle no disponible'}
                  </td>
                  <td data-label="Entrega">
                    {order.delivery.method === 'envio'
                      ? 'Envío'
                      : 'Retiro en clínica'}
                  </td>
                  <td className="fw-semibold" data-label="Total">
                    {money(order.total || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}