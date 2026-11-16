import { beforeEach, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { createAppointment } from '../services/citas.js'
import { listPets } from '../services/mascotas.js'
import AppointmentForm from './AppointmentForm.jsx'

vi.mock('../services/mascotas.js', () => ({
  listPets: vi.fn(),
}))
vi.mock('../services/citas.js', () => ({
  createAppointment: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  listPets.mockResolvedValue([{
    id: 1,
    nombre: 'Michi',
    especie: 'Gato',
  }])
  createAppointment.mockResolvedValue({ id: 1 })
})

it('rechaza una cita con fecha pasada sin guardarla', async () => {
  render(
    <MemoryRouter>
      <AppointmentForm />
    </MemoryRouter>,
  )

  await screen.findByLabelText('Fecha')
  fireEvent.change(screen.getByLabelText('Fecha'), {
    target: { value: '2000-01-01' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar Cita' }))

  expect(
    screen.getByText('La fecha no puede ser anterior a hoy.'),
  ).toBeInTheDocument()
  expect(createAppointment).not.toHaveBeenCalled()
})

it('entrega una cita pendiente con los datos de la mascota', async () => {
  const manana = new Date(Date.now() + 86_400_000)
    .toISOString()
    .slice(0, 10)

  render(
    <MemoryRouter>
      <AppointmentForm />
    </MemoryRouter>,
  )

  await screen.findByLabelText('Fecha')
  fireEvent.change(screen.getByLabelText('Fecha'), {
    target: { value: manana },
  })
  fireEvent.change(screen.getByLabelText('Hora'), {
    target: { value: '10:00' },
  })
  fireEvent.change(screen.getByLabelText('Motivo de la consulta'), {
    target: { value: 'Control preventivo' },
  })

  fireEvent.click(screen.getByRole('button', { name: 'Confirmar Cita' }))

  expect(await screen.findByText('¡Cita agendada exitosamente!')).toBeInTheDocument()
  expect(createAppointment).toHaveBeenCalledWith({
    mascotaId: 1,
    servicio: 'Consulta General',
    fecha: manana,
    hora: '10:00',
    motivo: 'Control preventivo',
  })
})

it('muestra errores al guardar una cita en el backend', async () => {
  const manana = new Date(Date.now() + 86_400_000)
    .toISOString()
    .slice(0, 10)
  createAppointment.mockRejectedValue(new Error('El horario ya está ocupado.'))

  render(
    <MemoryRouter>
      <AppointmentForm />
    </MemoryRouter>,
  )

  await screen.findByLabelText('Fecha')
  fireEvent.change(screen.getByLabelText('Fecha'), {
    target: { value: manana },
  })
  fireEvent.change(screen.getByLabelText('Hora'), {
    target: { value: '10:00' },
  })
  fireEvent.change(screen.getByLabelText('Motivo de la consulta'), {
    target: { value: 'Control preventivo' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar Cita' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('El horario ya está ocupado.')
})

