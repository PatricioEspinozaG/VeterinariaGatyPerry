import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import LoginForm from './LoginForm.jsx'
import { login } from '../services/authApi.js'

vi.mock('../services/authApi.js', () => ({
  login: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

function renderLogin(onLogin = vi.fn()) {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route
          path="/login"
          element={<LoginForm onLogin={onLogin} />}
        />
        <Route
          path="/recepcion"
          element={<h1>Panel de recepción</h1>}
        />
      </Routes>
    </MemoryRouter>,
  )

  return onLogin
}

it('inicia sesión con la API y entrega el usuario recibido', async () => {
  const usuario = {
    id: 5,
    nombre: 'Recepción',
    email: 'recepcion.prueba@example.test',
    rol: 'RECEPCION',
    activo: true,
  }
  vi.mocked(login).mockResolvedValue({
    accessToken: 'jwt-de-prueba',
    expiresIn: 900,
    usuario,
  })

  const onLogin = renderLogin()
  const user = userEvent.setup()

  await user.type(
    screen.getByLabelText('Correo'),
    'recepcion.prueba@example.test',
  )
  await user.type(screen.getByLabelText('Contraseña'), 'clave-de-prueba')
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))

  expect(login).toHaveBeenCalledWith(
    'recepcion.prueba@example.test',
    'clave-de-prueba',
  )
  expect(onLogin).toHaveBeenCalledWith(usuario)
  expect(
    await screen.findByRole('heading', { name: 'Panel de recepción' }),
  ).toBeInTheDocument()
  expect(localStorage.getItem('currentUserId')).toBeNull()
})

it('muestra un error y no abre sesión cuando la API responde 401', async () => {
  vi.mocked(login).mockRejectedValue({ status: 401 })
  const onLogin = renderLogin()
  const user = userEvent.setup()

  await user.type(screen.getByLabelText('Correo'), 'otro@example.test')
  await user.type(screen.getByLabelText('Contraseña'), 'clave-incorrecta')
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Correo o contraseña incorrectos.',
  )
  expect(onLogin).not.toHaveBeenCalled()
})

it('no llama a la API si faltan correo o contraseña', async () => {
  renderLogin()
  const user = userEvent.setup()

  await user.click(screen.getByRole('button', { name: 'Ingresar' }))

  expect(screen.getByRole('alert')).toHaveTextContent(
    'Ingresa tu correo y contraseña.',
  )
  expect(login).not.toHaveBeenCalled()
})