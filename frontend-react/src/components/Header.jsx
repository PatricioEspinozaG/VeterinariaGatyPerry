import { useState } from 'react'
import { NavLink, Link } from 'react-router'
import GatyPerryLogo from './GatyPerryLogo'

function Header({ currentUser, cartQuantity = 0, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <div className="topbar">
        <div className="container topbar-content">
          <div className="topbar-socials" aria-label="Redes sociales">
            <a className="topbar-social-link facebook" href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.2V13H10v8h3.4Z" /></svg>
            </a>
            <a className="topbar-social-link instagram" href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle className="instagram-dot" cx="17.5" cy="6.8" r="1" /></svg>
            </a>
          </div>
          <span className="topbar-booking">¡Reserva en línea!</span>
          <span className="topbar-detail">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
            <span>Rancagua</span>
          </span>
          <span className="topbar-detail topbar-hours">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            <span>Atención: Lunes a sábado 09:00 am | 19:00 pm</span>
          </span>
          <a className="topbar-detail topbar-phone" href="tel:+56722213456">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 3a14 14 0 0 1-6-6l3-2-2-5Z" /></svg>
            <span>+56 72 221 3456</span>
          </a>
        </div>
      </div>
      <header className="site-header">
        <div className="container navbar">
          <NavLink className="brand" to="/" aria-label="Ir al inicio" onClick={closeMenu}>
          <GatyPerryLogo size="sm" showTagline={false} />
            <span className="eyebrow brand-eyebrow">Rancagua · desde 2009</span>
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
              <NavLink to="/consejos" className="nav-link-tertiary">Consejos</NavLink>
              <NavLink to="/nosotros" className="nav-link-tertiary">Nosotros</NavLink>
              <NavLink to="/contacto" className="nav-link-tertiary">Contacto</NavLink>
            </nav>
            <div className="nav-utilities">
              <div className="nav-account">
                {currentUser ? (
                  <>
                    {['admin', 'cliente', 'recepcion'].includes(currentUser.role) ? (
                      <NavLink to={currentUser.role === 'admin' ? '/admin' : currentUser.role === 'recepcion' ? '/recepcion' : '/mi-cuenta'} className="account-name button button-outline" onClick={closeMenu} role="button">{currentUser.name || currentUser.nombre || currentUser.email}</NavLink>
                    ) : (
                      <span className="account-name">{currentUser.name || currentUser.nombre || currentUser.email}</span>
                    )}
                    <button className="button button-outline" type="button" onClick={() => { onLogout(); closeMenu() }}>
                      Salir
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="button button-outline" onClick={closeMenu}>Ingresar</Link>
                )}
              </div>
              <NavLink
                to="/carrito"
                className="cart-link"
                aria-label={`Carrito, ${cartQuantity} productos`}
                onClick={closeMenu}
              >
                <svg className="cart-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 4h2l2.2 9.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.76L18.7 7H6.2" />
                  <circle cx="10" cy="17.5" r="1.2" />
                  <circle cx="16.7" cy="17.5" r="1.2" />
                </svg>
                <span className="cart-badge">{cartQuantity}</span>
              </NavLink>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
