import { expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from './App.jsx'

it('permite agregar un producto y verlo en el carrito', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )

  const navegacion = screen.getByRole('navigation', {
    name: 'Navegación principal',
  })
  await user.click(
    within(navegacion).getByRole('link', { name: 'Productos' }),
  )

  expect(
    screen.getByRole('heading', { name: 'Catálogo de productos' }),
  ).toBeInTheDocument()

  await user.type(screen.getByLabelText('Buscar productos'), 'Nexgard')
  await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))

  await user.click(
    screen.getByRole('link', { name: 'Carrito, 1 productos' }),
  )

  expect(
    screen.getByRole('heading', { name: 'Carrito de productos' }),
  ).toBeInTheDocument()
  expect(screen.getByText('Unidades: 1')).toBeInTheDocument()
})

it('completa una compra y deja el carrito vacío', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/productos']}>
      <App />
    </MemoryRouter>,
  )

  await user.type(screen.getByLabelText('Buscar productos'), 'Nexgard')
  await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
  await user.click(screen.getByRole('link', { name: 'Carrito, 1 productos' }))
  await user.click(screen.getByRole('link', { name: 'Continuar a compra' }))

  await user.type(screen.getByLabelText('Nombre completo'), 'Patricio Espinoza')
  await user.type(screen.getByLabelText('Correo electrónico'), 'patricio@gmail.com')
  await user.selectOptions(screen.getByLabelText('Método de entrega'), 'retiro')
  await user.click(screen.getByRole('button', { name: 'Confirmar compra simulada' }))

  expect(
    await screen.findByRole('heading', { name: '¡Pedido registrado!' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'Carrito, 0 productos' }),
  ).toBeInTheDocument()
})