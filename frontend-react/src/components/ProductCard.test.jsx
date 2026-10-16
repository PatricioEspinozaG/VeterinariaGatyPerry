import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import ProductCard from './ProductCard.jsx'

const producto = {
  code: 'PROD-1',
  name: 'Alimento de prueba',
  category: 'Alimentos',
  activeIngredient: 'No aplica',
  presentation: '1 kg',
  species: 'Perros',
  price: 12000,
  stock: 4
}

describe('ProductCard', () => {
  it('permite agregar un producto con stock', async () => {
    const user = userEvent.setup()
    const onAddToCart = vi.fn()

    render(
      <MemoryRouter>
        <ProductCard product={producto} onAddToCart={onAddToCart} />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))

    expect(onAddToCart).toHaveBeenCalledWith(producto)
    expect(screen.getByRole('status')).toHaveTextContent('Disponible: 4 unidades')
  })

  it('bloquea la compra si el producto está agotado', () => {
    const onAddToCart = vi.fn()

    render(
      <MemoryRouter>
        <ProductCard
          product={{ ...producto, stock: 0 }}
          onAddToCart={onAddToCart}
        />
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: 'Agotado' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Agotado')
    expect(onAddToCart).not.toHaveBeenCalled()
  })
})