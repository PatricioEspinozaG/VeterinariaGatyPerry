import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import DetalleProducto from './DetalleProducto.jsx'
import userEvent from '@testing-library/user-event'

it('avisa cuando el producto no existe', () => {
  render(
    <MemoryRouter initialEntries={['/productos/inexistente']}>
      <Routes>
        <Route
          path="/productos/:code"
          element={<DetalleProducto products={[]} onAddToCart={vi.fn()} />}
        />
      </Routes>
    </MemoryRouter>
  )

  expect(screen.getByRole('alert')).toHaveTextContent(
    'No encontramos ese producto'
  )
  expect(screen.getByRole('link', { name: 'Volver al catálogo' }))
    .toHaveAttribute('href', '/productos')
})

it('agrega al carrito un producto disponible', async () => {
  const user = userEvent.setup()
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
  const onAddToCart = vi.fn(() => ({ ok: true }))

  render(
    <MemoryRouter initialEntries={['/productos/PROD-1']}>
      <Routes>
        <Route
          path="/productos/:code"
          element={
            <DetalleProducto
              products={[producto]}
              onAddToCart={onAddToCart}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  )

  await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))

  expect(onAddToCart).toHaveBeenCalledWith(producto)
  expect(screen.getByRole('status')).toHaveTextContent(
    'Alimento de prueba agregado al carrito.'
  )
})

it('deshabilita la compra cuando el producto está agotado', () => {
  const onAddToCart = vi.fn()
  const producto = {
    code: 'PROD-1',
    name: 'Alimento de prueba',
    category: 'Alimentos',
    activeIngredient: 'No aplica',
    presentation: '1 kg',
    species: 'Perros',
    price: 12000,
    stock: 0
  }

  render(
    <MemoryRouter initialEntries={['/productos/PROD-1']}>
      <Routes>
        <Route
          path="/productos/:code"
          element={
            <DetalleProducto
              products={[producto]}
              onAddToCart={onAddToCart}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  )

  expect(screen.getByRole('button', { name: 'Agotado' })).toBeDisabled()
  expect(onAddToCart).not.toHaveBeenCalled()
})