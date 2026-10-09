export function normalizeCart(cart, products) {
  if (!Array.isArray(cart) || !Array.isArray(products)) {
    return []
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
      continue
    }

    const product = productsByCode.get(item.code)

    if (!product || !Number.isInteger(product.stock) || product.stock <= 0) {
      continue
    }

    const combinedQuantity =
      (quantitiesByCode.get(item.code) ?? 0) + item.quantity

    quantitiesByCode.set(
      item.code,
      Math.min(combinedQuantity, product.stock),
    )
  }

  return Array.from(quantitiesByCode, ([code, quantity]) => ({
    code,
    quantity,
  }))
}

export function addToCart(cart, product) {
  if (!product || typeof product.code !== 'string' || !product.code) {
    return { ok: false, error: 'Producto no válido.' }
  }

  if (!Number.isInteger(product.stock) || product.stock <= 0) {
    return { ok: false, error: 'Producto agotado.' }
  }

  const quantitiesByCode = new Map()

  if (Array.isArray(cart)) {
    for (const item of cart) {
      if (
        !item ||
        typeof item.code !== 'string' ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        continue
      }

      quantitiesByCode.set(
        item.code,
        (quantitiesByCode.get(item.code) ?? 0) + item.quantity,
      )
    }
  }

  const currentQuantity = quantitiesByCode.get(product.code) ?? 0

  if (currentQuantity >= product.stock) {
    return {
      ok: false,
      error: 'No puedes superar el stock disponible.',
    }
  }

  quantitiesByCode.set(product.code, currentQuantity + 1)

  return {
    ok: true,
    cart: Array.from(quantitiesByCode, ([code, quantity]) => ({
      code,
      quantity,
    })),
  }
}

export function changeQuantity(cart, product, quantity) {
  if (!product || typeof product.code !== 'string' || !product.code) {
    return { ok: false, error: 'Producto no válido.' }
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    return {
      ok: false,
      error: 'La cantidad debe ser un número entero igual o mayor que cero.',
    }
  }

  if (
    !Number.isInteger(product.stock) ||
    product.stock < 0 ||
    quantity > product.stock
  ) {
    return {
      ok: false,
      error: 'La cantidad supera el stock disponible.',
    }
  }

  const quantitiesByCode = new Map()

  if (Array.isArray(cart)) {
    for (const item of cart) {
      if (
        !item ||
        typeof item.code !== 'string' ||
        item.code === product.code ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        continue
      }

      quantitiesByCode.set(
        item.code,
        (quantitiesByCode.get(item.code) ?? 0) + item.quantity,
      )
    }
  }

  if (quantity > 0) {
    quantitiesByCode.set(product.code, quantity)
  }

  return {
    ok: true,
    cart: Array.from(quantitiesByCode, ([code, itemQuantity]) => ({
      code,
      quantity: itemQuantity,
    })),
  }
}

export function getCartLines(cart, products) {
  const productsByCode = new Map(
    products.map((product) => [product.code, product]),
  )

  return normalizeCart(cart, products).map((item) => {
    const product = productsByCode.get(item.code)

    return {
      ...product,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity,
    }
  })
}

export function getCartTotal(cart, products) {
  return getCartLines(cart, products).reduce(
    (total, item) => total + item.lineTotal,
    0,
  )
}

export function removeFromCart(cart, code) {
  if (!Array.isArray(cart) || typeof code !== 'string') {
    return []
  }

  return cart.filter((item) => item?.code !== code)
}