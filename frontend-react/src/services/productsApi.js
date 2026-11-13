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