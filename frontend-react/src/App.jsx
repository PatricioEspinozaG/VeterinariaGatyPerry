import { useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import useLocalStorage from './hooks/useLocalStorage.js'
import { readCartBuckets, STORAGE_KEYS } from './services/storage.js'
import { products as initialProducts } from './data/products.js'
import { users as initialUsers } from './data/users.js'
import { loginUser, logoutUser, registerUser, restoreSession } from './services/auth.js'
import { createOrder } from './services/pedidos.js'
import { listProducts } from './services/productos.js'
import { addToCart, changeQuantity, normalizeCart, removeFromCart } from './utils/cartLogic.js'
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
import AdminPanel from './pages/AdminPanel.jsx'
import AdminClinicalPanel from './pages/AdminClinicalPanel.jsx'
import UserPanel from './pages/UserPanel.jsx'
import ReceptionPanel from './pages/ReceptionPanel.jsx'
import './styles/app.css'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  const location = useLocation()
  const [adminProducts, setAdminProducts, adminProductsError] = useLocalStorage(STORAGE_KEYS.products, initialProducts)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [orders, setOrders, ordersError] = useLocalStorage(STORAGE_KEYS.orders, [])
  const [users, setUsers, usersError] = useLocalStorage('users', initialUsers)
  const [currentUser, setCurrentUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState('')
  const authTouched = useRef(false)

  useEffect(() => {
    let active = true
    listProducts()
      .then((catalog) => {
        if (active) {
          setProducts(catalog)
          setProductsError('')
        }
      })
      .catch((error) => {
        if (active) setProductsError(error.message)
      })
      .finally(() => {
        if (active) setProductsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    restoreSession()
      .then((user) => {
        if (active && !authTouched.current) setCurrentUser(user)
      })
      .catch((error) => {
        if (active && !authTouched.current) setAuthError(error.message)
      })
      .finally(() => {
        if (active) setAuthReady(true)
      })

    return () => {
      active = false
    }
  }, [])

  const currentUserId = currentUser?.id || ''
  const cartOwnerId = currentUser?.id || 'anonymous'
  const [cartBuckets, setCartBuckets, cartError] = useLocalStorage(
    STORAGE_KEYS.carts,
    readCartBuckets(cartOwnerId),
  )
  const cart = cartBuckets[cartOwnerId] || []
  const validCart = normalizeCart(cart, products)
  const cartQuantity = validCart.reduce((total, item) => total + item.quantity, 0)
  const storageError = adminProductsError || cartError || ordersError || usersError
  const requestedReturnTo = new URLSearchParams(location.search).get('returnTo')
  const accountReturnTo = requestedReturnTo?.startsWith('/mi-cuenta') ? requestedReturnTo : '/'

  function saveCart(nextCart) {
    setCartBuckets((previous) => ({
      ...previous,
      [cartOwnerId]: nextCart,
    }))
  }

  function handleAddToCart(product) {
    const actual = products.find((item) => item.code === product.code)
    if (!actual) return { ok: false, error: 'Producto no disponible.' }
    const result = addToCart(validCart, actual)
    if (result.ok) saveCart(result.cart)
    return result
  }

  function handleChangeQuantity(product, quantity) {
    const result = changeQuantity(validCart, product, quantity)
    if (result.ok) saveCart(result.cart)
    return result
  }

  async function handleCompletePurchase(delivery, idempotencyKey) {
    const order = await createOrder({
      items: validCart.map(({ code, quantity }) => ({ code, quantity })),
      delivery,
    }, idempotencyKey)

    setOrders((previous) => [
      {
        ...order,
        delivery,
        userId: currentUser?.id || null,
        persisted: true,
      },
      ...previous.filter((item) => item.id !== order.id),
    ])
    saveCart([])
    listProducts()
      .then(setProducts)
      .catch((error) => setProductsError(error.message))

    return order
  }

  async function handleLogin(credentials) {
    const user = await loginUser(credentials)
    setAuthenticatedUser(user)
    return user
  }

  async function handleRegister(newUser) {
    await registerUser(newUser)
    try {
      const user = await loginUser(newUser)
      setAuthenticatedUser(user)
      return user
    } catch (error) {
      throw new Error(
        `La cuenta se creó, pero no se pudo iniciar sesión: ${error.message} Intenta ingresar desde la página de acceso.`,
        { cause: error },
      )
    }
  }

  function setAuthenticatedUser(user) {
    authTouched.current = true
    setCurrentUser(user)
    setAuthError('')
  }

  async function handleLogout() {
    try {
      await logoutUser()
      authTouched.current = true
      setCurrentUser(null)
      setAuthError('')
    } catch (error) {
      setAuthError(error.message)
    }
  }

  async function refreshProductCatalog() {
    try {
      const catalog = await listProducts()
      setProducts(catalog)
      setProductsError('')
    } catch (error) {
      setProductsError(error.message)
      throw error
    }
  }

  function requireUser(element) {
    if (!authReady) return <p className="container" role="status">Verificando sesión...</p>
    return currentUser ? element : <Navigate to="/login" replace />
  }

  function requireCatalog(element) {
    if (productsLoading) return <p className="container" role="status">Cargando catálogo...</p>
    if (productsError) return <p className="container" role="alert">{productsError}</p>
    return element
  }

  return (
    <div className="app-shell">
      <ScrollToTop />
      <Header currentUser={currentUser} cartQuantity={cartQuantity} onLogout={handleLogout} />
      {storageError && <p className="container" role="alert">No pudimos guardar los cambios en este navegador.</p>}
      {authError && <p className="container alert alert-warning" role="alert">{authError}</p>}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/consejos" element={<Consejos />} />
          <Route path="/consejos/:id" element={<DetalleConsejo />} />
          <Route path="/productos" element={requireCatalog(<Productos products={products} cart={validCart} onAddToCart={handleAddToCart} />)} />
          <Route path="/productos/:code" element={requireCatalog(<DetalleProducto products={products} onAddToCart={handleAddToCart} />)} />
          <Route path="/carrito" element={requireCatalog(<Carrito products={products} cart={validCart} onChangeQuantity={handleChangeQuantity} onRemove={(code) => saveCart(removeFromCart(validCart, code))} onClear={() => saveCart([])} />)} />
          <Route path="/checkout" element={requireCatalog(<Checkout products={products} cart={validCart} currentUser={currentUser} onCompletePurchase={handleCompletePurchase} />)} />
          <Route path="/compra/:id" element={<ResultadoCompra orders={orders} />} />
          <Route
            path="/registro"
            element={<RegisterForm onRegister={handleRegister} />}
          />
          <Route
            path="/login"
            element={<LoginForm onLogin={handleLogin} />}
          />
          <Route
            path="/mascotas/nueva"
            element={requireUser(<PetForm returnTo={accountReturnTo} />)}
          />
          <Route
            path="/citas/nueva"
            element={requireUser(<AppointmentForm returnTo={accountReturnTo} />)}
          />
          <Route
            path="/citas"
            element={requireUser(<AppointmentsList userRole={currentUser?.role} currentUserId={currentUserId} />)}
          />
          <Route path="/mi-cuenta" element={requireUser(<UserPanel currentUser={currentUser} orders={orders} setOrders={setOrders} />)} />
          <Route path="/mi-cuenta/compras" element={requireUser(<UserPanel section="compras" currentUser={currentUser} orders={orders} setOrders={setOrders} />)} />
          <Route path="/mi-cuenta/mascotas" element={requireUser(<UserPanel section="mascotas" currentUser={currentUser} orders={orders} setOrders={setOrders} />)} />
          <Route path="/mi-cuenta/citas" element={requireUser(<UserPanel section="citas" currentUser={currentUser} orders={orders} setOrders={setOrders} />)} />
          <Route path="/mi-cuenta/historial" element={requireUser(<UserPanel section="historial" currentUser={currentUser} orders={orders} setOrders={setOrders} />)} />
          <Route path="/recepcion" element={requireUser(<ReceptionPanel currentUser={currentUser} users={users} />)} />
          <Route path="*" element={<NoEncontrado />} />
          <Route path="/admin" element={requireUser(<AdminPanel products={adminProducts} setProducts={setAdminProducts} onCatalogRefresh={refreshProductCatalog} onCurrentUserUpdate={setCurrentUser} users={users} currentUser={currentUser} />)} />
          <Route path="/admin/usuarios" element={requireUser(<AdminPanel section="usuarios" products={adminProducts} setProducts={setAdminProducts} onCatalogRefresh={refreshProductCatalog} onCurrentUserUpdate={setCurrentUser} users={users} setUsers={setUsers} currentUser={currentUser} />)} />
          <Route path="/admin/citas" element={requireUser(<AdminPanel key={location.key} section="citas" products={adminProducts} setProducts={setAdminProducts} onCatalogRefresh={refreshProductCatalog} onCurrentUserUpdate={setCurrentUser} users={users} currentUser={currentUser} />)} />
          <Route path="/admin/clinica" element={requireUser(<AdminClinicalPanel currentUser={currentUser} />)} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
