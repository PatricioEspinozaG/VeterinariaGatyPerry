import { getAccessToken } from './authApi.js'

const apiUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080')
  .replace(/\/+$/, '')

async function request(path, { method = 'GET', body, idempotencyKey } = {}) {
  const accessToken = getAccessToken()
  let response

  try {
    response = await fetch(`${apiUrl}${path}`, {
      method,
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  } catch {
    throw new Error('No fue posible conectar con el servidor de pedidos.')
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
        throw new Error('El servidor de pedidos devolvió una respuesta inválida.')
      }
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || `Error del servidor de pedidos (${response.status}).`,
    )
  }

  return data
}

export async function createOrder(order, idempotencyKey) {
  const response = await request('/api/v1/pedidos', {
    method: 'POST',
    body: order,
    idempotencyKey,
  })

  if (!response || typeof response.id !== 'string' || !Array.isArray(response.items)) {
    throw new Error('El servidor de pedidos devolvió un pedido inválido.')
  }

  return response
}

export async function listOrders() {
  const response = await request('/api/v1/pedidos/mis-pedidos')
  if (!Array.isArray(response)) {
    throw new Error('El servidor de pedidos devolvió una lista inválida.')
  }
  return response
}

function isManagedOrder(order) {
  return order
    && typeof order.id === 'string'
    && typeof order.customerName === 'string'
    && typeof order.customerEmail === 'string'
    && Array.isArray(order.items)
    && ['envio', 'retiro'].includes(order.deliveryMethod)
    && typeof order.status === 'string'
    && Number.isInteger(order.version)
    && order.version >= 0
}

export async function listManagedOrders() {
  const response = await request('/api/v1/pedidos/gestion')
  if (!Array.isArray(response) || !response.every(isManagedOrder)) {
    throw new Error('El servidor de pedidos devolvió una lista de gestión inválida.')
  }
  return response
}

export async function updateManagedOrderStatus(id, estado, version) {
  const response = await request(
    `/api/v1/pedidos/gestion/${encodeURIComponent(id)}/estado`,
    {
      method: 'PATCH',
      body: { estado, version },
    },
  )
  if (!isManagedOrder(response)) {
    throw new Error('El servidor de pedidos devolvió un pedido inválido.')
  }
  return response
}
