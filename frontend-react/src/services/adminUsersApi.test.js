import { expect, it, vi } from 'vitest'
import { createAdminUser, getAdminUsers } from './adminUsersApi.js'
import { fetchWithAuth } from './authApi.js'

vi.mock('./authApi.js', () => ({ fetchWithAuth: vi.fn() }))

function response(data, status = 200) {
  return {
    ok: status < 400,
    status,
    json: async () => data,
  }
}

it('carga usuarios de la API y traduce sus datos para el panel', async () => {
  fetchWithAuth.mockResolvedValue(response({
    totalPages: 1,
    content: [{
      id: 5, run: '123456785', nombre: 'Camila', apellidos: 'Soto',
      email: 'camila@example.test', telefono: '+56912345678',
      region: "O'Higgins", comuna: 'Rancagua', direccion: '',
      rol: 'RECEPCION', activo: true,
    }],
  }))

  const result = await getAdminUsers()

  expect(fetchWithAuth).toHaveBeenCalledWith('/api/v1/admin/usuarios?pagina=0&tamano=100')
  expect(result[0]).toMatchObject({ name: 'Camila', lastName: 'Soto', role: 'recepcion', active: true })
})

it('envía el rol y los datos obligatorios al crear un usuario real', async () => {
  fetchWithAuth.mockResolvedValue(response({
    id: 5, run: '123456785', nombre: 'Camila', apellidos: 'Soto',
    email: 'camila@example.test', telefono: '+56912345678',
    region: "O'Higgins", comuna: 'Rancagua', rol: 'RECEPCION', activo: true,
  }, 201))

  await createAdminUser({
    name: 'Camila', lastName: 'Soto', run: '123456785', email: 'camila@example.test',
    phone: '+56912345678', password: 'claveSegura123', confirmPassword: 'claveSegura123', region: "O'Higgins",
    commune: 'Rancagua', address: '', role: 'recepcion', active: true,
  })

  const [url, options] = vi.mocked(fetchWithAuth).mock.calls.at(-1)
  expect(url).toBe('/api/v1/admin/usuarios')
  expect(options.method).toBe('POST')
  expect(JSON.parse(options.body)).toMatchObject({ rol: 'RECEPCION', password: 'claveSegura123', confirmPassword: 'claveSegura123', run: '123456785' })
})
