import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import useLocalStorage from './hooks/useLocalStorage.js'
import { readCartBuckets, STORAGE_KEYS } from './services/storage.js'
import { getMe, logout, refreshSession } from './services/authApi.js'
import { getProducts } from './services/productsApi.js'
import { users as initialUsers } from './data/users.js'
import {
  addToCart,
  changeQuantity,
  normalizeCart,
  removeFromCart,
} from './utils/cartLogic.js'
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
import LoginForm from './components/LoginForm.jsx'
import { RegisterForm } from './components/RegisterForm.jsx'
import PetForm from './components/PetForm.jsx'
import AppointmentForm from './components/AppointmentForm.jsx'
import AppointmentsList from './components/AppointmentsList.jsx'
import DetalleConsejo from './pages/DetalleConsejo.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import AdminProductsPage from './pages/AdminProductsPage.jsx'
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
  const [usuario, setUsuario] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [orders, setOrders, ordersError] = useLocalStorage(
    STORAGE_KEYS.orders,
    [],
  )
  const [users, setUsers, usersError] = useLocalStorage(
    'users',
    initialUsers,
  )

  useEffect(() => {
    let active = true

    async function loadProducts() {
      try {
        const catalog = await getProducts()
        if (active) setProducts(catalog)
      } catch (error) {
        if (active) {
          setProductsError(error.message || 'No pudimos cargar los productos.')
        }
      } finally {
        if (active) setProductsLoading(false)
      }
    }

    loadProducts()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function recoverSession() {
      try {
        const renewed = await refreshSession()

        if (renewed) {
          const actual = await getMe()
          if (active) setUsuario(actual)
        }
      } catch {
        if (active) setUsuario(null)
      } finally {
        if (active) setSessionLoading(false)
      }
    }

    recoverSession()

    return () => {
      active = false
    }
  }, [])

  // La API usa roles en mayúsculas; las vistas actuales usan minúsculas.
  const currentUser = usuario
    ? {
      ...usuario,
      role: usuario.rol?.toLowerCase(),
      active: usuario.activo,
    }
    : null

  const currentUserId = currentUser?.id ?? ''
  const cartOwnerId = String(currentUserId || 'anonymous')
  const [cartBuckets, setCartBuckets, cartError] = useLocalStorage(
    STORAGE_KEYS.carts,
    readCartBuckets(cartOwnerId),
  )
  const cart = cartBuckets[cartOwnerId] || []
  const validCart = normalizeCart(cart, products)
  const cartQuantity = validCart.reduce(
    (total, item) => total + item.quantity,
    0,
  )
  const storageError = cartError || ordersError || usersError

  const requestedReturnTo = new URLSearchParams(location.search).get('returnTo')
  const accountReturnTo = requestedReturnTo?.startsWith('/mi-cuenta')
    ? requestedReturnTo
    : '/'

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

  function handleCompletePurchase(delivery) {
    const result = preparePurchase(validCart, products, delivery)
    if (!result.ok) return result

    const orderId = crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString()

    setProducts(result.products)
    setOrders((previous) => [
      ...previous,
      {
        id: orderId,
        ...result,
        delivery,
        userId: currentUser?.id || null,
        createdAt: new Date().toISOString(),
      },
    ])
    saveCart([])

    return { ok: true, orderId }
  }

  async function handleLogout() {
    setSessionError('')

    try {
      await logout()
    } catch {
      setSessionError(
        'No pudimos confirmar el cierre de sesión con el servidor. Inténtalo nuevamente.',
      )
      return
    }

    setUsuario(null)
  }

  function protectedPage(element) {
    if (sessionLoading) {
      return (
        <p className="container py-4" role="status">
          Comprobando sesión...
        </p>
      )
    }

    return currentUser ? element : <Navigate to="/login" replace />
  }

  return (
    <div className="app-shell">
      <ScrollToTop />
      <Header
        currentUser={currentUser}
        cartQuantity={cartQuantity}
        onLogout={handleLogout}
      />

      {storageError && (
        <p className="container" role="alert">
          No pudimos guardar los cambios en este navegador.
        </p>
      )}
      {sessionError && (
        <p className="container" role="alert">{sessionError}</p>
      )}
      {productsLoading && (
        <p className="container" role="status">
          Cargando productos...
        </p>
      )}
      {productsError && (
        <p className="container" role="alert">
          {productsError}
        </p>
      )}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/consejos" element={<Consejos />} />
          <Route path="/consejos/:id" element={<DetalleConsejo />} />

          <Route
            path="/productos"
            element={
              productsLoading || productsError ? null : (
                <Productos
                  products={products}
                  cart={validCart}
                  onAddToCart={handleAddToCart}
                />
              )
            }
          />
          <Route
            path="/productos/:code"
            element={
              productsLoading || productsError ? null : (
                <DetalleProducto
                  products={products}
                  onAddToCart={handleAddToCart}
                />
              )
            }
          />
          <Route
            path="/carrito"
            element={
              <Carrito
                products={products}
                cart={validCart}
                onChangeQuantity={handleChangeQuantity}
                onRemove={(code) =>
                  saveCart(removeFromCart(validCart, code))
                }
                onClear={() => saveCart([])}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <Checkout
                products={products}
                cart={validCart}
                currentUser={currentUser}
                onCompletePurchase={handleCompletePurchase}
              />
            }
          />
          <Route
            path="/compra/:id"
            element={<ResultadoCompra orders={orders} />}
          />

          <Route
            path="/registro"
            element={
              <RegisterForm
                onRegister={(usuarioRegistrado) => {
                  setUsuario(usuarioRegistrado)
                  setSessionError('')
                }}
              />
            }
          />
          <Route
            path="/login"
            element={
              <LoginForm
                onLogin={(usuarioAutenticado) => {
                  setUsuario(usuarioAutenticado)
                  setSessionError('')
                }}
              />
            }
          />

          <Route
            path="/mascotas/nueva"
            element={protectedPage(
              <PetForm
                currentUserId={currentUserId}
                returnTo={accountReturnTo}
              />,
            )}
          />
          <Route
            path="/citas/nueva"
            element={protectedPage(
              <AppointmentForm
                currentUserId={currentUserId}
                returnTo={accountReturnTo}
              />,
            )}
          />
          <Route
            path="/citas"
            element={protectedPage(
              <AppointmentsList
                userRole={currentUser?.role}
                currentUserId={currentUserId}
              />,
            )}
          />

          <Route
            path="/mi-cuenta"
            element={protectedPage(
              <UserPanel
                currentUser={currentUser}
                orders={orders}
                setOrders={setOrders}
              />,
            )}
          />
          <Route
            path="/mi-cuenta/compras"
            element={protectedPage(
              <UserPanel
                section="compras"
                currentUser={currentUser}
                orders={orders}
                setOrders={setOrders}
              />,
            )}
          />
          <Route
            path="/mi-cuenta/mascotas"
            element={protectedPage(
              <UserPanel
                section="mascotas"
                currentUser={currentUser}
                orders={orders}
                setOrders={setOrders}
              />,
            )}
          />
          <Route
            path="/mi-cuenta/citas"
            element={protectedPage(
              <UserPanel
                section="citas"
                currentUser={currentUser}
                orders={orders}
                setOrders={setOrders}
              />,
            )}
          />
          <Route
            path="/recepcion"
            element={protectedPage(
              <ReceptionPanel currentUser={currentUser} users={users} />,
            )}
          />
          <Route
            path="/admin"
            element={protectedPage(
              <AdminProductsPage
                currentUser={currentUser}
                users={users}
                setUsers={setUsers}
              />,
            )}
          />
          <Route
            path="/admin/usuarios"
            element={protectedPage(
              <AdminPanel
                section="usuarios"
                products={products}
                setProducts={setProducts}
                users={users}
                setUsers={setUsers}
                currentUser={currentUser}
              />,
            )}
          />
          <Route
            path="/admin/citas"
            element={protectedPage(
              <AdminPanel
                key={location.key}
                section="citas"
                products={products}
                setProducts={setProducts}
                users={users}
                currentUser={currentUser}
              />,
            )}
          />

          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App