import { fetchWithAuth } from './authApi.js'

const CLINIC_URL = '/api/v1/clinica'

async function readResponse(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('json')
    ? await response.json()
    : null

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      `${fallbackMessage} (${response.status}).`,
    )
  }

  return data
}

export async function getPetHistory(petId, limit = 50) {
  const url = `${CLINIC_URL}/mascotas/${encodeURIComponent(petId)}/historial?limite=${limit}`
  const response = await fetchWithAuth(url)
  const history = await readResponse(
    response,
    'No pudimos cargar el historial clínico',
  )

  if (!history || !Array.isArray(history.registros)) {
    throw new Error('El servidor devolvió un historial clínico inválido.')
  }

  return history
}

export async function hasClinicalVisitForAppointment(appointmentId) {
  const url = `${CLINIC_URL}/gestion/atenciones/cita/${encodeURIComponent(appointmentId)}/registrada`
  const response = await fetchWithAuth(url)
  const registered = await readResponse(response, 'No pudimos comprobar la atención')
  if (typeof registered !== 'boolean') {
    throw new Error('El servidor devolvió un estado clínico inválido.')
  }
  return registered
}

export async function createClinicalVisit(visit) {
  const response = await fetchWithAuth(`${CLINIC_URL}/gestion/atenciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visit),
  })

  return readResponse(response, 'No pudimos registrar la atención')
}