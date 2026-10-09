import { NavLink, Link } from "react-router";
import logo from '../assets/logo-nav.gif'

function Header({ currentUser, cartQuantity = 0, onLogout }) {
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
            <NavLink to="/carrito">
              Carrito ({cartQuantity})
            </NavLink>

            {/* Accesos solo cuando hay sesión activa */}
            {currentUser && (
              <>
                <NavLink to="/mascotas/nueva">
                  + Mascota
                </NavLink>
                <NavLink to="/citas">
                  Mis Citas
                </NavLink>
              </>
            )}
          </nav>

          <div className="d-flex align-items-center gap-2">
            {currentUser ? (
              <div className="d-flex align-items-center gap-2">
                <span className="small text-secondary fw-semibold">
                  👤 {currentUser.nombre || currentUser.email}
                </span>
                <button
                  onClick={onLogout}
                  className="button button-outline ms-2"
                  style={{ cursor: 'pointer' }}
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link
                  to="/login"
                  className="button button-outline"
                >
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  className="button button-primary"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
