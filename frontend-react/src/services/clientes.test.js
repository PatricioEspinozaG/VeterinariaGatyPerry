import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAccessToken } from './authApi.js'
import { listAppointmentClients } from './clientes.js'

vi.mock('./authApi.js', () => ({
  getAccessToken: vi.fn(),
  apiUrl: (path) => path,
}))

describe('clientes service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAccessToken.mockReturnValue('access-token')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lista clientes activos con el token de sesión', async () => {
    const clients = [{ id: 7, nombre: 'Ana', apellidos: 'Pérez' }]
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(clients)),
    })

    await expect(listAppointmentClients()).resolves.toEqual(clients)
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/auth/gestion/clientes',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer access-token' },
      }),
    )
  })
})
