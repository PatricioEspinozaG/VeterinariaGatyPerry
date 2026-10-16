import { expect, it } from 'vitest'
import { preparePurchase } from './purchaseLogic.js'

it('descuenta el stock y calcula el total al comprar', () => {
  // Preparar
  const productos = [
    { code: 'ME001', name: 'Amoxibay', stock: 3, price: 4200 },
  ]
  const carrito = [{ code: 'ME001', quantity: 2 }]
  const entrega = {
    name: 'Patricio',
    email: 'patricio@gmail.com',
    method: 'retiro',
  }

  // Actuar
  const resultado = preparePurchase(carrito, productos, entrega)

  // Comprobar
  expect(resultado.ok).toBe(true)
  expect(resultado.products[0].stock).toBe(1)
  expect(resultado.subtotal).toBe(8400)
  expect(resultado.shipping).toBe(0)
  expect(resultado.total).toBe(8400)
})

it('rechaza una compra que supera el stock', () => {
  const productos = [
    { code: 'ME001', name: 'Amoxibay', stock: 3, price: 4200 },
  ]
  const carrito = [{ code: 'ME001', quantity: 4 }]
  const entrega = {
    name: 'Patricio',
    email: 'patricio@gmail.com',
    method: 'retiro',
  }

  const resultado = preparePurchase(carrito, productos, entrega)

  expect(resultado.ok).toBe(false)
  expect(productos[0].stock).toBe(3)
})