import logo from '../assets/logo-nav.gif'

function Header() {
  return (
    <>
      <div className="topbar">
        <div className="container topbar-content">
          <span>Rancagua · +56 72 221 3456</span>
          <span>Lunes a sábado · 09:00 a 19:00</span>
        </div>
      </div>

      <header className="site-header">
        <div className="container navbar">
          <a className="brand" href="#inicio" aria-label="Ir al inicio">
            <img src={logo} alt="Logo de Veterinaria Gaty Perry" />
          </a>

          <nav className="main-navigation" aria-label="Navegación principal">
            <a href="#inicio">Inicio</a>
            <a href="#servicios">Servicios</a>
            <a href="#productos">Productos</a>
            <a href="#contacto">Contacto</a>
          </nav>

          <button
            className="button button-outline"
            type="button"
            disabled
            title="Se habilitará en la práctica de sesión"
          >
            Ingresar
          </button>
        </div>
      </header>
    </>
  )
}

export default Header
