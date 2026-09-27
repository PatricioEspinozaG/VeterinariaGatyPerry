import heroImage from '../assets/veterinaria-hero.png'
import ServiceCard from '../components/ServiceCard.jsx'
import StatItem from '../components/StatItem.jsx'
import { featuredServices, stats } from '../data/homeData.js'

function Home() {
  return (
    <>
      <section id="inicio" className="hero-section">
        <div className="container hero-content">
          <div className="hero-copy">
            <span className="eyebrow">Cuidando mascotas desde 2009</span>
            <h1>
              Su salud,
              <span> nuestra vocación.</span>
            </h1>
            <p>
              Atención veterinaria cercana para acompañar a tu mascota en cada
              etapa de su vida.
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href="#servicios">
                Conocer servicios
              </a>
              <a className="button button-secondary" href="#productos">
                Ver productos
              </a>
            </div>
          </div>

          <div className="hero-image">
            <img
              src={heroImage}
              alt="Equipo veterinario junto a un perro y un gato"
            />
            <div className="hero-note">
              <strong>25 pacientes al día</strong>
              <span>Atención ordenada y con seguimiento.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section" aria-label="Resumen">
        <div className="container stats-grid">
          {stats.map((stat) => (
            <StatItem
              key={stat.id}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </div>
      </section>

      <section id="servicios" className="services-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Atención integral</span>
            <h2>Servicios destacados</h2>
            <p>
              Esta selección reutiliza información real del catálogo anterior.
            </p>
          </div>

          <div className="services-grid">
            {featuredServices.map((service) => (
              <ServiceCard
                key={service.code}
                name={service.name}
                category={service.category}
                species={service.species}
                duration={service.duration}
                price={service.price}
                image={service.image}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="productos" className="intro-section">
        <div className="container intro-content">
          <span className="eyebrow">Segunda práctica React</span>
          <h2>Datos separados y componentes reutilizables</h2>
          <p>
            Las estadísticas y los servicios ahora se generan desde arreglos de
            datos mediante map y reciben su contenido a través de props.
          </p>
        </div>
      </section>
    </>
  )
}

export default Home
