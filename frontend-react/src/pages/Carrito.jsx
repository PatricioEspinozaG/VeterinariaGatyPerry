import { Link } from 'react-router'
import { getCartLines, getCartTotal } from '../utils/cartLogic.js'
import { money, productImage } from '../utils/format.js'

const SHIPPING_COST = 3990

function Carrito({
  products,
  cart,
  onChangeQuantity,
  onRemove,
  onClear,
}) {
  const lines = getCartLines(cart, products)
  const units = lines.reduce((total, line) => total + line.quantity, 0)
  const subtotal = getCartTotal(cart, products)
  const shipping = lines.length > 0 ? SHIPPING_COST : 0
  const total = subtotal + shipping

  return (
    <>
      <section className="intro-section">
        <div className="container intro-content">
          <span className="eyebrow">Compra simulada</span>
          <h1>Carrito de productos</h1>
          <p>Revisa cantidades y stock antes de continuar.</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          {lines.length === 0 ? (
            <article className="service-card">
              <div className="service-card-body">
                <h2>Tu carrito está vacío</h2>
                <p>Agrega productos desde el catálogo.</p>
                <Link className="button button-primary" to="/productos">
                  Ver productos
                </Link>
              </div>
            </article>
          ) : (
            <div className="contact-layout">
              <div>
                {lines.map((line) => (
                  <article
                    className="service-card"
                    key={line.code}
                    style={{ marginBottom: '1rem' }}
                  >
                    <div className="service-card-body">
                      <div className="service-card-image">
                        <img
                          src={productImage(line.category)}
                          alt={`Ilustración de la categoría ${line.category}`}
                        />
                      </div>

                      <span className="service-category">
                        {line.code} · Stock {line.stock}
                      </span>
                      <h2>{line.name}</h2>
                      <p>{money(line.price)} por unidad</p>

                      <div>
                        <button
                          className="button button-outline"
                          type="button"
                          aria-label={`Restar una unidad de ${line.name}`}
                          onClick={() =>
                            onChangeQuantity(line, line.quantity - 1)
                          }
                        >
                          −
                        </button>

                        <span
                          aria-label={`Cantidad: ${line.quantity}`}
                          style={{ padding: '0 1rem' }}
                        >
                          {line.quantity}
                        </span>

                        <button
                          className="button button-outline"
                          type="button"
                          aria-label={`Agregar una unidad de ${line.name}`}
                          disabled={line.quantity >= line.stock}
                          onClick={() =>
                            onChangeQuantity(line, line.quantity + 1)
                          }
                        >
                          +
                        </button>

                        <button
                          className="button button-outline"
                          type="button"
                          style={{ marginLeft: '1rem' }}
                          onClick={() => onRemove(line.code)}
                        >
                          Quitar
                        </button>
                      </div>

                      <p>
                        Subtotal del producto:{' '}
                        <strong>{money(line.lineTotal)}</strong>
                      </p>
                    </div>
                  </article>
                ))}

                <button
                  className="button button-outline"
                  type="button"
                  onClick={onClear}
                >
                  Vaciar carrito
                </button>
              </div>

              <aside className="service-card">
                <div className="service-card-body">
                  <h2>Resumen</h2>
                  <p>Unidades: {units}</p>
                  <p>Subtotal: {money(subtotal)}</p>
                  <p>Envío simulado: {money(shipping)}</p>
                  <p>
                    <strong>Total: {money(total)}</strong>
                  </p>
                  <p>
                    El costo de retiro se calculará en el siguiente paso de
                    la compra.
                  </p>
                  <Link className="button button-primary" to="/checkout">
                    Continuar a compra
                  </Link>
                </div>
              </aside>
            </div>
          )}

          <p style={{ marginTop: '1rem' }}>
            <Link to="/productos">Continuar comprando</Link>
          </p>
        </div>
      </section>
    </>
  )
}

export default Carrito
