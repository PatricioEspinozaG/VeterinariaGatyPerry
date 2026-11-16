import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAccessToken, loginUser, logoutUser, registerUser, restoreSession } from './auth.js'

const usuario = {
  id: 12,
  nombre: 'Camila',
  apellidos: 'Soto',
  email: 'camila@gmail.com',
  rol: 'CLIENTE',
  activo: true,
}

function response(status, data) {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => data === undefined ? '' : JSON.stringify(data),
  }
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

describe('servicio de autenticación', () => {
  it('inicia sesión contra auth-service y normaliza el usuario', async () => {
    fetch.mockResolvedValue(response(200, {
      accessToken: 'jwt-access',
      usuario,
    }))

    const authenticatedUser = await loginUser({
      email: 'camila@gmail.com',
      password: 'clave-segura',
    })

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8081/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          email: 'camila@gmail.com',
          password: 'clave-segura',
        }),
      }),
    )
    expect(authenticatedUser).toMatchObject({
      id: '12',
      name: 'Camila',
      role: 'cliente',
      active: true,
    })
    expect(getAccessToken()).toBe('jwt-access')
  })

  it('envía registro y credenciales de refresh-cookie en solicitudes de sesión', async () => {
    fetch
      .mockResolvedValueOnce(response(201, usuario))
      .mockResolvedValueOnce(response(200, {
        accessToken: 'jwt-refresh',
        usuario,
      }))

    await registerUser({
      nombre: 'Camila',
      apellidos: 'Soto',
      run: '12.345.678-5',
      email: 'camila@gmail.com',
      telefono: '+56 9 1234 5678',
      password: 'clave-segura',
      confirmPassword: 'clave-segura',
      region: 'O’Higgins',
      comuna: 'Rancagua',
      direccion: '',
    })
    const restoredUser = await restoreSession()

    expect(fetch.mock.calls[0][0]).toBe('http://localhost:8081/api/v1/auth/registro')
    expect(fetch.mock.calls[1][1]).toMatchObject({
      credentials: 'include',
      headers: { 'X-Gaty-Client': 'web' },
    })
    expect(restoredUser.id).toBe('12')
    expect(getAccessToken()).toBe('jwt-refresh')
  })

  it('trata una cookie ausente como sesión anónima', async () => {
    fetch.mockResolvedValue(response(401, { detail: 'Unauthorized' }))

    await expect(restoreSession()).resolves.toBeNull()
    expect(getAccessToken()).toBeNull()
  })

  it('comparte una sola renovación si el arranque consulta la sesión más de una vez', async () => {
    fetch.mockResolvedValue(response(200, {
      accessToken: 'jwt-refresh',
      usuario,
    }))

    const [firstUser, secondUser] = await Promise.all([
      restoreSession(),
      restoreSession(),
    ])

    expect(fetch).toHaveBeenCalledOnce()
    expect(firstUser).toEqual(secondUser)
  })

  it('cierra la sesión en el servidor antes de borrar el token', async () => {
    fetch.mockResolvedValueOnce(response(200, {
      accessToken: 'jwt-access',
      usuario,
    }))
    await loginUser({ email: usuario.email, password: 'clave-segura' })
    fetch.mockResolvedValueOnce(response(204))

    await logoutUser()

    expect(fetch.mock.calls[1][0]).toBe('http://localhost:8081/api/v1/auth/logout')
    expect(fetch.mock.calls[1][1]).toMatchObject({
      credentials: 'include',
      headers: { 'X-Gaty-Client': 'web' },
    })
    expect(getAccessToken()).toBeNull()
  })

  it('propaga errores HTTP del servidor sin tratar el registro como exitoso', async () => {
    fetch.mockResolvedValue(response(409, { detail: 'RUN ya registrado' }))

    await expect(registerUser({})).rejects.toThrow('El correo o RUN ya está registrado.')
  })
})
