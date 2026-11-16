import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAccessToken } from './auth.js'
import {
  createOrder,
  listManagedOrders,
  listOrders,
  updateManagedOrderStatus,
} from './pedidos.js'

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

  it('lista las compras de la cuenta autenticada', async () => {
    const orders = [{ id: 'pedido-1', items: [], total: 0 }]
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(orders)),
    })

    await expect(listOrders()).resolves.toEqual(orders)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8085/api/v1/pedidos/mis-pedidos',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer access-token' },
      }),
    )
  })

  it('rechaza una respuesta de historial con formato inválido', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ items: [] })),
    })

    await expect(listOrders()).rejects.toThrow(
      'El servidor de pedidos devolvió una lista inválida.',
    )
  })

  it('lista todos los pedidos con datos de entrega para el personal', async () => {
    const orders = [{
      id: 'pedido-1',
      customerName: 'Ana Soto',
      customerEmail: 'ana@example.com',
      items: [],
      deliveryMethod: 'retiro',
      status: 'REGISTRADO',
      version: 0,
    }]
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(orders)),
    })

    await expect(listManagedOrders()).resolves.toEqual(orders)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8085/api/v1/pedidos/gestion',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer access-token' },
      }),
    )
  })

  it('cambia el estado del pedido con control de versión', async () => {
    const order = {
      id: 'pedido-1',
      customerName: 'Ana Soto',
      customerEmail: 'ana@example.com',
      items: [],
      deliveryMethod: 'envio',
      status: 'EN_PREPARACION',
      version: 1,
    }
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(order)),
    })

    await expect(
      updateManagedOrderStatus('pedido-1', 'EN_PREPARACION', 0),
    ).resolves.toEqual(order)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8085/api/v1/pedidos/gestion/pedido-1/estado',
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer access-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: 'EN_PREPARACION', version: 0 }),
      }),
    )
  })
})
