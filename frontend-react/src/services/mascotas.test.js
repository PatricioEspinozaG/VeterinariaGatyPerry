import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAccessToken } from './auth.js'
import { createPet, deletePet, listManagedPets, listPets } from './mascotas.js'

vi.mock('./auth.js', () => ({
  getAccessToken: vi.fn(),
}))

describe('mascotas service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAccessToken.mockReturnValue('access-token')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lista mascotas enviando el token de sesión', async () => {
    const pets = [{ id: 1, nombre: 'Luna' }]
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(pets)),
    })

    await expect(listPets()).resolves.toEqual(pets)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8082/api/v1/mascotas',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer access-token' },
      }),
    )
  })

  it('lista las mascotas del cliente seleccionado para gestión de citas', async () => {
    const pets = [{ id: 10, nombre: 'Luna' }]
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(pets)),
    })

    await expect(listManagedPets(7)).resolves.toEqual(pets)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8082/api/v1/mascotas/gestion?clienteId=7',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer access-token' },
      }),
    )
  })

  it('crea y elimina mascotas mediante sus endpoints', async () => {
    const pet = { nombre: 'Luna', especie: 'Gato', raza: 'Mestiza', edad: 3 }
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: () => Promise.resolve(JSON.stringify({ id: 1, ...pet })),
      })
      .mockResolvedValueOnce({ ok: true, status: 204 })

    await expect(createPet(pet)).resolves.toEqual({ id: 1, ...pet })
    await expect(deletePet(1)).resolves.toBeNull()

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'http://localhost:8082/api/v1/mascotas',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(pet),
      }),
    )
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:8082/api/v1/mascotas/1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('informa si la sesión ya no tiene permiso', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 403,
      text: () => Promise.resolve(''),
    })

    await expect(listPets()).rejects.toThrow('No tienes permiso para realizar esta acción.')
  })
})
