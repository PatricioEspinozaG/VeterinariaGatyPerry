const authApiUrl = (import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081')
  .replace(/\/+$/, '')

let accessToken = null
let refreshRequest = null

function normalizeUser(user) {
  if (
    !user
    || user.id == null
    || typeof user.rol !== 'string'
    || typeof user.activo !== 'boolean'
  ) {
    throw new Error('El servidor devolvió datos de usuario incompletos.')
  }

  return {
    ...user,
    id: String(user.id),
    role: user.rol.toLowerCase(),
    active: user.activo,
    name: user.nombre,
    lastName: user.apellidos,
  }
}

async function request(path, { body, headers = {}, allowUnauthorized = false } = {}) {
  let response
  try {
    response = await fetch(`${authApiUrl}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  } catch {
    throw new Error('No fue posible conectar con el servidor de autenticación.')
  }

  if (response.status === 401 && allowUnauthorized) return null

  const responseText = response.status === 204 ? '' : await response.text()
  let data = null
  if (responseText) {
    try {
      data = JSON.parse(responseText)
    } catch {
      if (response.ok) {
        throw new Error('El servidor de autenticación devolvió una respuesta inválida.')
      }
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Credenciales incorrectas o sesión vencida.')
    }
    if (response.status === 409) {
      throw new Error('El correo o RUN ya está registrado.')
    }

    throw new Error(
      data?.detail || data?.message || `Error del servidor de autenticación (${response.status}).`,
    )
  }

  return data
}

export async function loginUser(credentials) {
  const response = await request('/api/v1/auth/login', { body: credentials })
  if (!response?.accessToken || !response.usuario) {
    throw new Error('El servidor de autenticación devolvió una respuesta incompleta.')
  }
  const user = normalizeUser(response.usuario)
  accessToken = response.accessToken
  return user
}

export async function registerUser(user) {
  const response = await request('/api/v1/auth/registro', { body: user })
  if (!response) {
    throw new Error('El servidor no confirmó el registro de la cuenta.')
  }
  return normalizeUser(response)
}

export function restoreSession() {
  if (!refreshRequest) {
    refreshRequest = request('/api/v1/auth/refresh', {
      headers: { 'X-Gaty-Client': 'web' },
      allowUnauthorized: true,
    })
      .then((response) => {
        if (!response) {
          accessToken = null
          return null
        }
        if (!response.accessToken || !response.usuario) {
          throw new Error('El servidor de autenticación devolvió una respuesta incompleta.')
        }
        const user = normalizeUser(response.usuario)
        accessToken = response.accessToken
        return user
      })
      .finally(() => {
        refreshRequest = null
      })
  }
  return refreshRequest
}

export async function logoutUser() {
  await request('/api/v1/auth/logout', {
    headers: { 'X-Gaty-Client': 'web' },
  })
  accessToken = null
}

export function getAccessToken() {
  return accessToken
}
