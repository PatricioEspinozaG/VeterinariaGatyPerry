import PageHero from '../components/PageHero.jsx'
import heroImage from '../assets/veterinaria-hero.png'

function Nosotros() {
  return (
    <>
      <PageHero
        eyebrow="Desde 2009"
        title="Gaty Perry"
        description="Un equipo de Rancagua comprometido con una atención clínica cercana, ordenada y profesional."
      />

      <section className="intro-section about-section">
        <div className="container about-layout">
          <img
            className="about-image"
            src={heroImage}
            alt="Equipo veterinario junto a mascotas"
          />

          <div>
            <h2>Cuidamos a quienes son parte de tu familia</h2>
            <p>
              La clínica cuenta con tres médicos veterinarios, un técnico
              veterinario y una recepcionista. Atiende un promedio de 25
              pacientes diarios y busca digitalizar sus procesos para reducir
              pérdidas de información e inasistencias.
            </p>

            <div className="about-values">
              <article className="about-card">
                <h3>Misión</h3>
                <p>
                  Entregar atención responsable y comprensible para cada familia.
                </p>
              </article>

              <article className="about-card">
                <h3>Visión</h3>
                <p>
                  Mejorar la continuidad clínica mediante procesos digitales
                  simples.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="intro-section team-section">
        <div className="container team-grid">
          <article className="team-card">
            <span className="eyebrow">Equipo de trabajo</span>
            <h2>Profesionales para cada etapa</h2>
            <p>
              El equipo está compuesto por médicos veterinarios, apoyo técnico y
              recepción, coordinados para entregar una atención clara y cercana.
            </p>
          </article>

          <article className="team-card">
            <span className="eyebrow">Proyecto académico</span>
            <h2>Desarrolladores</h2>
            <ul>
              <li>Patricio Espinoza</li>
              <li>José Ramos</li>
              <li>Estefanía Ruiz</li>
            </ul>
          </article>
        </div>
      </section>
    </>
  )
}

export default Nosotros