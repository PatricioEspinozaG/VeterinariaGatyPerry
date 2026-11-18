import { apiUrl, fetchWithAuth } from './authApi.js'

const ORDERS_URL = '/api/v1/pedidos'

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

export async function createOrder(
  order,
  idempotencyKey = crypto.randomUUID(),
  guest = false,
) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(order),
  }

  const response = guest
    ? await fetch(apiUrl(ORDERS_URL), options)
    : await fetchWithAuth(ORDERS_URL, options)

  return readResponse(response, 'No pudimos completar el pedido')
}

export async function getMyOrders() {
  const response = await fetchWithAuth(`${ORDERS_URL}/mis-pedidos`)
  const orders = await readResponse(response, 'No pudimos cargar tus pedidos')

  if (!Array.isArray(orders)) {
    throw new Error('El servidor devolvió una lista de pedidos inválida.')
  }

  return orders
}

export async function getOrder(id) {
  const response = await fetchWithAuth(
    `${ORDERS_URL}/${encodeURIComponent(id)}`,
  )

  return readResponse(response, 'No pudimos cargar el pedido')
}