import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import AppointmentsList from './AppointmentsList.jsx'

it('permite al dueño cancelar su cita y guarda el nuevo estado', async () => {
  localStorage.setItem('appointments', JSON.stringify([
    {
      id: 'cita-1',
      userId: 'usuario-1',
      petName: 'Michi',
      servicio: 'Consulta General',
      fecha: '2026-10-20',
      hora: '10:00',
      estado: 'Pendiente',
    },
    {
      id: 'cita-2',
      userId: 'usuario-2',
      petName: 'Luna',
      servicio: 'Vacunación',
      fecha: '2026-10-21',
      hora: '11:00',
      estado: 'Pendiente',
    },
  ]))

  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AppointmentsList userRole="cliente" currentUserId="usuario-1" />
    </MemoryRouter>,
  )

  expect(screen.getByText('Michi')).toBeInTheDocument()
  expect(screen.queryByText('Luna')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Cancelar' }))

  const citasGuardadas = JSON.parse(localStorage.getItem('appointments'))
  expect(citasGuardadas[0].estado).toBe('Cancelada')
  expect(citasGuardadas[1].estado).toBe('Pendiente')
})