import { fetchWithAuth } from './authApi.js'

const PETS_URL = '/api/v1/mascotas'

export async function getMyPets() {
  const response = await fetchWithAuth(PETS_URL)

  if (!response.ok) {
    throw new Error(`No pudimos cargar tus mascotas (${response.status}).`)
  }

  const pets = await response.json()

  if (!Array.isArray(pets)) {
    throw new Error('El servidor devolvió una lista de mascotas inválida.')
  }

  return pets
}

export async function createMyPet(pet) {
  const response = await fetchWithAuth(PETS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pet),
  })

  if (!response.ok) {
    throw new Error(`No pudimos registrar la mascota (${response.status}).`)
  }

  return response.json()
}

export async function deleteMyPet(id) {
  const response = await fetchWithAuth(
    `${PETS_URL}/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  )

  if (!response.ok) {
    throw new Error(`No pudimos quitar la mascota (${response.status}).`)
  }
}