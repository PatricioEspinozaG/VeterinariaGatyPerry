import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import LoginForm from './LoginForm.jsx'

it('muestra el error de autenticación devuelto por el servidor', async () => {
  const user = userEvent.setup()
  const onLogin = vi.fn().mockRejectedValue(
    new Error('Credenciales incorrectas o sesión vencida.'),
  )

  render(
    <MemoryRouter>
      <LoginForm onLogin={onLogin} />
    </MemoryRouter>,
  )

  await user.type(screen.getByLabelText('Correo'), 'cliente@gmail.com')
  await user.type(screen.getByLabelText('Contraseña'), 'clave1234')
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))

  expect(screen.getByRole('alert')).toHaveTextContent('Credenciales incorrectas')
  expect(onLogin).toHaveBeenCalledWith({
    email: 'cliente@gmail.com',
    password: 'clave1234',
  })
})

it('envía credenciales al iniciar sesión correctamente', async () => {
  const user = userEvent.setup()
  const onLogin = vi.fn().mockResolvedValue({
    id: 'usuario-1',
    role: 'cliente',
  })

  render(
    <MemoryRouter>
      <LoginForm onLogin={onLogin} />
    </MemoryRouter>,
  )

  await user.type(screen.getByLabelText('Correo'), 'cliente@gmail.com')
  await user.type(screen.getByLabelText('Contraseña'), 'clave1234')

  await user.click(screen.getByRole('button', { name: 'Ingresar' }))

  expect(onLogin).toHaveBeenCalledWith({
    email: 'cliente@gmail.com',
    password: 'clave1234',
  })
  expect(screen.getByRole('alert')).toHaveTextContent(
    '¡Inicio de sesión exitoso!',
  )
})

it('muestra errores de formato y credenciales incorrectas', async () => {
  const user = userEvent.setup()
  const onLogin = vi.fn().mockRejectedValue(
    new Error('Credenciales incorrectas o sesión vencida.'),
  )
  render(<MemoryRouter><LoginForm onLogin={onLogin} /></MemoryRouter>)

  await user.type(screen.getByLabelText('Correo'), 'persona@example.com')
  await user.type(screen.getByLabelText('Contraseña'), 'corta')
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))

  expect(screen.getByText(/Ingresa un correo permitido/)).toBeInTheDocument()
  expect(screen.getByText(/al menos 8 caracteres/)).toBeInTheDocument()

  await user.clear(screen.getByLabelText('Correo'))
  await user.type(screen.getByLabelText('Correo'), 'persona@gmail.com')
  await user.clear(screen.getByLabelText('Contraseña'))
  await user.type(screen.getByLabelText('Contraseña'), 'clavevalida')
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))

  expect(onLogin).toHaveBeenCalledWith({
    email: 'persona@gmail.com',
    password: 'clavevalida',
  })
  expect(screen.getByRole('alert')).toHaveTextContent('Credenciales incorrectas')
})