import { getAccessToken } from './auth.js'

const apiUrl = (import.meta.env.VITE_CITAS_API_URL || 'http://localhost:8083')
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
    throw new Error('No fue posible conectar con el servidor de citas.')
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
        throw new Error('El servidor de citas devolvió una respuesta inválida.')
      }
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || `Error del servidor de citas (${response.status}).`,
    )
  }

  return data
}

export async function listAppointments() {
  const appointments = await request('/api/v1/citas')
  if (!Array.isArray(appointments)) {
    throw new Error('El servidor de citas devolvió una lista inválida.')
  }
  return appointments
}

export async function listManagedAppointments() {
  const appointments = await request('/api/v1/citas/gestion')
  if (!Array.isArray(appointments)) {
    throw new Error('El servidor de citas devolvió una lista inválida.')
  }
  return appointments
}

export function createAppointment(appointment) {
  return request('/api/v1/citas', { method: 'POST', body: appointment })
}

export function createManagedAppointment(userId, appointment) {
  return request('/api/v1/citas/gestion', {
    method: 'POST',
    body: { userId, cita: appointment },
  })
}

export function rescheduleManagedAppointment(id, version, appointment) {
  return request(`/api/v1/citas/gestion/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: { version, cita: appointment },
  })
}

export function changeManagedAppointmentStatus(id, estado) {
  return request(`/api/v1/citas/gestion/${encodeURIComponent(id)}/estado`, {
    method: 'PATCH',
    body: { estado },
  })
}

export function cancelAppointment(id) {
  return request(`/api/v1/citas/${encodeURIComponent(id)}/cancelar`, { method: 'PATCH' })
}
