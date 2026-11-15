import { fetchWithAuth } from './authApi.js'

const APPOINTMENTS_URL = '/api/v1/citas'

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

export async function getMyAppointments() {
  const response = await fetchWithAuth(APPOINTMENTS_URL)
  const appointments = await readResponse(response, 'No pudimos cargar tus citas')

  if (!Array.isArray(appointments)) {
    throw new Error('El servidor devolvió una lista de citas inválida.')
  }

  return appointments
}

export async function getAvailableHours(fecha) {
  const url = `${APPOINTMENTS_URL}/disponibilidad?fecha=${encodeURIComponent(fecha)}`
  const response = await fetchWithAuth(url)
  const hours = await readResponse(response, 'No pudimos consultar los horarios')

  if (!Array.isArray(hours)) {
    throw new Error('El servidor devolvió horarios inválidos.')
  }

  return hours
}

export async function createMyAppointment(appointment) {
  const response = await fetchWithAuth(APPOINTMENTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointment),
  })

  return readResponse(response, 'No pudimos agendar la cita')
}

export async function cancelMyAppointment(id) {
  const response = await fetchWithAuth(
    `${APPOINTMENTS_URL}/${encodeURIComponent(id)}/cancelar`,
    { method: 'PATCH' },
  )

  return readResponse(response, 'No pudimos cancelar la cita')
}

export async function getManagedAppointments() {
  const response = await fetchWithAuth(`${APPOINTMENTS_URL}/gestion`)
  const appointments = await readResponse(
    response,
    'No pudimos cargar las citas',
  )

  if (!Array.isArray(appointments)) {
    throw new Error('El servidor devolvió una lista de citas inválida.')
  }

  return appointments
}

export async function createManagedAppointment(userId, appointment) {
  const response = await fetchWithAuth(`${APPOINTMENTS_URL}/gestion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: Number(userId),
      cita: appointment,
    }),
  })

  return readResponse(response, 'No pudimos crear la cita')
}

export async function rescheduleManagedAppointment(id, version, appointment) {
  const response = await fetchWithAuth(
    `${APPOINTMENTS_URL}/gestion/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version,
        cita: appointment,
      }),
    },
  )

  return readResponse(response, 'No pudimos reprogramar la cita')
}

export async function changeManagedAppointmentStatus(id, estado) {
  const response = await fetchWithAuth(
    `${APPOINTMENTS_URL}/gestion/${encodeURIComponent(id)}/estado`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    },
  )

  return readResponse(response, 'No pudimos actualizar el estado de la cita')
}