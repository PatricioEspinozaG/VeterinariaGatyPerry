import { apiUrl, getAccessToken } from './authApi.js'

async function request(path, { method = 'GET', body } = {}) {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  }

  let response
  try {
    response = await fetch(apiUrl(path), {
      ...(method === 'GET' ? {} : { method }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  } catch {
    throw new Error('No fue posible conectar con el servicio clínico.')
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

function requireRecord(record, entity) {
  if (!record || record.id == null) {
    throw new Error(`El servicio clínico devolvió una ${entity} inválida.`)
  }
  return record
}

export async function getClinicalAttention(id) {
  return requireRecord(
    await request(`/api/v1/clinica/atenciones/${encodeURIComponent(id)}`),
    'atención',
  )
}

export async function createClinicalAttention(attention) {
  return requireRecord(
    await request('/api/v1/clinica/gestion/atenciones', {
      method: 'POST',
      body: attention,
    }),
    'atención',
  )
}

export async function updateClinicalAttention(id, attention) {
  return requireRecord(
    await request(
      `/api/v1/clinica/gestion/atenciones/${encodeURIComponent(id)}`,
      { method: 'PUT', body: attention },
    ),
    'atención',
  )
}

export async function annulClinicalAttention(id, annulment) {
  return requireRecord(
    await request(
      `/api/v1/clinica/gestion/atenciones/${encodeURIComponent(id)}/anulacion`,
      { method: 'PATCH', body: annulment },
    ),
    'atención',
  )
}

export async function getClinicalVaccine(id) {
  return requireRecord(
    await request(`/api/v1/clinica/vacunas/${encodeURIComponent(id)}`),
    'vacuna',
  )
}

export async function createClinicalVaccine(vaccine) {
  return requireRecord(
    await request('/api/v1/clinica/gestion/vacunas', {
      method: 'POST',
      body: vaccine,
    }),
    'vacuna',
  )
}

export async function updateClinicalVaccine(id, vaccine) {
  return requireRecord(
    await request(
      `/api/v1/clinica/gestion/vacunas/${encodeURIComponent(id)}`,
      { method: 'PUT', body: vaccine },
    ),
    'vacuna',
  )
}

export async function annulClinicalVaccine(id, annulment) {
  return requireRecord(
    await request(
      `/api/v1/clinica/gestion/vacunas/${encodeURIComponent(id)}/anulacion`,
      { method: 'PATCH', body: annulment },
    ),
    'vacuna',
  )
}
