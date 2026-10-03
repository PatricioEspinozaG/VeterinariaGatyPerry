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
import './styles/app.css'

function App() {
  const [products, , productsError] = useLocalStorage(
    STORAGE_KEYS.products,
    initialProducts,
  )
  const [cart, setCart, cartError] = useLocalStorage(STORAGE_KEYS.cart, [])
  const [users, , usersError] = useLocalStorage(
    STORAGE_KEYS.users,
    initialUsers,
  )
  const [session, setSession, sessionError] = useLocalStorage(
    STORAGE_KEYS.session,
    null,
  )

  const currentUser =
    users.find((user) => user.id === session?.userId && user.active) ?? null
  const validCart = Array.isArray(cart) ? cart : []
  const cartQuantity = validCart.reduce(
    (total, item) => total + item.quantity,
    0,
  )
  const storageError =
    productsError || cartError || usersError || sessionError

  function handleAddToCart(product) {
    const actual = products.find((item) => item.code === product.code)
    if (!actual || actual.stock <= 0) {
      return { ok: false, error: 'Producto agotado.' }
    }

    const alreadyAdded =
      validCart.find((item) => item.code === actual.code)?.quantity ?? 0
    if (alreadyAdded >= actual.stock) {
      return { ok: false, error: 'No puedes superar el stock disponible.' }
    }

    setCart((current) => {
      const existing = current.find((item) => item.code === actual.code)
      return existing
        ? current.map((item) =>
            item.code === actual.code
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...current, { code: actual.code, quantity: 1 }]
    })

    return { ok: true }
  }

  return (
    <div className="app-shell">
      <Header
        currentUser={currentUser}
        cartQuantity={cartQuantity}
        onLogout={() => setSession(null)}
      />

      {storageError && (
        <p className="container" role="alert">
          No pudimos guardar los cambios en este navegador.
        </p>
      )}

      <main>
        <p className="container" role="status">
          Unidades en el carrito: {cartQuantity}
        </p>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/consejos" element={<Consejos />} />
          <Route
            path="/productos"
            element={
              <Productos
                products={products}
                cart={validCart}
                onAddToCart={handleAddToCart}
              />
            }
          />
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App