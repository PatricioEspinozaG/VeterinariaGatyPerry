import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAccessToken } from './auth.js'
import {
  createProduct,
  discontinueProduct,
  listManagedProducts,
  listProducts,
  updateProduct,
} from './productos.js'

vi.mock('./auth.js', () => ({
  getAccessToken: vi.fn(),
}))

describe('productos service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAccessToken.mockReturnValue('admin-token')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('carga el catálogo público del backend', async () => {
    const products = [{ code: 'ME001', name: 'Amoxibay', stock: 5 }]
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(products)),
    })

    await expect(listProducts()).resolves.toEqual(products)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8084/api/v1/productos',
    )
  })

  it('expone errores del backend en lugar de devolver un catálogo vacío', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 503,
      text: () => Promise.resolve(JSON.stringify({ detail: 'Catálogo temporalmente no disponible.' })),
    })

    await expect(listProducts()).rejects.toThrow(
      'Catálogo temporalmente no disponible.',
    )
  })

  it('lista todos los productos de gestión con el token de administrador', async () => {
    const products = [{ code: 'ME001', name: 'Amoxibay' }]
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(products)),
    })

    await expect(listManagedProducts()).resolves.toEqual(products)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8084/api/v1/productos/gestion',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer admin-token' },
      }),
    )
  })

  it('crea, actualiza y descontinúa productos usando las rutas de gestión', async () => {
    const product = {
      code: 'ME099',
      name: 'Producto demo',
      category: 'Medicamentos',
      price: 2500,
      stock: 5,
      status: 'Disponible',
    }
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: () => Promise.resolve(JSON.stringify(product)),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ...product, price: 3000 })),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        text: () => Promise.resolve(''),
      })

    await expect(createProduct(product)).resolves.toEqual(product)
    await expect(updateProduct('ME099', { ...product, price: 3000 }))
      .resolves.toMatchObject({ price: 3000 })
    await expect(discontinueProduct('ME099')).resolves.toBeNull()

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'http://localhost:8084/api/v1/productos/gestion',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer admin-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      }),
    )
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:8084/api/v1/productos/gestion/ME099',
      expect.objectContaining({ method: 'PUT' }),
    )
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      'http://localhost:8084/api/v1/productos/gestion/ME099',
      expect.objectContaining({
        method: 'DELETE',
        headers: { Authorization: 'Bearer admin-token' },
      }),
    )
  })

  it('rechaza una operación de gestión sin sesión', async () => {
    getAccessToken.mockReturnValue(null)

    await expect(listManagedProducts()).rejects.toThrow(
      'Tu sesión expiró. Inicia sesión nuevamente.',
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})
