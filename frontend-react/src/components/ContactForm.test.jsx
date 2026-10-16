import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from './ContactForm.jsx'

it('muestra un error si nombre, asunto y mensaje contienen solo espacios', async () => {
  const user = userEvent.setup()
  render(<ContactForm />)

  await user.type(screen.getByLabelText('Nombre'), '   ')
  await user.type(screen.getByLabelText('Correo electrónico'), 'cliente@gmail.com')
  await user.type(screen.getByLabelText('Asunto'), '     ')
  await user.type(screen.getByLabelText('Mensaje'), '          ')
  await user.click(screen.getByRole('button', { name: 'Validar mensaje' }))

  expect(screen.getByRole('alert')).toHaveTextContent(
    'Revisa nombre, asunto y mensaje',
  )
})

it('muestra un error si el dominio del correo no está permitido', async () => {
  const user = userEvent.setup()
  render(<ContactForm />)

  await user.type(screen.getByLabelText('Nombre'), 'Patricio')
  await user.type(screen.getByLabelText('Correo electrónico'), 'cliente@outlook.com')
  await user.type(screen.getByLabelText('Asunto'), 'Consulta general')
  await user.type(screen.getByLabelText('Mensaje'), 'Quiero conocer los horarios.')
  await user.click(screen.getByRole('button', { name: 'Validar mensaje' }))

  expect(screen.getByRole('alert')).toHaveTextContent(
    'Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.',
  )
})

it('confirma datos válidos y limpia el formulario', async () => {
  const user = userEvent.setup()
  render(<ContactForm />)

  await user.type(screen.getByLabelText('Nombre'), 'Patricio')
  await user.type(screen.getByLabelText('Correo electrónico'), 'cliente@gmail.com')
  await user.type(screen.getByLabelText('Asunto'), 'Consulta general')
  await user.type(screen.getByLabelText('Mensaje'), 'Quiero conocer los horarios.')
  await user.click(screen.getByRole('button', { name: 'Validar mensaje' }))

  expect(screen.getByRole('status')).toHaveTextContent('Los datos son válidos')
  expect(screen.getByLabelText('Nombre')).toHaveValue('')
  expect(screen.getByLabelText('Correo electrónico')).toHaveValue('')
})