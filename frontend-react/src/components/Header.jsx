import { NavLink} from 'react-router'
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
          <NavLink className="brand" to="/" aria-label="Ir al inicio">
            <img src={logo} alt="Logo de Veterinaria Gaty Perry" />
          </NavLink>

        <nav className="main-navigation" aria-label="Navegación principal">
          <NavLink to="/" end>
            Inicio
          </NavLink>
          
          <NavLink to="/servicios">
            Servicios
          </NavLink>

          <NavLink to="/nosotros">
            Nosotros
          </NavLink>

          <NavLink to="/contacto">
            Contacto
          </NavLink>

          <NavLink to="/consejos">
            Consejos
          </NavLink>

          <a href="/#productos">Productos</a>
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
