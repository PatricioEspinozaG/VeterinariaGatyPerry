import { describe, expect, it, vi } from 'vitest'
import { readStorage, writeStorage } from './storage.js'

describe('storage', () => {
  it('guarda datos y permite leerlos de nuevo', () => {
    const carrito = [{ productId: 'producto-1', cantidad: 2 }]

    expect(writeStorage('carrito-prueba', carrito)).toBe(true)
    expect(readStorage('carrito-prueba', [])).toEqual(carrito)
  })

  it('devuelve el valor por defecto si no hay datos o el JSON está dañado', () => {
    expect(readStorage('clave-inexistente', [])).toEqual([])

    localStorage.setItem('datos-danados', '{incompleto')
    expect(readStorage('datos-danados', [])).toEqual([])
  })

  it('avisa si el navegador impide guardar', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Almacenamiento no disponible')
    })

    expect(writeStorage('carrito-prueba', [])).toBe(false)
  })
})