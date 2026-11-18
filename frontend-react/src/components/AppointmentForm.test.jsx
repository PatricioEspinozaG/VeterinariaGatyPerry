import { beforeEach, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { getMyPets } from '../services/petsApi.js'
import { createMyAppointment, getAvailableHours } from '../services/appointmentsApi.js'
import AppointmentForm from './AppointmentForm.jsx'

vi.mock('../services/petsApi.js', () => ({ getMyPets: vi.fn() }))
vi.mock('../services/appointmentsApi.js', () => ({
  createMyAppointment: vi.fn(),
  getAvailableHours: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(getMyPets).mockReset()
  vi.mocked(getAvailableHours).mockReset()
  vi.mocked(createMyAppointment).mockReset()
  vi.mocked(getMyPets).mockResolvedValue([{ id: 21, nombre: 'Michi', especie: 'Gato' }])
  vi.mocked(getAvailableHours).mockResolvedValue(['10:00:00'])
  vi.mocked(createMyAppointment).mockResolvedValue({ id: 42, estado: 'PENDIENTE' })
})

function renderForm() {
  render(<MemoryRouter><AppointmentForm /></MemoryRouter>)
}

it('rechaza una fecha pasada sin enviar la cita a la API', async () => {
  renderForm()
  await screen.findByRole('option', { name: 'Michi (Gato)' })

  fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2000-01-01' } })
  await screen.findByRole('option', { name: '10:00' })
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar Cita' }))

  expect(await screen.findByText('La fecha no puede ser anterior a hoy.')).toBeInTheDocument()
  expect(createMyAppointment).not.toHaveBeenCalled()
})

it('consulta disponibilidad y envía la cita pendiente a la API', async () => {
  renderForm()
  await screen.findByRole('option', { name: 'Michi (Gato)' })

  const fecha = '2099-11-16'
  fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: fecha } })
  await waitFor(() => expect(getAvailableHours).toHaveBeenCalledWith(fecha))
  await screen.findByRole('option', { name: '10:00' })

  fireEvent.change(screen.getByLabelText('Hora'), { target: { value: '10:00' } })
  fireEvent.change(screen.getByLabelText('Motivo de la consulta'), {
    target: { value: 'Control preventivo' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar Cita' }))

  await waitFor(() => expect(createMyAppointment).toHaveBeenCalledWith({
    mascotaId: 21,
    servicio: 'Consulta General',
    fecha,
    hora: '10:00',
    motivo: 'Control preventivo',
  }))
  expect(await screen.findByText(/Cita agendada exitosamente/)).toBeInTheDocument()
})
