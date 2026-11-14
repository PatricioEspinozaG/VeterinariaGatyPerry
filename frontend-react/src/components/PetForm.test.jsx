import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { createMyPet } from '../services/petsApi.js'
import PetForm from './PetForm.jsx'

vi.mock('../services/petsApi.js', () => ({
  createMyPet: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(createMyPet).mockReset()
})

describe('PetForm', () => {
  it('no envía una mascota con datos obligatorios vacíos', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <PetForm />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar Mascota' }))

    expect(screen.getByText('Nombre obligatorio (máximo 30 caracteres).')).toBeInTheDocument()
    expect(screen.getByText('Ingresa una edad válida entre 0 y 30 años.')).toBeInTheDocument()
    expect(createMyPet).not.toHaveBeenCalled()
  })

  it('envía la mascota a la API y muestra éxito al recibir respuesta', async () => {
    vi.mocked(createMyPet).mockResolvedValue({ id: 21, nombre: 'Luna' })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <PetForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Nombre de la mascota'), 'Luna')
    await user.type(screen.getByLabelText('Raza'), 'Mestiza')
    await user.type(screen.getByLabelText('Edad (años)'), '3')
    await user.click(screen.getByRole('button', { name: 'Guardar Mascota' }))

    expect(createMyPet).toHaveBeenCalledWith({
      nombre: 'Luna',
      especie: 'Perro',
      raza: 'Mestiza',
      edad: 3,
      sexo: 'Macho',
      notas: '',
    })
    expect(await screen.findByRole('alert')).toHaveTextContent('¡Mascota registrada exitosamente!')
  })

  it('mantiene el formulario cuando falla la API', async () => {
    vi.mocked(createMyPet).mockRejectedValue(new Error('No se pudo conectar.'))
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <PetForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Nombre de la mascota'), 'Luna')
    await user.type(screen.getByLabelText('Raza'), 'Mestiza')
    await user.type(screen.getByLabelText('Edad (años)'), '3')
    await user.click(screen.getByRole('button', { name: 'Guardar Mascota' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar.')
    expect(screen.getByLabelText('Nombre de la mascota')).toHaveValue('Luna')
    expect(screen.getByRole('button', { name: 'Guardar Mascota' })).toBeEnabled()
  })
})