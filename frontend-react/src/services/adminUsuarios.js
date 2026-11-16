import { getAccessToken, normalizeUser } from './auth.js'

const apiUrl = (import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081')
  .replace(/\/+$/, '')

async function request(path, { method = 'GET', body } = {}) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  }

  let response
  try {
    response = await fetch(`${apiUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  } catch {
    throw new Error('No fue posible conectar con el servidor de autenticación.')
  }

  if (response.status === 401) {
    throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  }
  if (response.status === 403) {
    throw new Error('No tienes permiso para realizar esta acción.')
  }
  if (response.status === 204) return null

  const responseText = await response.text()
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
    throw new Error(
      data?.detail || data?.message || `Error del servidor de autenticación (${response.status}).`,
    )
  }

  return data
}

export async function listAdminUsers() {
  const pageSize = 100
  const users = []
  let page = 0
  let totalPages

  do {
    const result = await request(
      `/api/v1/admin/usuarios?pagina=${page}&tamano=${pageSize}`,
    )
    if (
      !Array.isArray(result?.content)
      || !Number.isInteger(result.totalPages)
      || result.totalPages < 0
    ) {
      throw new Error('El servidor de autenticación devolvió una página inválida.')
    }

    users.push(...result.content.map(normalizeUser))
    totalPages = result.totalPages
    page += 1
  } while (page < totalPages)

  return users
}

export async function createAdminUser(user) {
  const result = await request('/api/v1/admin/usuarios', {
    method: 'POST',
    body: user,
  })
  return normalizeUser(result)
}

export async function updateAdminUser(id, user) {
  const result = await request(
    `/api/v1/admin/usuarios/${encodeURIComponent(id)}`,
    { method: 'PUT', body: user },
  )
  return normalizeUser(result)
}

export function deactivateAdminUser(id) {
  return request(`/api/v1/admin/usuarios/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
