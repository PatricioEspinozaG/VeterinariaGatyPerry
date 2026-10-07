import { Route, Routes } from 'react-router'
import useLocalStorage from './hooks/useLocalStorage.js'
import { STORAGE_KEYS } from './services/storage.js'
import { products as initialProducts } from './data/products.js'
import { users as initialUsers } from './data/users.js'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Services from './pages/Services.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Contacto from './pages/Contacto.jsx'
import Consejos from './pages/Consejos.jsx'
import NoEncontrado from './pages/NoEncontrado.jsx'
import Productos from './pages/Productos.jsx'
import {RegisterForm}from './components/RegisterForm.jsx'
import LoginForm from './components/LoginForm.jsx'
import './styles/app.css'

function App() {
  return (
    <div className="app-shell">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/consejos" element={<Consejos />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/registro" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App