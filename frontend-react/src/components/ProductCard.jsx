function ProductCard({ product, onAddToCart }) {
  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(product.price)

  const stockMessage =
    product.stock > 0
      ? `Disponible: ${product.stock} unidades`
      : 'Agotado'

  return (
    <article className="service-card product-card">
      <div className="service-card-body">
        <span className="service-category">{product.category}</span>

        <h3>{product.name}</h3>

        <p>
          {product.activeIngredient} · {product.presentation}
        </p>

        <p>{product.species}</p>

        <p>{stockMessage}</p>

        <strong className="service-price">{formattedPrice}</strong>

        <button
          className="button button-primary"
          type="button"
          onClick={() => onAddToCart(product)}
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  )
}

export default ProductCard