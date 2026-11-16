import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAccessToken } from './auth.js'
import {
  annulClinicalAttention,
  annulClinicalVaccine,
  createClinicalAttention,
  createClinicalVaccine,
  getClinicalAttention,
  getClinicalVaccine,
  listPetClinicalHistory,
  updateClinicalAttention,
  updateClinicalVaccine,
} from './clinica.js'

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

  it('crea, obtiene, actualiza y anula atenciones usando el contrato del backend', async () => {
    const attention = { id: 8, mascotaId: 17, version: 2 }
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: () => Promise.resolve(JSON.stringify(attention)),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(attention)),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(attention)),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(attention)),
      })

    await expect(createClinicalAttention({ mascotaId: 17 })).resolves.toEqual(attention)
    await expect(getClinicalAttention(8)).resolves.toEqual(attention)
    await expect(updateClinicalAttention(8, { version: 2 })).resolves.toEqual(attention)
    await expect(annulClinicalAttention(8, { motivo: 'Duplicada', version: 2 }))
      .resolves.toEqual(attention)

    expect(fetch.mock.calls.map(([url, options]) => [url, options?.method || 'GET']))
      .toEqual([
        ['http://localhost:8086/api/v1/clinica/gestion/atenciones', 'POST'],
        ['http://localhost:8086/api/v1/clinica/atenciones/8', 'GET'],
        ['http://localhost:8086/api/v1/clinica/gestion/atenciones/8', 'PUT'],
        ['http://localhost:8086/api/v1/clinica/gestion/atenciones/8/anulacion', 'PATCH'],
      ])
  })

  it('crea, obtiene, actualiza y anula vacunas usando el contrato del backend', async () => {
    const vaccine = { id: 5, mascotaId: 17, version: 1 }
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: () => Promise.resolve(JSON.stringify(vaccine)),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(vaccine)),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(vaccine)),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(vaccine)),
      })

    await expect(createClinicalVaccine({ mascotaId: 17 })).resolves.toEqual(vaccine)
    await expect(getClinicalVaccine(5)).resolves.toEqual(vaccine)
    await expect(updateClinicalVaccine(5, { version: 1 })).resolves.toEqual(vaccine)
    await expect(annulClinicalVaccine(5, { motivo: 'Duplicada', version: 1 }))
      .resolves.toEqual(vaccine)

    expect(fetch.mock.calls.map(([url, options]) => [url, options?.method || 'GET']))
      .toEqual([
        ['http://localhost:8086/api/v1/clinica/gestion/vacunas', 'POST'],
        ['http://localhost:8086/api/v1/clinica/vacunas/5', 'GET'],
        ['http://localhost:8086/api/v1/clinica/gestion/vacunas/5', 'PUT'],
        ['http://localhost:8086/api/v1/clinica/gestion/vacunas/5/anulacion', 'PATCH'],
      ])
  })
})
