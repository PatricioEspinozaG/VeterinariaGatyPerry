import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { listProducts } from './productos.js'

describe('productos service', () => {
  beforeEach(() => {
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
})
