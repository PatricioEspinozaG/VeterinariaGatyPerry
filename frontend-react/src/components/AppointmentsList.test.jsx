import { beforeEach, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import AppointmentsList from './AppointmentsList.jsx'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  cancelAppointment,
  changeManagedAppointmentStatus,
  createManagedAppointment,
  listAppointments,
  listManagedAppointments,
  rescheduleManagedAppointment,
} from '../services/citas.js'
import { listAppointmentClients } from '../services/clientes.js'
import { listManagedPets, listPets } from '../services/mascotas.js'

vi.mock('../services/citas.js', () => ({
  cancelAppointment: vi.fn(),
  changeManagedAppointmentStatus: vi.fn(),
  createManagedAppointment: vi.fn(),
  listAppointments: vi.fn(),
  listManagedAppointments: vi.fn(),
  rescheduleManagedAppointment: vi.fn(),
}))
vi.mock('../services/clientes.js', () => ({
  listAppointmentClients: vi.fn(),
}))
vi.mock('../services/mascotas.js', () => ({
  listManagedPets: vi.fn(),
  listPets: vi.fn(),
}))

const client = { id: 7, nombre: 'Cliente', apellidos: 'Demo' }
const pet = { id: 10, nombre: 'Luna', userId: '7' }
const appointment = {
  id: 1,
  userId: 7,
  mascotaId: 10,
  servicio: 'Consulta General',
  fecha: '2099-10-20',
  hora: '10:00:00',
  estado: 'PENDIENTE',
  motivo: 'Control anual',
  version: 0,
}

beforeEach(() => {
  vi.clearAllMocks()
  listAppointments.mockResolvedValue([])
  listManagedAppointments.mockResolvedValue([])
  listAppointmentClients.mockResolvedValue([client])
  listPets.mockResolvedValue([])
  listManagedPets.mockResolvedValue([pet])
  cancelAppointment.mockResolvedValue({ estado: 'CANCELADA' })
  createManagedAppointment.mockImplementation((userId, data) => Promise.resolve({
    id: 22,
    userId,
    ...data,
    estado: 'PENDIENTE',
    version: 0,
  }))
  rescheduleManagedAppointment.mockImplementation((id, version, data) => Promise.resolve({
    id,
    userId: 7,
    ...data,
    estado: 'PENDIENTE',
    version: version + 1,
  }))
  changeManagedAppointmentStatus.mockImplementation((id, estado) => Promise.resolve({
    id,
    estado,
    version: 1,
  }))
})

it('permite al dueño cancelar su cita mediante el backend', async () => {
  listAppointments.mockResolvedValueOnce([appointment])
  listPets.mockResolvedValueOnce([
    pet,
    { id: 11, nombre: 'Michi', especie: 'Gato' },
  ])

  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AppointmentsList userRole="cliente" currentUserId="7" />
    </MemoryRouter>,
  )

  expect(await screen.findByText('Luna')).toBeInTheDocument()
  expect(screen.queryByText('Michi')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Cancelar cita' }))
  expect(screen.getByRole('alertdialog')).toHaveTextContent('¿Quieres cancelar la cita de “Luna”?')
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-outline-secondary'))
  expect(cancelAppointment).not.toHaveBeenCalled()

  await user.click(screen.getByRole('button', { name: 'Cancelar cita' }))
  await user.click(screen.getByRole('button', { name: 'Sí, cancelar cita' }))

  expect(await screen.findByText('Cancelada', { selector: 'span.badge' })).toBeInTheDocument()
  expect(cancelAppointment).toHaveBeenCalledWith(1)
})

it('carga clientes y mascotas reales para editar una cita administrativa', async () => {
  listManagedAppointments.mockResolvedValueOnce([appointment])

  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AppointmentsList userRole="admin" adminMode />
    </MemoryRouter>,
  )

  expect(await screen.findByText('Cliente Demo')).toBeInTheDocument()
  expect(screen.getByText('Luna')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Editar' }))

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByLabelText('Cliente')).toHaveValue('7')
  expect(screen.getByLabelText('Mascota')).toHaveValue('10')
  expect(listManagedPets).toHaveBeenCalledWith('7')
})

it('reprograma la cita enviando la versión y los IDs al backend', async () => {
  listManagedAppointments.mockResolvedValueOnce([appointment])
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AppointmentsList userRole="admin" adminMode />
    </MemoryRouter>,
  )

  await user.click(await screen.findByRole('button', { name: 'Editar' }))
  fireEvent.change(screen.getByLabelText('Fecha'), {
    target: { value: '2099-11-21' },
  })
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

  expect(rescheduleManagedAppointment).toHaveBeenCalledWith(1, 0, {
    mascotaId: 10,
    servicio: 'Consulta General',
    fecha: '2099-11-21',
    hora: '10:00',
    motivo: 'Control anual',
  })
  expect(await screen.findByText('2099-11-21')).toBeInTheDocument()
})

it('actualiza el estado de la cita y confirma antes de cancelarla', async () => {
  listManagedAppointments.mockResolvedValueOnce([appointment])
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AppointmentsList userRole="admin" adminMode />
    </MemoryRouter>,
  )

  expect(await screen.findByText('Pendiente', { selector: 'span.badge' })).toBeInTheDocument()
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Cambiar estado de cita de Luna' }),
    'CONFIRMADA',
  )
  expect(await screen.findByText('Confirmada', { selector: 'span.badge' })).toBeInTheDocument()
  expect(changeManagedAppointmentStatus).toHaveBeenCalledWith(1, 'CONFIRMADA')

  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Cambiar estado de cita de Luna' }),
    'CANCELADA',
  )
  expect(screen.getByRole('alertdialog')).toHaveTextContent('¿Cancelar la cita de “Luna”?')
  await user.click(screen.getByRole('button', { name: 'Cancelar cita' }))

  expect(await screen.findByText('Cancelada', { selector: 'span.badge' })).toBeInTheDocument()
  expect(changeManagedAppointmentStatus).toHaveBeenLastCalledWith(1, 'CANCELADA')
})

it('crea citas usando el cliente y la mascota seleccionados desde el backend', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AppointmentsList userRole="admin" adminMode />
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Agregar cita' }))
  await screen.findByRole('option', { name: 'Cliente Demo · #7' })
  await user.selectOptions(screen.getByLabelText('Cliente'), '7')
  await screen.findByRole('option', { name: 'Luna' })
  await user.selectOptions(screen.getByLabelText('Mascota'), '10')
  fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2099-05-20' } })
  await user.selectOptions(screen.getByLabelText('Hora'), '10:00')
  await user.type(screen.getByLabelText('Motivo'), 'Vacunación anual')
  await user.click(screen.getByRole('button', { name: 'Crear cita' }))

  expect(await screen.findByText('Luna')).toBeInTheDocument()
  expect(createManagedAppointment).toHaveBeenCalledWith(7, {
    mascotaId: 10,
    servicio: 'Consulta general',
    fecha: '2099-05-20',
    hora: '10:00',
    motivo: 'Vacunación anual',
  })
  expect(localStorage.getItem('appointments')).toBeNull()
})

it('muestra errores del backend al guardar una cita', async () => {
  createManagedAppointment.mockRejectedValueOnce(new Error('El horario ya está ocupado.'))
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AppointmentsList userRole="admin" adminMode />
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Agregar cita' }))
  await screen.findByRole('option', { name: 'Cliente Demo · #7' })
  await user.selectOptions(screen.getByLabelText('Cliente'), '7')
  await screen.findByRole('option', { name: 'Luna' })
  await user.selectOptions(screen.getByLabelText('Mascota'), '10')
  fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2099-05-20' } })
  await user.selectOptions(screen.getByLabelText('Hora'), '10:00')
  await user.type(screen.getByLabelText('Motivo'), 'Control anual')
  await user.click(screen.getByRole('button', { name: 'Crear cita' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('El horario ya está ocupado.')
})

it('rechaza crear una cita con fecha no futura', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AppointmentsList userRole="admin" adminMode />
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Agregar cita' }))
  await screen.findByRole('option', { name: 'Cliente Demo · #7' })
  await user.selectOptions(screen.getByLabelText('Cliente'), '7')
  await screen.findByRole('option', { name: 'Luna' })
  await user.selectOptions(screen.getByLabelText('Mascota'), '10')

  const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: ayer } })
  await user.selectOptions(screen.getByLabelText('Hora'), '10:00')
  await user.type(screen.getByLabelText('Motivo'), 'Control anual')
  fireEvent.submit(screen.getByText('Nueva cita').closest('form'))

  expect(screen.getByRole('alert')).toHaveTextContent('La fecha de la cita debe ser futura.')
  expect(createManagedAppointment).not.toHaveBeenCalled()
})
