import { NavLink, Link } from "react-router";
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

            <NavLink to="/productos">
              Productos
            </NavLink>
          </nav>

          <Link
            to="/login"
            className="button button-outline"
          >
            Ingresar
          </Link>
        </div>
      </header>
    </>
  )
}

export default Header