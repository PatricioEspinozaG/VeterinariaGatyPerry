import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAccessToken } from './auth.js'
import { createOrder } from './pedidos.js'

vi.mock('./auth.js', () => ({
  getAccessToken: vi.fn(),
}))

describe('pedidos service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAccessToken.mockReturnValue('access-token')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('registra el pedido con token e idempotencia', async () => {
    const request = {
      items: [{ code: 'ME001', quantity: 2 }],
      delivery: {
        name: 'Ana Soto',
        email: 'ana@example.com',
        method: 'retiro',
        region: '',
        commune: '',
        address: '',
      },
    }
    const order = { id: 'pedido-1', items: request.items }
    fetch.mockResolvedValue({
      ok: true,
      status: 201,
      text: () => Promise.resolve(JSON.stringify(order)),
    })

    await expect(createOrder(request, 'idempotency-uuid')).resolves.toEqual(order)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8085/api/v1/pedidos',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer access-token',
          'Content-Type': 'application/json',
          'Idempotency-Key': 'idempotency-uuid',
        },
        body: JSON.stringify(request),
      }),
    )
  })

  it('permite registrar pedidos de invitados sin token', async () => {
    getAccessToken.mockReturnValue(null)
    fetch.mockResolvedValue({
      ok: true,
      status: 201,
      text: () => Promise.resolve(JSON.stringify({ id: 'pedido-2', items: [] })),
    })

    await createOrder({ items: [], delivery: {} }, 'idempotency-uuid')

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8085/api/v1/pedidos',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': 'idempotency-uuid',
        },
      }),
    )
  })

  it('expone errores de stock devueltos por el backend', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 409,
      text: () => Promise.resolve(JSON.stringify({ detail: 'Stock insuficiente.' })),
    })

    await expect(
      createOrder({ items: [], delivery: {} }, 'idempotency-uuid'),
    ).rejects.toThrow('Stock insuficiente.')
  })
})
