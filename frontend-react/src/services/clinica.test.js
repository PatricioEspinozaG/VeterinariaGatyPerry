import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAccessToken } from './auth.js'
import { listPetClinicalHistory } from './clinica.js'

vi.mock('./auth.js', () => ({
  getAccessToken: vi.fn(),
}))

describe('servicio clínico', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAccessToken.mockReturnValue('access-token')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('consulta el historial de una mascota con token y límite', async () => {
    const history = {
      mascotaId: 17,
      limite: 25,
      registros: [{
        id: 8,
        tipo: 'VACUNA',
        fecha: '2026-10-12T00:00:00',
        estado: 'ACTIVA',
        nombreVacuna: 'Antirrábica',
        profesionalResponsable: 'Dra. Vet',
      }],
    }
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(history)),
    })

    await expect(listPetClinicalHistory('17', 25)).resolves.toEqual(history)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8086/api/v1/clinica/mascotas/17/historial?limite=25',
      { headers: { Authorization: 'Bearer access-token' } },
    )
  })

  it('rechaza respuestas que no corresponden a la mascota solicitada', async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({
        mascotaId: 18,
        registros: [],
      })),
    })

    await expect(listPetClinicalHistory(17)).rejects.toThrow(
      'El servicio clínico devolvió un historial inválido.',
    )
  })

  it('no envía solicitudes con un límite fuera del contrato', async () => {
    await expect(listPetClinicalHistory(17, 101)).rejects.toThrow(
      'El límite del historial debe estar entre 1 y 100.',
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})
