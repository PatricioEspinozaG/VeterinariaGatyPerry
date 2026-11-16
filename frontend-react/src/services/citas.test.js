import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAccessToken } from './auth.js'
import { cancelAppointment, createAppointment, listAppointments } from './citas.js'

vi.mock('./auth.js', () => ({
  getAccessToken: vi.fn(),
}))

describe('citas service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAccessToken.mockReturnValue('access-token')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lista citas con el token de sesión', async () => {
    const appointments = [{ id: 1, mascotaId: 10, estado: 'PENDIENTE' }]
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(appointments)),
    })

    await expect(listAppointments()).resolves.toEqual(appointments)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8083/api/v1/citas',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer access-token' },
      }),
    )
  })

  it('crea y cancela citas usando las rutas del servicio', async () => {
    const appointment = {
      mascotaId: 10,
      servicio: 'Consulta General',
      fecha: '2099-10-20',
      hora: '10:00',
      motivo: 'Control preventivo',
    }
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: () => Promise.resolve(JSON.stringify({ id: 1, ...appointment })),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ id: 1, estado: 'CANCELADA' })),
      })

    await expect(createAppointment(appointment)).resolves.toMatchObject({ id: 1 })
    await expect(cancelAppointment(1)).resolves.toMatchObject({ estado: 'CANCELADA' })

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'http://localhost:8083/api/v1/citas',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(appointment),
      }),
    )
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:8083/api/v1/citas/1/cancelar',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })

  it('muestra errores de disponibilidad devueltos por el backend', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 409,
      text: () => Promise.resolve(JSON.stringify({ detail: 'El horario ya está ocupado.' })),
    })

    await expect(createAppointment({ mascotaId: 10 })).rejects.toThrow(
      'El horario ya está ocupado.',
    )
  })
})
