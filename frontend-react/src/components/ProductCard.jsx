import { money, productImage } from '../utils/format.js'

function ProductCard({ product, onAddToCart }) {
  const isAvailable = product.stock > 0

  return (
    <article className="service-card product-card">
      <div className="service-card-image">
        <img
          src={productImage(product.category)}
          alt={`Imagen de la categoría ${product.category}`}
          loading="lazy"
        />
      </div>

      <div className="service-card-body">
        <span className="service-category">{product.category}</span>

        <p>Código: {product.code}</p>

        <h3>{product.name}</h3>

        <p>
          {product.activeIngredient} · {product.presentation}
        </p>

        <p>{product.species}</p>

        <p role="status">
          {isAvailable
            ? `Disponible: ${product.stock} unidades`
            : 'Agotado'}
        </p>

        <strong className="service-price">{money(product.price)}</strong>

        <button
          className="button button-primary"
          type="button"
          disabled={!isAvailable}
          onClick={() => onAddToCart(product)}
        >
          {isAvailable ? 'Agregar al carrito' : 'Agotado'}
        </button>
      </div>
    </article>
  )
}

export default ProductCard