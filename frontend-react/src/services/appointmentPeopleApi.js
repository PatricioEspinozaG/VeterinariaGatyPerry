import { fetchWithAuth } from './authApi.js'

async function getDetails(url, label) {
  const response = await fetchWithAuth(url)
  if (!response.ok) throw new Error(`No pudimos cargar ${label} (${response.status}).`)
  return response.json()
}

export function getManagedClient(id) {
  return getDetails(`/api/v1/auth/gestion/clientes/${encodeURIComponent(id)}`, 'el cliente')
}

export function getManagedPet(id) {
  return getDetails(`/api/v1/mascotas/gestion/${encodeURIComponent(id)}`, 'la mascota')
}
