import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { RegisterForm } from './RegisterForm.jsx'
import { login, register } from '../services/authApi.js'

vi.mock('../services/authApi.js', () => ({
  register: vi.fn(),
  login: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

function renderRegister(onRegister = vi.fn()) {
  render(
    <MemoryRouter initialEntries={['/registro']}>
      <Routes>
        <Route
          path="/registro"
          element={<RegisterForm onRegister={onRegister} />}
        />
        <Route
          path="/mi-cuenta"
          element={<h1>Mi cuenta real</h1>}
        />
      </Routes>
    </MemoryRouter>,
  )

  return onRegister
}

async function fillValidForm(user) {
  await user.type(screen.getByLabelText('Nombre'), 'Camila')
  await user.type(screen.getByLabelText('Apellidos'), 'Soto')
  await user.type(screen.getByLabelText('RUN'), '18.765.432-7')
  await user.type(
    screen.getByLabelText('Correo electrónico'),
    'camila@example.test',
  )
  await user.type(
    screen.getByLabelText('Teléfono de contacto'),
    '+56912345678',
  )
  await user.type(screen.getByLabelText('Contraseña'), 'clave12345')
  await user.type(
    screen.getByLabelText('Confirmar contraseña'),
    'clave12345',
  )
}

it('valida campos obligatorios antes de llamar al backend', async () => {
  renderRegister()
  const user = userEvent.setup()

  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

  expect(screen.getByText('El RUN es obligatorio.')).toBeInTheDocument()
  expect(screen.getByText('El correo es obligatorio.')).toBeInTheDocument()
  expect(register).not.toHaveBeenCalled()
})

it('registra en la API, inicia sesión y entrega el usuario real', async () => {
  const usuario = {
    id: 12,
    nombre: 'Camila',
    email: 'camila@example.test',
    rol: 'CLIENTE',
    activo: true,
  }
  vi.mocked(register).mockResolvedValue(usuario)
  vi.mocked(login).mockResolvedValue({
    accessToken: 'jwt-de-prueba',
    expiresIn: 900,
    usuario,
  })

  const onRegister = renderRegister()
  const user = userEvent.setup()
  await fillValidForm(user)
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

  expect(register).toHaveBeenCalledWith(
    expect.objectContaining({
      nombre: 'Camila',
      run: '18.765.432-7',
      email: 'camila@example.test',
    }),
  )
  expect(login).toHaveBeenCalledWith(
    'camila@example.test',
    'clave12345',
  )
  expect(onRegister).toHaveBeenCalledWith(usuario)
  expect(
    await screen.findByRole('heading', { name: 'Mi cuenta real' }),
  ).toBeInTheDocument()
  expect(localStorage.getItem('users')).toBeNull()
})

it('informa un correo o RUN duplicado sin intentar login', async () => {
  vi.mocked(register).mockRejectedValue({ status: 409 })

  renderRegister()
  const user = userEvent.setup()
  await fillValidForm(user)
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Ese correo o RUN ya está registrado.',
  )
  expect(login).not.toHaveBeenCalled()
})

it('no vuelve a registrar si la cuenta se creó pero falló el login', async () => {
  vi.mocked(register).mockResolvedValue({ id: 12 })
  vi.mocked(login).mockRejectedValue({ status: 503 })

  renderRegister()
  const user = userEvent.setup()
  await fillValidForm(user)
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'La cuenta fue creada, pero no pudimos iniciar sesión.',
  )
  expect(screen.getByRole('link', { name: 'Ir a iniciar sesión' }))
    .toHaveAttribute('href', '/login')
  expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeDisabled()
  expect(register).toHaveBeenCalledOnce()
})