function ServiceCard({
  name,
  category,
  species,
  duration,
  price,
  image,
  observation,
}) {
  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(price)

  return (
    <article className="service-card">
      <div className="service-card-image">
        <img src={image} alt="" aria-hidden="true" />
      </div>

      <div className="service-card-body">
        <span className="service-category">{category}</span>
        <h3>{name}</h3>
        <p>
          {species} · {duration}
        </p>
        {observation && <p>{observation}</p>}
        <strong className="service-price">{formattedPrice}</strong>
      </div>
    </article>
  )
}

export default ServiceCard