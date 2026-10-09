import { useState } from 'react'
import { NavLink, Link } from 'react-router'
import logo from '../assets/logo-nav.gif'

function Header({ currentUser, cartQuantity = 0, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

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
          <NavLink className="brand" to="/" aria-label="Ir al inicio" onClick={closeMenu}>
            <img src={logo} alt="Logo de Gaty Perry" />
          </NavLink>
          <button
            className="menu-toggle"
            type="button"
            aria-controls="menu-principal"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true">☰</span>
          </button>
          <div id="menu-principal" className={`navigation-panel${menuOpen ? ' is-open' : ''}`}>
            <nav className="main-navigation" aria-label="Navegación principal" onClick={closeMenu}>
              <NavLink to="/" end>Inicio</NavLink>
              <NavLink to="/servicios">Servicios</NavLink>
              <NavLink to="/productos">Productos</NavLink>
              <NavLink to="/consejos">Consejos</NavLink>
              <NavLink to="/nosotros">Nosotros</NavLink>
              <NavLink to="/contacto">Contacto</NavLink>
              <NavLink to="/carrito" className="cart-link" aria-label={`Carrito, ${cartQuantity} productos`}>
                <svg className="cart-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 4h2l2.2 9.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.76L18.7 7H6.2" />
                  <circle cx="10" cy="17.5" r="1.2" />
                  <circle cx="16.7" cy="17.5" r="1.2" />
                </svg>
                <span className="cart-badge">{cartQuantity}</span>
              </NavLink>
              {currentUser && (
                <>
                  <NavLink to="/mascotas/nueva">+ Mascota</NavLink>
                  <NavLink to="/citas">Mis citas</NavLink>
                </>
              )}
            </nav>
            <div className="nav-account">
              {currentUser ? (
                <>
                  <span className="account-name">{currentUser.nombre || currentUser.email}</span>
                  <button className="button button-outline" type="button" onClick={() => { onLogout(); closeMenu() }}>
                    Salir
                  </button>
                </>
              ) : (
                <Link to="/login" className="button button-outline" onClick={closeMenu}>Ingresar</Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
