import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import Carrito from './Carrito.jsx'

it('solicita aumentar la cantidad al pulsar el botón +', async () => {
  const user = userEvent.setup()
  const onChangeQuantity = vi.fn()
  const productos = [
    {
      code: 'ME001',
      name: 'Amoxibay',
      category: 'Antibióticos',
      stock: 2,
      price: 4200,
    },
  ]
  const carrito = [{ code: 'ME001', quantity: 1 }]

  render(
    <MemoryRouter>
      <Carrito
        products={productos}
        cart={carrito}
        onChangeQuantity={onChangeQuantity}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    </MemoryRouter>,
  )

  expect(screen.getByText('Unidades: 1')).toBeInTheDocument()

  await user.click(
    screen.getByRole('button', { name: 'Agregar una unidad de Amoxibay' }),
  )

  expect(onChangeQuantity).toHaveBeenCalledWith(
    expect.objectContaining({ code: 'ME001' }),
    2,
  )
})

it('muestra el estado vacío y no ofrece continuar a compra', () => {
  render(
    <MemoryRouter>
      <Carrito
        products={[]}
        cart={[]}
        onChangeQuantity={vi.fn()}
        onRemove={vi.fn()}
        onClear={vi.fn()}
      />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { name: 'Tu carrito está vacío' }),
  ).toBeInTheDocument()

  expect(
    screen.queryByRole('link', { name: 'Continuar a compra' }),
  ).not.toBeInTheDocument()
})