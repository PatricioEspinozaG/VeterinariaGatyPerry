import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import LoginForm from './LoginForm.jsx'

it('impide iniciar sesión con una cuenta desactivada', async () => {
  const user = userEvent.setup()
  const onLogin = vi.fn()

  render(
    <MemoryRouter>
      <LoginForm
        users={[{
          id: 'usuario-1',
          email: 'cliente@gmail.com',
          password: 'clave1234',
          active: false,
        }]}
        onLogin={onLogin}
      />
    </MemoryRouter>,
  )

  await user.type(screen.getByLabelText('Correo'), 'cliente@gmail.com')
  await user.type(screen.getByLabelText('Contraseña'), 'clave1234')
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))

  expect(screen.getByRole('alert')).toHaveTextContent(
    'Tu cuenta se encuentra deshabilitada.',
  )
  expect(onLogin).not.toHaveBeenCalled()
})

it('entrega el ID de la cuenta al iniciar sesión correctamente', async () => {
  const user = userEvent.setup()
  const onLogin = vi.fn()

  render(
    <MemoryRouter>
      <LoginForm
        users={[{
          id: 'usuario-1',
          email: 'cliente@gmail.com',
          password: 'clave1234',
          active: true,
        }]}
        onLogin={onLogin}
      />
    </MemoryRouter>,
  )

  await user.type(screen.getByLabelText('Correo'), 'cliente@gmail.com')
  await user.type(screen.getByLabelText('Contraseña'), 'clave1234')

  await user.click(screen.getByRole('button', { name: 'Ingresar' }))

  expect(onLogin).toHaveBeenCalledWith('usuario-1')
  expect(screen.getByRole('alert')).toHaveTextContent(
    '¡Inicio de sesión exitoso!',
  )
})