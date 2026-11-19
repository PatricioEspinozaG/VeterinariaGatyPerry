import { getAccessToken } from './auth.js'

const apiUrl = (import.meta.env.VITE_PRODUCTOS_API_URL || 'http://localhost:8084')
  .replace(/\/+$/, '')

async function adminRequest(path, { method = 'GET', body } = {}) {
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
    throw new Error('No fue posible conectar con el servidor de productos.')
  }

  if (response.status === 401) {
    throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  }
  if (response.status === 403) {
    throw new Error('No tienes permiso para gestionar productos.')
  }
  if (response.status === 204) return null

  const responseText = await response.text()
  let data = null
  if (responseText) {
    try {
      data = JSON.parse(responseText)
    } catch {
      if (response.ok) {
        throw new Error('El servidor de productos devolvió una respuesta inválida.')
      }
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || `Error del servidor de productos (${response.status}).`,
    )
  }

  return data
}

function isProduct(product) {
  return product
    && typeof product.code === 'string'
    && typeof product.name === 'string'
}

export async function listProducts() {
  let response
  try {
    response = await fetch(`${apiUrl}/api/v1/productos`)
  } catch {
    throw new Error('No fue posible conectar con el catálogo de productos.')
  }

  const responseText = await response.text()
  let data = null
  if (responseText) {
    try {
      data = JSON.parse(responseText)
    } catch {
      if (response.ok) {
        throw new Error('El servidor de productos devolvió una respuesta inválida.')
      }
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || `Error del servidor de productos (${response.status}).`,
    )
  }
  if (!Array.isArray(data)) {
    throw new Error('El servidor de productos devolvió un catálogo inválido.')
  }

  return data
}

export async function listManagedProducts() {
  const products = await adminRequest('/api/v1/productos/gestion')
  if (!Array.isArray(products) || !products.every(isProduct)) {
    throw new Error('El servidor de productos devolvió una lista de gestión inválida.')
  }
  return products
}

export async function createProduct(product) {
  const created = await adminRequest('/api/v1/productos/gestion', {
    method: 'POST',
    body: product,
  })
  if (!isProduct(created)) {
    throw new Error('El servidor de productos devolvió un producto inválido.')
  }
  return created
}

export async function updateProduct(code, product) {
  const updated = await adminRequest(
    `/api/v1/productos/gestion/${encodeURIComponent(code)}`,
    { method: 'PUT', body: product },
  )
  if (!isProduct(updated)) {
    throw new Error('El servidor de productos devolvió un producto inválido.')
  }
  return updated
}

export function discontinueProduct(code) {
  return adminRequest(
    `/api/v1/productos/gestion/${encodeURIComponent(code)}`,
    { method: 'DELETE' },
  )
}
