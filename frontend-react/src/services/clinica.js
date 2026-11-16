import { getAccessToken } from './auth.js'

const apiUrl = (import.meta.env.VITE_CLINICA_API_URL || 'http://localhost:8086')
  .replace(/\/+$/, '')

async function request(path) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  }

  let response
  try {
    response = await fetch(`${apiUrl}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  } catch {
    throw new Error('No fue posible conectar con el servicio clínico.')
  }

  if (response.status === 401) {
    throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  }
  if (response.status === 403) {
    throw new Error('No tienes permiso para consultar este historial.')
  }

  const responseText = response.status === 204 ? '' : await response.text()
  let data = null
  if (responseText) {
    try {
      data = JSON.parse(responseText)
    } catch {
      if (response.ok) {
        throw new Error('El servicio clínico devolvió una respuesta inválida.')
      }
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || `Error del servicio clínico (${response.status}).`,
    )
  }

  return data
}

export async function listPetClinicalHistory(petId, limit = 50) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('El límite del historial debe estar entre 1 y 100.')
  }

  const result = await request(
    `/api/v1/clinica/mascotas/${encodeURIComponent(petId)}/historial?limite=${limit}`,
  )
  if (
    !result
    || String(result.mascotaId) !== String(petId)
    || !Array.isArray(result.registros)
  ) {
    throw new Error('El servicio clínico devolvió un historial inválido.')
  }

  return result
}
