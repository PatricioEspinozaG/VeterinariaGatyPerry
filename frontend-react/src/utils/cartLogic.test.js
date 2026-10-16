import { expect, it } from 'vitest'
import { addToCart, changeQuantity } from './cartLogic.js'

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
