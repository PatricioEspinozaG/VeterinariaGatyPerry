import { Link } from 'react-router'
import footerLogo from '../assets/Gaty_Perry.gif'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <img src={footerLogo} alt="Logo de Gaty Perry" loading="lazy" />
          <p>Atención cercana para tu mascota.</p>
        </div>
        <div className="footer-links">
          <strong>Navegación</strong>
          <Link to="/servicios">Servicios</Link>
          <Link to="/productos">Productos</Link>
          <Link to="/citas/nueva">Agendar hora</Link>
        </div>
        <div className="footer-links">
          <strong>Contacto</strong>
          <span>Av. República 1240, Rancagua</span>
          <Link to="/contacto">Enviar mensaje</Link>
        </div>
      </div>
      <div className="container footer-bottom">Proyecto académico · React, Vite y almacenamiento local</div>
    </footer>
  )
}

export default Footer
