import { useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import AdminPanel from './AdminPanel.jsx'
import { getManagedProducts } from '../services/productsApi.js'

export default function AdminProductsPage({ currentUser, users, setUsers }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (currentUser?.role !== 'admin') return

    let active = true

    async function loadProducts() {
      try {
        const result = await getManagedProducts()
        if (active) setProducts(result)
      } catch (cause) {
        if (active) {
          setError(cause.message || 'No pudimos cargar la gestión de productos.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProducts()

    return () => {
      active = false
    }
  }, [currentUser?.role])

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  if (loading) {
    return <p className="container py-4" role="status">Cargando gestión de productos...</p>
  }

  if (error) {
    return <p className="container py-4" role="alert">{error}</p>
  }

  return (
    <AdminPanel
      products={products}
      setProducts={setProducts}
      users={users}
      setUsers={setUsers}
      currentUser={currentUser}
    />
  )
}