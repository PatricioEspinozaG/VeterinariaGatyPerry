import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { RegisterForm } from './RegisterForm.jsx'

describe('RegisterForm', () => {
  it('impide crear una cuenta con los campos obligatorios vacíos', async () => {
    const user = userEvent.setup()
    const onRegister = vi.fn()

    render(
      <MemoryRouter>
        <RegisterForm users={[]} onRegister={onRegister} />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(screen.getByText('El RUN es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('El correo es obligatorio.')).toBeInTheDocument()
    expect(onRegister).not.toHaveBeenCalled()
  })

  it('registra una cuenta cuando los datos son válidos', async () => {
  const user = userEvent.setup()
  const onRegister = vi.fn()

  const { container } = render(
    <MemoryRouter>
      <RegisterForm users={[]} onRegister={onRegister} />
    </MemoryRouter>
  )

  const escribir = async (nombre, valor) => {
    await user.type(container.querySelector(`[name="${nombre}"]`), valor)
  }

  await escribir('nombre', 'Camila')
  await escribir('apellidos', 'Soto')
  await escribir('run', '12.345.678-5')
  await escribir('email', 'camila@gmail.com')
  await escribir('telefono', '+56 9 1234 5678')
  await escribir('password', 'clave1234')
  await escribir('confirmPassword', 'clave1234')

  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

  expect(onRegister).toHaveBeenCalledOnce()
  expect(onRegister).toHaveBeenCalledWith(
    expect.objectContaining({
      nombre: 'Camila',
      run: '12.345.678-5',
      email: 'camila@gmail.com'
    })
  )
})

})