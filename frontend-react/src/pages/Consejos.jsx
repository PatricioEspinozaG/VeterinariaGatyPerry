import PageHero from '../components/PageHero.jsx'
import { articles } from '../data/articles.js'
import { Link } from 'react-router'

function Consejos() {
  return (
    <>
      <PageHero
        eyebrow="Bienestar animal"
        title="Consejos para cuidarlos mejor"
        description="Información general que complementa, pero no reemplaza, una consulta veterinaria."
      />

      <section className="intro-section tips-section">
        <div className="container tips-grid">
          {articles.map((article) => (
            <article className="tip-card" key={article.id}>
              <span className="eyebrow">Consejo veterinario</span>
              <h2>{article.title}</h2>
              <p>{article.summary}</p>
              <Link className="button button-secondary" to={`/consejos/${article.id}`}>
                Leer consejo
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default Consejos