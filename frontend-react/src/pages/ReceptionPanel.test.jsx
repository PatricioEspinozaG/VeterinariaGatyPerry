import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import ReceptionPanel from './ReceptionPanel.jsx'
import {
  changeManagedAppointmentStatus,
  getManagedAppointments,
} from '../services/appointmentsApi.js'

vi.mock('../services/appointmentsApi.js', () => ({
  getManagedAppointments: vi.fn(),
  changeManagedAppointmentStatus: vi.fn(),
}))

it('no muestra el panel a una cuenta que no es de recepción', () => {
  render(
    <MemoryRouter initialEntries={['/recepcion']}>
      <ReceptionPanel currentUser={{ id: 'c1', role: 'cliente' }} />
    </MemoryRouter>,
  )

  expect(
    screen.queryByRole('heading', { name: 'Panel de recepción' }),
  ).not.toBeInTheDocument()
})

it('permite a recepción cambiar el estado de una cita', async () => {
  const cita = {
    id: 21,
    userId: 'c1',
    mascotaId: 77,
    servicio: 'Consulta General',
    fecha: '2099-05-20',
    hora: '10:00:00',
    estado: 'PENDIENTE',
    motivo: 'Control general',
    version: 0,
  }

  getManagedAppointments.mockResolvedValue([cita])
  changeManagedAppointmentStatus.mockResolvedValue({
    ...cita,
    estado: 'CONFIRMADA',
  })

  const user = userEvent.setup()

  render(
    <MemoryRouter initialEntries={['/recepcion']}>
      <ReceptionPanel
        currentUser={{ id: 'r1', name: 'Recepción', role: 'recepcion' }}
        users={[{
          id: 'c1',
          name: 'Cliente',
          role: 'cliente',
          active: true,
        }]}
      />
    </MemoryRouter>,
  )

  const selector = await screen.findByRole('combobox', {
    name: 'Estado de cita 21',
  })

  await user.selectOptions(selector, 'CONFIRMADA')

  expect(changeManagedAppointmentStatus)
    .toHaveBeenCalledWith(21, 'CONFIRMADA')
})