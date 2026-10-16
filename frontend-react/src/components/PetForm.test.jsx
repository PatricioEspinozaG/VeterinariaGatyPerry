import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import PetForm from './PetForm.jsx'

describe('PetForm', () => {
  it('no guarda una mascota con datos obligatorios vacíos', async () => {
    const user = userEvent.setup()
    const onAddPet = vi.fn()

    render(
      <MemoryRouter>
        <PetForm currentUserId="cliente-1" onAddPet={onAddPet} />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: 'Guardar Mascota' }))

    expect(screen.getByText('Nombre obligatorio (máximo 30 caracteres).')).toBeInTheDocument()
    expect(screen.getByText('Ingresa una edad válida entre 0 y 30 años.')).toBeInTheDocument()
    expect(onAddPet).not.toHaveBeenCalled()
  })

  it('guarda la mascota asociada al usuario', async () => {
    const user = userEvent.setup()
    const onAddPet = vi.fn()

    render(
      <MemoryRouter>
        <PetForm currentUserId="cliente-1" onAddPet={onAddPet} />
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText('Nombre de la mascota'), 'Luna')
    await user.type(screen.getByLabelText('Raza'), 'Mestiza')
    await user.type(screen.getByLabelText('Edad (años)'), '3')
    await user.click(screen.getByRole('button', { name: 'Guardar Mascota' }))

    expect(onAddPet).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'cliente-1',
        nombre: 'Luna',
        especie: 'Perro',
        raza: 'Mestiza',
        edad: 3
      })
    )
    expect(screen.getByRole('alert')).toHaveTextContent('¡Mascota registrada exitosamente!')
  })
})