import { Link, useParams } from 'react-router'

function ResultadoCompra({ orders }) {
  const { id } = useParams()
  const order = orders.find((item) => String(item.id) === id)

  return (
    <section className="contact-section">
      <div className="container">
        {order ? (
          <article className="service-card">
            <div className="service-card-body">
              <span className="eyebrow">Compra simulada</span>
              <h1>¡Pedido registrado!</h1>
              <p>
                Tu número de pedido es <strong>{order.id}</strong>.
              </p>
              <p>
                No se realizó ningún pago ni se envió un correo. Este pedido
                existe solo en esta demostración local.
              </p>
              <Link className="button button-primary" to="/productos">
                Volver al catálogo
              </Link>
            </div>
          </article>
        ) : (
          <article className="service-card">
            <div className="service-card-body">
              <h1>No encontramos ese pedido</h1>
              <p>
                El pedido puede no existir en este navegador o su identificador
                no ser válido.
              </p>
              <Link className="button button-outline" to="/productos">
                Volver al catálogo
              </Link>
            </div>
          </article>
        )}
      </div>
    </section>
  )
}

export default ResultadoCompra