import { Navigate, Route, Routes } from 'react-router'
import useLocalStorage from './hooks/useLocalStorage.js'
import { STORAGE_KEYS } from './services/storage.js'
import { products as initialProducts } from './data/products.js'
import { users as initialUsers } from './data/users.js'
import { addToCart, changeQuantity, normalizeCart, removeFromCart } from './utils/cartLogic.js'
import { preparePurchase } from './utils/purchaseLogic.js'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Services from './pages/Services.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Contacto from './pages/Contacto.jsx'
import Consejos from './pages/Consejos.jsx'
import NoEncontrado from './pages/NoEncontrado.jsx'
import Productos from './pages/Productos.jsx'
import DetalleProducto from './pages/DetalleProducto.jsx'
import Carrito from './pages/Carrito.jsx'
import Checkout from './pages/Checkout.jsx'
import ResultadoCompra from './pages/ResultadoCompra.jsx'
import { RegisterForm } from './components/RegisterForm.jsx'
import LoginForm from './components/LoginForm.jsx'
import PetForm from './components/PetForm.jsx'
import AppointmentForm from './components/AppointmentForm.jsx'
import AppointmentsList from './components/AppointmentsList.jsx'
import DetalleConsejo from './pages/DetalleConsejo.jsx'
import './styles/app.css'

function App() {
  const [products, setProducts, productsError] = useLocalStorage(STORAGE_KEYS.products, initialProducts)
  const [cart, setCart, cartError] = useLocalStorage(STORAGE_KEYS.cart, [])
  const [orders, setOrders, ordersError] = useLocalStorage(STORAGE_KEYS.orders, [])
  const [users, setUsers, usersError] = useLocalStorage('users', initialUsers)
  const [currentUserId, setCurrentUserId, sessionError] = useLocalStorage('currentUserId', '')

  const currentUser = users.find((user) => user.id === currentUserId && user.active) || null
  const validCart = normalizeCart(cart, products)
  const cartQuantity = validCart.reduce((total, item) => total + item.quantity, 0)
  const storageError = productsError || cartError || ordersError || usersError || sessionError

  function handleAddToCart(product) {
    const actual = products.find((item) => item.code === product.code)
    if (!actual) return { ok: false, error: 'Producto no disponible.' }
    const result = addToCart(validCart, actual)
    if (result.ok) setCart(result.cart)
    return result
  }

  function handleChangeQuantity(product, quantity) {
    const result = changeQuantity(validCart, product, quantity)
    if (result.ok) setCart(result.cart)
    return result
  }

  function handleCompletePurchase(delivery) {
    const result = preparePurchase(validCart, products, delivery)
    if (!result.ok) return result

    const orderId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
    setProducts(result.products)
    setOrders((previous) => [...previous, { id: orderId, ...result, delivery }])
    setCart([])
    return { ok: true, orderId }
  }

  function handleRegister(newUser) {
    const userWithId = {
      ...newUser,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      role: 'cliente',
      active: true,
    }
    setUsers((previous) => [...previous, userWithId])
    setCurrentUserId(userWithId.id)
    return { ok: true }
  }

  return (
    <div className="app-shell">
      <Header currentUser={currentUser} cartQuantity={cartQuantity} onLogout={() => setCurrentUserId('')} />
      {storageError && <p className="container" role="alert">No pudimos guardar los cambios en este navegador.</p>}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/consejos" element={<Consejos />} />
          <Route path="/consejos/:id" element={<DetalleConsejo />} />
          <Route path="/productos" element={<Productos products={products} cart={validCart} onAddToCart={handleAddToCart} />} />
          <Route path="/productos/:code" element={<DetalleProducto products={products} onAddToCart={handleAddToCart} />} />
          <Route path="/carrito" element={<Carrito products={products} cart={validCart} onChangeQuantity={handleChangeQuantity} onRemove={(code) => setCart(removeFromCart(validCart, code))} onClear={() => setCart([])} />} />
          <Route path="/checkout" element={<Checkout products={products} cart={validCart} currentUser={currentUser} onCompletePurchase={handleCompletePurchase} />} />
          <Route path="/compra/:id" element={<ResultadoCompra orders={orders} />} />
          <Route
            path="/registro"
            element={<RegisterForm users={users} onRegister={handleRegister} />}
          />
          <Route
            path="/login"
            element={<LoginForm users={users} onLogin={(userId) => setCurrentUserId(userId)} />}
          />
          <Route
            path="/mascotas/nueva"
            element={currentUser ? <PetForm currentUserId={currentUserId} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/citas/nueva"
            element={currentUser ? <AppointmentForm currentUserId={currentUserId} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/citas"
            element={currentUser ? <AppointmentsList userRole={currentUser.role} currentUserId={currentUserId} /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
