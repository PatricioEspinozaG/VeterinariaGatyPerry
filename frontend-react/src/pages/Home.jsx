import heroImage from '../assets/imageninicio.jpg'
import ServiceCard from '../components/ServiceCard.jsx'
import StatItem from '../components/StatItem.jsx'
import { Link } from 'react-router'
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
              <Link className="button button-primary" to="/citas/nueva">
                Agendar una hora
              </Link>
              <Link className="button button-secondary" to="/servicios">
                Ver servicios
              </Link>
            </div>
          </div>

          <div className="hero-image">
            <img
              src={heroImage}
              alt="Equipo veterinario junto a un perro y un gato"
            />
            <span className="hero-heart hero-heart-one" aria-hidden="true">
              <svg viewBox="0 0 32 32"><path d="M16 27S4 19.5 4 11.8C4 5.6 11.6 3.4 16 9c4.4-5.6 12-3.4 12 2.8C28 19.5 16 27 16 27Z" /></svg>
            </span>
            <span className="hero-heart hero-heart-two" aria-hidden="true">
              <svg viewBox="0 0 32 32"><path d="M16 27S4 19.5 4 11.8C4 5.6 11.6 3.4 16 9c4.4-5.6 12-3.4 12 2.8C28 19.5 16 27 16 27Z" /></svg>
            </span>
            <span className="hero-heart hero-heart-three" aria-hidden="true">
              <svg viewBox="0 0 32 32"><path d="M16 27S4 19.5 4 11.8C4 5.6 11.6 3.4 16 9c4.4-5.6 12-3.4 12 2.8C28 19.5 16 27 16 27Z" /></svg>
            </span>
            <span className="hero-heart hero-heart-four" aria-hidden="true">
              <svg viewBox="0 0 32 32"><path d="M16 27S4 19.5 4 11.8C4 5.6 11.6 3.4 16 9c4.4-5.6 12-3.4 12 2.8C28 19.5 16 27 16 27Z" /></svg>
            </span>
            <span className="hero-paw hero-paw-one" aria-hidden="true">
              <svg viewBox="0 0 40 40"><ellipse cx="10" cy="12" rx="4" ry="5.5" /><ellipse cx="19" cy="8" rx="4" ry="5.5" /><ellipse cx="28" cy="11" rx="4" ry="5.5" /><ellipse cx="34" cy="18" rx="3.5" ry="4.5" /><path d="M8 28c0-5 5.5-8 12-8s12 3 12 8c0 4.5-4.5 7-12 7S8 32.5 8 28Z" /></svg>
            </span>
            <span className="hero-paw hero-paw-two" aria-hidden="true">
              <svg viewBox="0 0 40 40"><ellipse cx="10" cy="12" rx="4" ry="5.5" /><ellipse cx="19" cy="8" rx="4" ry="5.5" /><ellipse cx="28" cy="11" rx="4" ry="5.5" /><ellipse cx="34" cy="18" rx="3.5" ry="4.5" /><path d="M8 28c0-5 5.5-8 12-8s12 3 12 8c0 4.5-4.5 7-12 7S8 32.5 8 28Z" /></svg>
            </span>
            <span className="hero-paw hero-paw-three" aria-hidden="true">
              <svg viewBox="0 0 40 40"><ellipse cx="10" cy="12" rx="4" ry="5.5" /><ellipse cx="19" cy="8" rx="4" ry="5.5" /><ellipse cx="28" cy="11" rx="4" ry="5.5" /><ellipse cx="34" cy="18" rx="3.5" ry="4.5" /><path d="M8 28c0-5 5.5-8 12-8s12 3 12 8c0 4.5-4.5 7-12 7S8 32.5 8 28Z" /></svg>
            </span>
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
            <h2>Lo que tu mascota necesita</h2>
            <p>Consulta, prevención y productos veterinarios con información clara.</p>
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

      <section id="cuidado" className="intro-section">
        <div className="container care-layout">
          <div className="care-copy">
            <span className="eyebrow">Una atención más simple</span>
            <h2>Organiza el cuidado de tu mascota</h2>
            <p>
              Regístrate, solicita una hora y revisa el estado de tus citas sin
              depender de una agenda de papel.
            </p>

            <ul className="benefit-list">
              <li>Solicitudes de hora registradas en el navegador.</li>
              <li>Catálogo de servicios y productos oficiales.</li>
              <li>Información centralizada para la demostración.</li>
            </ul>

            <Link className="button button-primary" to="/registro">
              Crear cuenta
            </Link>
          </div>

          <div className="feature-panel">
            <span className="feature-number">01</span>
            <div>
              <strong>Registra tu cuenta</strong>
              <p>Completa tus datos con validaciones.</p>
            </div>

            <span className="feature-number">02</span>
            <div>
              <strong>Solicita una hora</strong>
              <p>Selecciona servicio, fecha y mascota.</p>
            </div>

            <span className="feature-number">03</span>
            <div>
              <strong>Revisa el estado</strong>
              <p>Consulta si está pendiente o confirmada.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
