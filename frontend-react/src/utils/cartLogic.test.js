import { expect, it } from 'vitest'
import { addToCart, changeQuantity, normalizeCart, removeFromCart, } from './cartLogic.js'

it('agrega una unidad al carrito vacío', () => {
  // Preparar
  const producto = { code: 'ME001', stock: 3 }
  const carrito = []

  // Actuar
  const resultado = addToCart(carrito, producto)

  // Comprobar
  expect(resultado.ok).toBe(true)
  expect(resultado.cart).toEqual([{ code: 'ME001', quantity: 1 }])
})

it('no permite superar el stock disponible', () => {
  const producto = { code: 'ME001', stock: 1 }
  const carrito = [{ code: 'ME001', quantity: 1 }]

  const resultado = addToCart(carrito, producto)

  expect(resultado.ok).toBe(false)
  expect(resultado.error).toBe('No puedes superar el stock disponible.')
})

it('actualiza la cantidad sin modificar el carrito original', () => {
  const producto = { code: 'ME001', stock: 3 }
  const carrito = [{ code: 'ME001', quantity: 1 }]

  const resultado = changeQuantity(carrito, producto, 2)

  expect(resultado.ok).toBe(true)
  expect(resultado.cart).toEqual([{ code: 'ME001', quantity: 2 }])
  expect(carrito).toEqual([{ code: 'ME001', quantity: 1 }])
})

it('limpia el carrito guardado y ajusta cantidades al stock actual', () => {
  const productos = [
    { code: 'ME001', stock: 3 },
    { code: 'ME002', stock: 0 },
  ]
  const carritoGuardado = [
    { code: 'ME001', quantity: 2 },
    { code: 'ME001', quantity: 4 },
    { code: 'ME002', quantity: 1 },
    { code: 'ELIMINADO', quantity: 1 },
    { code: 'ME001', quantity: -2 },
    null,
  ]

  const carritoValido = normalizeCart(carritoGuardado, productos)

  expect(carritoValido).toEqual([{ code: 'ME001', quantity: 3 }])
  expect(carritoGuardado).toHaveLength(6)
})

it('quita un producto cuando su cantidad cambia a cero', () => {
  const producto = { code: 'ME001', stock: 3 }
  const carrito = [
    { code: 'ME001', quantity: 2 },
    { code: 'ME002', quantity: 1 },
  ]

  const resultado = changeQuantity(carrito, producto, 0)

  expect(resultado.ok).toBe(true)
  expect(resultado.cart).toEqual([{ code: 'ME002', quantity: 1 }])
  expect(carrito).toHaveLength(2)
})

it('rechaza cantidades decimales o mayores que el stock', () => {
  const producto = { code: 'ME001', stock: 3 }
  const carrito = [{ code: 'ME001', quantity: 1 }]

  const decimal = changeQuantity(carrito, producto, 1.5)
  const exceso = changeQuantity(carrito, producto, 4)

  expect(decimal).toEqual({
    ok: false,
    error: 'La cantidad debe ser un número entero igual o mayor que cero.',
  })
  expect(exceso).toEqual({
    ok: false,
    error: 'La cantidad supera el stock disponible.',
  })
  expect(carrito).toEqual([{ code: 'ME001', quantity: 1 }])
})

it('elimina solo el producto indicado sin modificar el carrito original', () => {
  const carrito = [
    { code: 'ME001', quantity: 2 },
    { code: 'ME002', quantity: 1 },
  ]

  const actualizado = removeFromCart(carrito, 'ME001')

  expect(actualizado).toEqual([{ code: 'ME002', quantity: 1 }])
  expect(carrito).toHaveLength(2)
})

it('rechaza productos inválidos o agotados', () => {
  expect(addToCart([], { stock: 3 })).toEqual({
    ok: false,
    error: 'Producto no válido.',
  })

  expect(addToCart([], { code: 'ME001', stock: 0 })).toEqual({
    ok: false,
    error: 'Producto agotado.',
  })
})

it('trata como vacío un carrito guardado con formato incorrecto', () => {
  const productos = [{ code: 'ME001', stock: 3 }]

  expect(normalizeCart(null, productos)).toEqual([])
  expect(normalizeCart('dato corrupto', productos)).toEqual([])
  expect(removeFromCart(null, 'ME001')).toEqual([])
})

it('mantiene el orden de los productos al cambiar una cantidad', () => {
  const carrito = [
    { code: 'ME001', quantity: 1 },
    { code: 'ME002', quantity: 1 },
  ]

  const resultado = changeQuantity(
    carrito,
    { code: 'ME001', stock: 5 },
    2,
  )

  expect(resultado.ok).toBe(true)
  expect(resultado.cart).toEqual([
    { code: 'ME001', quantity: 2 },
    { code: 'ME002', quantity: 1 },
  ])
  expect(carrito[0].quantity).toBe(1)
})