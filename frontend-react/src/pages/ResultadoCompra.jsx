import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { getOrder } from '../services/ordersApi.js'
import { money } from '../utils/format.js'

function ResultadoCompra({ currentUser }) {
  const { id } = useParams()
  const { state } = useLocation()
  const userId = currentUser?.id

  const [order, setOrder] = useState(() => {
    if (userId) return null
    if (state?.guestOrder?.id === id) return state.guestOrder

    try {
      const saved = JSON.parse(sessionStorage.getItem('gaty-guest-receipt'))
      return saved?.id === id ? saved : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(Boolean(userId))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return undefined

    let active = true

    async function loadOrder() {
      try {
        const result = await getOrder(id)
        if (active) setOrder(result)
      } catch (cause) {
        if (active) {
          setError(cause.message || 'No pudimos cargar ese pedido.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadOrder()
    return () => { active = false }
  }, [id, userId])

  return (
    <section className="contact-section">
      <div className="container">
        <article className="service-card">
          <div className="service-card-body">
            {loading ? (
              <p role="status">Cargando pedido...</p>
            ) : error ? (
              <>
                <h1>No pudimos cargar el pedido</h1>
                <p role="alert">{error}</p>
              </>
            ) : order ? (
              <>
                <span className="eyebrow">Compra simulada</span>
                <h1>¡Pedido registrado!</h1>
                <p>
                  Tu número de pedido es <strong>{order.id}</strong>.
                </p>
                <p>
                  Estado: <strong>{order.status}</strong>
                </p>

                <h2>Detalle</h2>
                {order.items.map((item) => (
                  <p key={item.code}>
                    {item.name} × {item.quantity}:{' '}
                    <strong>{money(item.lineTotal)}</strong>
                  </p>
                ))}

                <p>Subtotal: {money(order.subtotal)}</p>
                <p>
                  {order.deliveryMethod === 'envio'
                    ? 'Envío simulado'
                    : 'Retiro en clínica'}
                  : {money(order.shipping)}
                </p>
                <p>
                  <strong>Total: {money(order.total)}</strong>
                </p>
                <p>No se realizó ningún pago ni se envió un correo.</p>
              </>
            ) : (
              <>
                <h1>No encontramos ese pedido</h1>
                <p>
                  {userId
                    ? 'Revisa el identificador o vuelve a tus compras.'
                    : 'No hay un comprobante de ese pedido disponible en esta pestaña.'}
                </p>
              </>
            )}

            <div className="d-flex flex-wrap gap-2 mt-3">
              <Link className="button button-primary" to="/productos">
                Volver al catálogo
              </Link>
              {currentUser?.role === 'cliente' && (
                <Link className="button button-outline" to="/mi-cuenta/compras">
                  Ver mis compras
                </Link>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}

export default ResultadoCompra