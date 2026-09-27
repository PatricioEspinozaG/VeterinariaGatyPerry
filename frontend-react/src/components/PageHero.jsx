function PageHero({ eyebrow, title, description }) {
  return (
    <section className="intro-section">
      <div className="container intro-content">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  )
}

export default PageHero