import { expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import AppointmentForm from './AppointmentForm.jsx'

it('rechaza una cita con fecha pasada sin guardarla', () => {
  localStorage.setItem('pets', JSON.stringify([
    {
      id: 'mascota-1',
      userId: 'usuario-1',
      nombre: 'Michi',
      especie: 'Gato',
    },
  ]))
  const onAddAppointment = vi.fn()

  render(
    <MemoryRouter>
      <AppointmentForm
        currentUserId="usuario-1"
        onAddAppointment={onAddAppointment}
      />
    </MemoryRouter>,
  )

  fireEvent.change(screen.getByLabelText('Fecha'), {
    target: { value: '2000-01-01' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar Cita' }))

  expect(
    screen.getByText('La fecha no puede ser anterior a hoy.'),
  ).toBeInTheDocument()
  expect(onAddAppointment).not.toHaveBeenCalled()
})

it('entrega una cita pendiente con los datos de la mascota', () => {
  localStorage.setItem('pets', JSON.stringify([
    {
      id: 'mascota-1',
      userId: 'usuario-1',
      nombre: 'Michi',
      especie: 'Gato',
    },
  ]))
  const onAddAppointment = vi.fn()
  const manana = new Date(Date.now() + 86_400_000)
    .toISOString()
    .slice(0, 10)

  render(
    <MemoryRouter>
      <AppointmentForm
        currentUserId="usuario-1"
        onAddAppointment={onAddAppointment}
      />
    </MemoryRouter>,
  )

  fireEvent.change(screen.getByLabelText('Fecha'), {
    target: { value: manana },
  })
  fireEvent.change(screen.getByLabelText('Hora'), {
    target: { value: '10:00' },
  })
  fireEvent.change(screen.getByLabelText('Motivo de la consulta'), {
    target: { value: 'Control preventivo' },
  })

  // Evita esperar el redireccionamiento de 1,2 segundos.
  vi.spyOn(globalThis, 'setTimeout').mockImplementation(() => 0)
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar Cita' }))

  expect(onAddAppointment).toHaveBeenCalledWith(
    expect.objectContaining({
      userId: 'usuario-1',
      petId: 'mascota-1',
      petName: 'Michi',
      fecha: manana,
      hora: '10:00',
      motivo: 'Control preventivo',
      estado: 'Pendiente',
    }),
  )
})

