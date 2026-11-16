import { getAccessToken } from './auth.js'

const apiUrl = (import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081')
  .replace(/\/+$/, '')

export async function listAppointmentClients() {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  }

  let response
  try {
    response = await fetch(`${apiUrl}/api/v1/auth/gestion/clientes`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
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
    throw new Error(
      data?.detail || data?.message || `Error del servidor de autenticación (${response.status}).`,
    )
  }
  if (!Array.isArray(data)) {
    throw new Error('El servidor de autenticación devolvió una lista inválida.')
  }

  return data
}
