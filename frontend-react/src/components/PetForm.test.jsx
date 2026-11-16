import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { createPet } from '../services/mascotas.js'
import PetForm from './PetForm.jsx'

vi.mock('../services/mascotas.js', () => ({
  createPet: vi.fn(),
}))

describe('PetForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createPet.mockResolvedValue({ id: 1, nombre: 'Luna' })
  })

  it('no envía una mascota con datos obligatorios vacíos', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <PetForm />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: 'Guardar Mascota' }))

    expect(screen.getByText('Nombre obligatorio (máximo 30 caracteres).')).toBeInTheDocument()
    expect(screen.getByText('Ingresa una edad válida entre 0 y 30 años.')).toBeInTheDocument()
    expect(createPet).not.toHaveBeenCalled()
  })

  it('crea la mascota en el servicio y muestra confirmación', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <PetForm />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Nombre de la mascota'), 'Luna')
    await user.type(screen.getByLabelText('Raza'), 'Mestiza')
    await user.type(screen.getByLabelText('Edad (años)'), '3')
    await user.selectOptions(screen.getByLabelText('Sexo'), 'Hembra')
    await user.type(screen.getByLabelText('Observaciones o Alergias (Opcional)'), 'Control anual')
    await user.click(screen.getByRole('button', { name: 'Guardar Mascota' }))

    expect(await screen.findByText('¡Mascota registrada exitosamente!')).toBeInTheDocument()
    expect(createPet).toHaveBeenCalledWith({
      nombre: 'Luna',
      especie: 'Perro',
      raza: 'Mestiza',
      edad: 3,
      sexo: 'Hembra',
      notas: 'Control anual',
    })
  })

  it('muestra errores del backend sin confirmar el registro', async () => {
    const user = userEvent.setup()
    createPet.mockRejectedValue(new Error('No fue posible conectar con el servidor de mascotas.'))

    render(
      <MemoryRouter>
        <PetForm />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Nombre de la mascota'), 'Luna')
    await user.type(screen.getByLabelText('Raza'), 'Mestiza')
    await user.type(screen.getByLabelText('Edad (años)'), '3')
    await user.click(screen.getByRole('button', { name: 'Guardar Mascota' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No fue posible conectar con el servidor de mascotas.',
    )
    expect(screen.queryByText('¡Mascota registrada exitosamente!')).not.toBeInTheDocument()
  })
})
