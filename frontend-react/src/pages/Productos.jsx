import { useState } from 'react'
import PageHero from '../components/PageHero.jsx'
import ProductCard from '../components/ProductCard.jsx'

function Productos({ products, cart, onAddToCart }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState('')

  const filteredProducts = products.filter((product) => {
    const productInfo = (
      product.name + ' ' + product.category + ' ' + product.activeIngredient
    ).toLowerCase()

    return productInfo.includes(searchTerm.trim().toLowerCase())
  })

  const cartQuantity = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  function add(product) {
    const result = onAddToCart(product)
    setMessage(
      result.ok
        ? product.name + ' agregado al carrito.'
        : result.error,
    )
  }

  return (
    <>
      <PageHero
        eyebrow="Medicamentos y cuidado"
        title="Catálogo de productos"
        description="Explora productos disponibles para el cuidado de perros y gatos."
      />

      <section className="services-section">
        <div className="container">
          <div className="product-search">
            <label htmlFor="buscarProducto">Buscar productos</label>
            <input
              id="buscarProducto"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ejemplo: Nexgard"
            />
          </div>

          <p>Unidades en el carrito: {cartQuantity}</p>
          {message && <p role="status">{message}</p>}

          <div className="services-grid product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.code}
                  product={product}
                  onAddToCart={add}
                />
              ))
            ) : (
              <p>No se encontraron productos.</p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default Productos