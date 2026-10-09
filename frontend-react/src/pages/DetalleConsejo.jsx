import { Link, useParams } from 'react-router'
import PageHero from '../components/PageHero.jsx'
import { articles } from '../data/articles.js'

function DetalleConsejo() {
  const { id } = useParams()
  const article = articles.find((item) => item.id === id)

  return (
    <>
      <PageHero
        eyebrow="Bienestar animal"
        title={article?.title ?? 'Consejo no encontrado'}
        description={
          article?.summary ?? 'No encontramos el consejo que buscabas.'
        }
      />

      <section className="intro-section tips-section">
        <div className="container tip-detail">
          {article ? (
            <article className="tip-card">
              <p>{article.content}</p>
              <p>
                Esta información general no reemplaza una consulta veterinaria.
              </p>
            </article>
          ) : (
            <p>Revisa la dirección o vuelve a la lista de consejos.</p>
          )}

          <Link className="button button-secondary" to="/consejos">
            Volver a consejos
          </Link>
        </div>
      </section>
    </>
  )
}

export default DetalleConsejo