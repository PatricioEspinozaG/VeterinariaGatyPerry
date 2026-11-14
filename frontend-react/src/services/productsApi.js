import { fetchWithAuth } from './authApi.js'

const PRODUCTS_URL = '/api/v1/productos'

export async function getProducts() {
  const response = await fetch(PRODUCTS_URL)

  if (!response.ok) {
    throw new Error(`No pudimos cargar los productos (${response.status}).`)
  }

  const products = await response.json()

  if (!Array.isArray(products)) {
    throw new Error('El servidor devolvió un catálogo inválido.')
  }

  return products
}

export async function getManagedProducts() {
  const response = await fetchWithAuth(`${PRODUCTS_URL}/gestion`)

  if (response.status === 403) {
    throw new Error('Tu cuenta no tiene permiso para gestionar productos.')
  }

  if (!response.ok) {
    throw new Error(`No pudimos cargar la gestión de productos (${response.status}).`)
  }

  const products = await response.json()

  if (!Array.isArray(products)) {
    throw new Error('El servidor devolvió una lista de productos inválida.')
  }

  return products
}

async function readWriteResponse(response) {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('json')
    ? await response.json()
    : null

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      `No pudimos guardar el producto (${response.status}).`,
    )
  }

  return data
}

export async function createProduct(product) {
  const response = await fetchWithAuth(`${PRODUCTS_URL}/gestion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })

  return readWriteResponse(response)
}

export async function updateProduct(code, product) {
  const response = await fetchWithAuth(
    `${PRODUCTS_URL}/gestion/${encodeURIComponent(code)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    },
  )

  return readWriteResponse(response)
}

export async function discontinueProduct(code) {
  const response = await fetchWithAuth(
    `${PRODUCTS_URL}/gestion/${encodeURIComponent(code)}`,
    { method: 'DELETE' },
  )

  return readWriteResponse(response)
}