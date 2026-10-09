const SHIPPING_COST = 3990

function failure(error) {
  return { ok: false, error }
}

function textValue(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function preparePurchase(cart, products, delivery) {
  if (!Array.isArray(cart) || !Array.isArray(products)) {
    return failure('No se pudo leer el carrito o el catálogo.')
  }

  if (cart.length === 0) {
    return failure('El carrito está vacío.')
  }

  if (!delivery || typeof delivery !== 'object') {
    return failure('Completa los datos de entrega.')
  }

  const name = textValue(delivery.name)
  const email = textValue(delivery.email)

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return failure('Ingresa tu nombre y un correo válido.')
  }

  if (delivery.method !== 'envio' && delivery.method !== 'retiro') {
    return failure('Selecciona envío o retiro en clínica.')
  }

  const region = textValue(delivery.region)
  const commune = textValue(delivery.commune)
  const address = textValue(delivery.address)

  if (
    delivery.method === 'envio' &&
    (!region || !commune || !address)
  ) {
    return failure('Para el envío, completa región, comuna y dirección.')
  }

  const productsByCode = new Map(
    products.map((product) => [product.code, product]),
  )
  const quantitiesByCode = new Map()

  for (const item of cart) {
    if (
      !item ||
      typeof item.code !== 'string' ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      return failure('El carrito contiene una cantidad no válida.')
    }

    const product = productsByCode.get(item.code)

    if (!product) {
      return failure('Un producto del carrito ya no está disponible.')
    }

    if (
      !Number.isInteger(product.stock) ||
      product.stock < 0 ||
      !Number.isFinite(product.price) ||
      product.price < 0
    ) {
      return failure(`Los datos de ${product.name} no son válidos.`)
    }

    const totalQuantity =
      (quantitiesByCode.get(item.code) ?? 0) + item.quantity

    if (totalQuantity > product.stock) {
      return failure(`El stock de ${product.name} cambió. Revisa la cantidad.`)
    }

    quantitiesByCode.set(item.code, totalQuantity)
  }

  const items = Array.from(quantitiesByCode, ([code, quantity]) => {
    const product = productsByCode.get(code)

    return {
      code,
      name: product.name,
      quantity,
      unitPrice: product.price,
    }
  })

  const subtotal = items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  )
  const shipping =
    delivery.method === 'envio' && items.length > 0 ? SHIPPING_COST : 0
  const updatedProducts = products.map((product) => {
    const purchasedQuantity = quantitiesByCode.get(product.code) ?? 0

    return purchasedQuantity > 0
      ? { ...product, stock: product.stock - purchasedQuantity }
      : product
  })

  return {
    ok: true,
    products: updatedProducts,
    items,
    subtotal,
    shipping,
    total: subtotal + shipping,
  }
}