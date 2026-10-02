import { Link } from 'react-router'

function NoEncontrado() {
  return (
    <main>
      <h1>¡Ups! No encontramos esta página</h1>
      <p>Puede que la dirección haya cambiado o esté escrita incorrectamente.</p>
      <Link to="/">Volver al inicio</Link>
    </main>
  )
}

export default NoEncontrado