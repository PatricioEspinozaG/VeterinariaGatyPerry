const apiUrl = (import.meta.env.VITE_PRODUCTOS_API_URL || 'http://localhost:8084')
  .replace(/\/+$/, '')

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
