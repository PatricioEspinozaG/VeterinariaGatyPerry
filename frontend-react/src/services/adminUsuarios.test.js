import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAccessToken } from './auth.js'
import {
  createAdminUser,
  deactivateAdminUser,
  listAdminUsers,
  updateAdminUser,
} from './adminUsuarios.js'

vi.mock('./auth.js', () => ({
  getAccessToken: vi.fn(),
  normalizeUser: (user) => ({
    ...user,
    id: String(user.id),
    role: user.rol.toLowerCase(),
    active: user.activo,
    name: user.nombre,
    lastName: user.apellidos,
  }),
}))

describe('admin usuarios service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAccessToken.mockReturnValue('access-token')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('recorre las páginas y normaliza los usuarios del backend', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({
          content: [{
            id: 1,
            nombre: 'Ana',
            apellidos: 'Pérez',
            rol: 'CLIENTE',
            activo: true,
          }],
          totalPages: 2,
        })),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({
          content: [{
            id: 2,
            nombre: 'Luis',
            apellidos: 'Soto',
            rol: 'RECEPCION',
            activo: false,
          }],
          totalPages: 2,
        })),
      })

    await expect(listAdminUsers()).resolves.toMatchObject([
      { id: '1', name: 'Ana', role: 'cliente', active: true },
      { id: '2', name: 'Luis', role: 'recepcion', active: false },
    ])
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'http://localhost:8081/api/v1/admin/usuarios?pagina=0&tamano=100',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:8081/api/v1/admin/usuarios?pagina=1&tamano=100',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('crea, actualiza y desactiva usuarios con operaciones autenticadas', async () => {
    const user = {
      nombre: 'Ana',
      apellidos: 'Pérez',
      rol: 'CLIENTE',
      activo: true,
    }
    fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: () => Promise.resolve(JSON.stringify({ id: 3, ...user })),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ id: 3, ...user })),
      })
      .mockResolvedValueOnce({ ok: true, status: 204 })

    await expect(createAdminUser(user)).resolves.toMatchObject({ id: '3' })
    await expect(updateAdminUser(3, user)).resolves.toMatchObject({ id: '3' })
    await expect(deactivateAdminUser(3)).resolves.toBeNull()

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'http://localhost:8081/api/v1/admin/usuarios',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(user),
      }),
    )
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:8081/api/v1/admin/usuarios/3',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(user),
      }),
    )
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      'http://localhost:8081/api/v1/admin/usuarios/3',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})
