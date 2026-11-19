import { getAccessToken } from './authApi.js'

const apiUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080')
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
    throw new Error('No fue posible conectar con el servidor de mascotas.')
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
        throw new Error('El servidor de mascotas devolvió una respuesta inválida.')
      }
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || `Error del servidor de mascotas (${response.status}).`,
    )
  }

  return data
}

export function listPets() {
  return request('/api/v1/mascotas')
}

export async function listManagedPets(clientId) {
  const pets = await request(
    `/api/v1/mascotas/gestion?clienteId=${encodeURIComponent(clientId)}`,
  )
  if (!Array.isArray(pets)) {
    throw new Error('El servidor de mascotas devolvió una lista inválida.')
  }
  return pets
}

export function createPet(pet) {
  return request('/api/v1/mascotas', { method: 'POST', body: pet })
}

export function deletePet(id) {
  return request(`/api/v1/mascotas/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
