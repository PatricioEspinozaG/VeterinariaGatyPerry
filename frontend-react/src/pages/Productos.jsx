import { useState } from 'react'
import PageHero from '../components/PageHero.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { normalizeText } from '../utils/format.js'

function Productos({ products, cart, onAddToCart }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [message, setMessage] = useState('')

  const categories = [...new Set(products.map((product) => product.category))].sort()

  const filteredProducts = products.filter((product) => {
    const productInfo = [
      product.code,
      product.name,
      product.category,
      product.activeIngredient,
      product.presentation,
      product.species,
    ].join(' ')

    const matchesSearch = normalizeText(productInfo).includes(
      normalizeText(searchTerm),
    )
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory

    return matchesSearch && matchesCategory
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

            <label htmlFor="categoriaProducto">Categoría</label>
            <select
              id="categoriaProducto"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
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