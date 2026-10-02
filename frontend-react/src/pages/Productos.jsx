import { useState } from 'react'
import PageHero from '../components/PageHero.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { products } from '../data/products.js'

function Productos() {
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState([])

  const filteredProducts = products.filter((product) => {
    const productInfo =
      `${product.name} ${product.category} ${product.activeIngredient}`.toLowerCase()

    return productInfo.includes(searchTerm.trim().toLowerCase())
  })

  function handleAddToCart(product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.code === product.code,
      )

      if (existingItem) {
        return currentCart.map((item) =>
          item.code === product.code
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...currentCart, { code: product.code, quantity: 1 }]
    })
  }

  const cartQuantity = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  )

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

          <div className="services-grid product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.code}
                  product={product}
                  onAddToCart={handleAddToCart}
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