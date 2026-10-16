import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import Header from './Header.jsx'

it('muestra la cuenta, el carrito y permite cerrar sesión', async () => {
  const user = userEvent.setup()
  const onLogout = vi.fn()

  render(
    <MemoryRouter>
      <Header
        currentUser={{ nombre: 'Camila', email: 'camila@gmail.com' }}
        cartQuantity={2}
        onLogout={onLogout}
      />
    </MemoryRouter>
  )

  expect(screen.getByText('Camila')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Carrito, 2 productos' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
  expect(screen.getByRole('button', { name: 'Cerrar menú' }))
    .toHaveAttribute('aria-expanded', 'true')

  await user.click(screen.getByRole('button', { name: 'Salir' }))

  expect(onLogout).toHaveBeenCalledOnce()
  expect(screen.getByRole('button', { name: 'Abrir menú' }))
    .toHaveAttribute('aria-expanded', 'false')
})

it('ofrece ingresar cuando no hay una sesión activa', () => {
  render(
    <MemoryRouter>
      <Header currentUser={null} cartQuantity={0} onLogout={vi.fn()} />
    </MemoryRouter>
  )

  expect(screen.getByRole('link', { name: 'Ingresar' }))
    .toHaveAttribute('href', '/login')
  expect(screen.getByRole('link', { name: 'Carrito, 0 productos' }))
    .toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Salir' }))
    .not.toBeInTheDocument()
})