import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { changeManagedAppointmentStatus, listManagedAppointments } from '../services/citas.js'
import { listAppointmentClients } from '../services/clientes.js'
import { listManagedPets } from '../services/mascotas.js'
import ReceptionPanel from './ReceptionPanel.jsx'

vi.mock('../services/citas.js', () => ({
  changeManagedAppointmentStatus: vi.fn(),
  listManagedAppointments: vi.fn(),
}))
vi.mock('../services/clientes.js', () => ({
  listAppointmentClients: vi.fn(),
}))
vi.mock('../services/mascotas.js', () => ({
  listManagedPets: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  listManagedAppointments.mockResolvedValue([{
    id: 1,
    userId: 7,
    mascotaId: 10,
    servicio: 'Consulta General',
    fecha: '2099-05-20',
    hora: '10:00:00',
    estado: 'PENDIENTE',
    motivo: 'Control general',
    version: 0,
  }])
  listAppointmentClients.mockResolvedValue([{
    id: 7,
    nombre: 'Cliente',
    apellidos: 'Demo',
  }])
  listManagedPets.mockResolvedValue([{ id: 10, nombre: 'Michi', userId: '7' }])
  changeManagedAppointmentStatus.mockResolvedValue({
    id: 1,
    estado: 'CONFIRMADA',
    version: 1,
  })
})

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

it('permite a recepción cambiar el estado de una cita mediante el backend', async () => {
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

  expect(await screen.findByText('Michi')).toBeInTheDocument()
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Cambiar estado de cita de Michi' }),
    'CONFIRMADA',
  )

  expect(await screen.findByText('Confirmada', { selector: 'span.badge' }))
    .toBeInTheDocument()
  expect(changeManagedAppointmentStatus).toHaveBeenCalledWith(1, 'CONFIRMADA')
})