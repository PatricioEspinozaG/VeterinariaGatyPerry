import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { money, productImage } from '../utils/format.js'

function DetalleProducto({ products, onAddToCart }) {
  const { code } = useParams()
  const [message, setMessage] = useState('')

  const product = products.find((item) => item.code === code)

  if (!product) {
    return (
      <section className="contact-section">
        <div className="container">
          <p role="alert">
            No encontramos ese producto. Revisa el código o vuelve al catálogo.
          </p>
          <Link className="button button-outline" to="/productos">
            Volver al catálogo
          </Link>
        </div>
      </section>
    )
  }

  const isAvailable = product.stock > 0

  function addToCart() {
    const result = onAddToCart(product)
    setMessage(
      result.ok
        ? `${product.name} agregado al carrito.`
        : result.error ?? 'No se pudo agregar el producto al carrito.',
    )
  }

  return (
    <section className="contact-section">
      <div className="container">
        <div className="contact-layout">
          <div className="service-card-image">
            <img
              src={productImage(product.category)}
              alt={`Ilustración de la categoría ${product.category}`}
            />
          </div>

          <article className="service-card">
            <div className="service-card-body">
              <span className="service-category">
                {product.code} · {product.category}
              </span>

              <h1>{product.name}</h1>

              <dl>
                <dt>Principio activo</dt>
                <dd>{product.activeIngredient}</dd>

                <dt>Presentación</dt>
                <dd>{product.presentation}</dd>

                <dt>Especie</dt>
                <dd>{product.species}</dd>

                <dt>Stock</dt>
                <dd>
                  {isAvailable
                    ? `${product.stock} unidades`
                    : 'Agotado'}
                </dd>
              </dl>

              <p className="service-price">{money(product.price)}</p>

              <p>
                Producto de demostración académica. Consulta al médico
                veterinario antes de administrar medicamentos.
              </p>

              {message && <p role="status">{message}</p>}

              <button
                className="button button-primary"
                type="button"
                disabled={!isAvailable}
                onClick={addToCart}
              >
                {isAvailable ? 'Agregar al carrito' : 'Agotado'}
              </button>

              {' '}
              <Link className="button button-outline" to="/productos">
                Volver al catálogo
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default DetalleProducto