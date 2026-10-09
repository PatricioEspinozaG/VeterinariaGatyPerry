import { useState } from 'react'
import { Link } from 'react-router'
import { regions } from '../data/regions.js'
import { getCartLines, getCartTotal } from '../utils/cartLogic.js'
import { money } from '../utils/format.js'

const SHIPPING_COST = 3990

function Checkout({ products, cart, currentUser, onCompletePurchase }) {
  const [name, setName] = useState(currentUser?.name ?? '')
  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [region, setRegion] = useState('')
  const [commune, setCommune] = useState('')
  const [address, setAddress] = useState('')
  const [method, setMethod] = useState('envio')
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')

  const lines = getCartLines(cart, products)
  const subtotal = getCartTotal(cart, products)
  const shipping = method === 'envio' && lines.length > 0 ? SHIPPING_COST : 0
  const total = subtotal + shipping
  const communes = regions[region] ?? []

  function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setOrderId('')

    const delivery = {
      name,
      email,
      region: method === 'envio' ? region : '',
      commune: method === 'envio' ? commune : '',
      address: method === 'envio' ? address : '',
      method,
    }

    const result = onCompletePurchase(delivery)

    if (!result.ok) {
      setError(result.error ?? 'No se pudo completar la compra simulada.')
      return
    }

    setOrderId(result.orderId ?? '')
  }

  return (
    <>
      <section className="intro-section">
        <div className="container intro-content">
          <span className="eyebrow">Compra simulada</span>
          <h1>Finalizar compra</h1>
          <p>No se realizará ningún pago ni se enviarán correos.</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          {lines.length === 0 ? (
            <article className="service-card">
              <div className="service-card-body">
                <h2>Tu carrito está vacío</h2>
                <p>Agrega productos antes de continuar con la compra.</p>
                <Link className="button button-primary" to="/productos">
                  Ver productos
                </Link>
              </div>
            </article>
          ) : (
            <div className="contact-layout">
              <form className="contact-form" onSubmit={handleSubmit}>
                <h2>Datos de contacto y entrega</h2>

                <div className="form-field">
                  <label htmlFor="checkoutName">Nombre completo</label>
                  <input
                    id="checkoutName"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="checkoutEmail">Correo electrónico</label>
                  <input
                    id="checkoutEmail"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="checkoutMethod">Método de entrega</label>
                  <select
                    id="checkoutMethod"
                    name="method"
                    value={method}
                    onChange={(event) => {
                      setMethod(event.target.value)
                      setError('')
                    }}
                    required
                  >
                    <option value="envio">Envío simulado — $3.990</option>
                    <option value="retiro">Retiro en clínica — $0</option>
                  </select>
                </div>

                {method === 'envio' && (
                  <>
                    <div className="form-field">
                      <label htmlFor="checkoutRegion">Región</label>
                      <select
                        id="checkoutRegion"
                        name="region"
                        value={region}
                        onChange={(event) => {
                          setRegion(event.target.value)
                          setCommune('')
                        }}
                        required
                      >
                        <option value="">Selecciona una región</option>
                        {Object.keys(regions).map((regionName) => (
                          <option key={regionName} value={regionName}>
                            {regionName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="checkoutCommune">Comuna</label>
                      <select
                        id="checkoutCommune"
                        name="commune"
                        value={commune}
                        onChange={(event) => setCommune(event.target.value)}
                        disabled={!region}
                        required
                      >
                        <option value="">Selecciona una comuna</option>
                        {communes.map((communeName) => (
                          <option key={communeName} value={communeName}>
                            {communeName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="checkoutAddress">Dirección</label>
                      <input
                        id="checkoutAddress"
                        name="address"
                        type="text"
                        autoComplete="street-address"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                {error && <p role="alert">{error}</p>}

                {orderId && (
                  <p role="status">
                    Compra simulada registrada. Número de pedido: {orderId}
                  </p>
                )}

                <button className="button button-primary" type="submit">
                  Confirmar compra simulada
                </button>
              </form>

              <aside className="service-card">
                <div className="service-card-body">
                  <h2>Resumen</h2>

                  {lines.map((line) => (
                    <p key={line.code}>
                      {line.name} × {line.quantity}:{' '}
                      <strong>{money(line.lineTotal)}</strong>
                    </p>
                  ))}

                  <p>Subtotal: {money(subtotal)}</p>
                  <p>
                    {method === 'envio'
                      ? 'Envío simulado'
                      : 'Retiro en clínica'}
                    : {money(shipping)}
                  </p>
                  <p>
                    <strong>Total: {money(total)}</strong>
                  </p>
                  <p>El pago y la entrega son solo una simulación local.</p>

                  <Link className="button button-outline" to="/carrito">
                    Volver al carrito
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Checkout