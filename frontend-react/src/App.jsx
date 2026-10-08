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
import { RegisterForm } from './components/RegisterForm.jsx'
import LoginForm from './components/LoginForm.jsx'
import PetForm from './components/PetForm.jsx'
import AppointmentForm from './components/AppointmentForm.jsx'
import AppointmentsList from './components/AppointmentsList.jsx'
import './styles/app.css'

function App() {
  // Manejo de usuarios persistentes
  const [users, setUsers] = useLocalStorage(
    STORAGE_KEYS?.USERS || 'users',
    initialUsers
  )

  // Manejo de ID de usuario con sesión activa
  const [currentUserId, setCurrentUserId] = useLocalStorage(
    STORAGE_KEYS?.CURRENT_USER_ID || 'currentUserId',
    null
  )

  // Usuario actual
  const currentUser = users.find((u) => u.id === currentUserId) || null

  // Función para iniciar sesión
  const handleLogin = (userId) => {
    setCurrentUserId(userId)
    return { ok: true }
  }

  // Función para cerrar sesión
  const handleLogout = () => {
    setCurrentUserId(null)
  }

  // Función para registrar usuario
  const handleRegister = (newUser) => {
    const userWithId = {
      ...newUser,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      role: 'cliente',
      active: true
    }
    setUsers([...users, userWithId])
    handleLogin(userWithId.id)
    return { ok: true }
  }

  return (
    <div className="app-shell">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/consejos" element={<Consejos />} />
          <Route path="/productos" element={<Productos />} />
          <Route
            path="/registro"
            element={<RegisterForm users={users} onRegister={handleRegister} />}
          />
          <Route
            path="/login"
            element={<LoginForm users={users} onLogin={handleLogin} />}
          />
          <Route
            path="/mascotas/nueva"
            element={<PetForm currentUserId={currentUserId} />}
          />
          <Route
            path="/citas/nueva"
            element={<AppointmentForm currentUserId={currentUserId} />}
          />
          <Route
            path="/citas"
            element={<AppointmentsList userRole={currentUser?.role || 'cliente'} currentUserId={currentUserId} />}
          />
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App