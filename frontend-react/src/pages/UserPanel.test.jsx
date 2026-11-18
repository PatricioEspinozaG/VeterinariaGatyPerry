import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { deleteMyPet, getMyPets } from '../services/petsApi.js'
import {
  cancelMyAppointment,
  getMyAppointments,
} from '../services/appointmentsApi.js'
import { getMyOrders } from '../services/ordersApi.js'
import UserPanel from './UserPanel.jsx'

vi.mock('../services/petsApi.js', () => ({
  getMyPets: vi.fn(),
  deleteMyPet: vi.fn(),
}))

vi.mock('../services/appointmentsApi.js', () => ({
  getMyAppointments: vi.fn(),
  cancelMyAppointment: vi.fn(),
}))

vi.mock('../services/ordersApi.js', () => ({
  getMyOrders: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(getMyPets).mockReset()
  vi.mocked(deleteMyPet).mockReset()
  vi.mocked(getMyAppointments).mockReset()
  vi.mocked(cancelMyAppointment).mockReset()
  vi.mocked(getMyOrders).mockReset()

  vi.mocked(getMyPets).mockResolvedValue([])
  vi.mocked(deleteMyPet).mockResolvedValue(undefined)
  vi.mocked(getMyAppointments).mockResolvedValue([])
  vi.mocked(getMyOrders).mockResolvedValue([])
})

const customer = {
  id: 'cliente-1',
  name: 'Cliente',
  lastName: 'Demo',
  email: 'cliente@example.com',
  role: 'cliente',
  active: true,
}

function renderUserPanel(section) {
  return render(
    <MemoryRouter>
      <UserPanel currentUser={customer} section={section} />
    </MemoryRouter>,
  )
}

it('muestra las compras recibidas de la API con etiquetas para móvil', async () => {
  vi.mocked(getMyOrders).mockResolvedValue([{
    id: 'pedido-1',
    createdAt: '2026-10-16T10:00:00.000Z',
    items: [{ code: 'AL001', name: 'Alimento', quantity: 2 }],
    deliveryMethod: 'retiro',
    total: 5000,
  }])

  renderUserPanel('compras')

  expect(await screen.findByText('Alimento × 2')).toBeInTheDocument()
  expect(screen.getByRole('table')).toHaveClass('user-mobile-card-table')
  expect(screen.getByText('Alimento × 2').closest('td'))
    .toHaveAttribute('data-label', 'Productos')
  expect(screen.getByText('Retiro en clínica').closest('td'))
    .toHaveAttribute('data-label', 'Entrega')
  expect(getMyOrders).toHaveBeenCalledOnce()
})

it('muestra un pedido sin opción para quitarlo del historial', async () => {
  vi.mocked(getMyOrders).mockResolvedValue([{
    id: 'pedido-1',
    createdAt: '2026-10-16T10:00:00.000Z',
    items: [{ code: 'AL001', name: 'Alimento', quantity: 1 }],
    deliveryMethod: 'retiro',
    total: 1000,
  }])

  renderUserPanel('compras')

  expect(await screen.findByText('Alimento × 1')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '#pedido-1' }))
    .toHaveAttribute('href', '/compra/pedido-1')
  expect(screen.queryByRole('button', { name: 'Quitar' })).not.toBeInTheDocument()
})

it('muestra las mascotas recibidas de la API con etiquetas para móvil', async () => {
  vi.mocked(getMyPets).mockResolvedValue([{
    id: 21,
    nombre: 'Luna',
    especie: 'Gato',
    raza: 'Mestiza',
    edad: 3,
    notas: 'Control anual',
  }])

  renderUserPanel('mascotas')

  expect(await screen.findByText('Luna')).toBeInTheDocument()
  expect(screen.getByRole('table')).toHaveClass('user-mobile-card-table')
  expect(screen.getByText('Luna').closest('td'))
    .toHaveAttribute('data-label', 'Nombre')
  expect(getMyPets).toHaveBeenCalledOnce()
})

it('permite quitar una mascota después de confirmarla en la API', async () => {
  vi.mocked(getMyPets).mockResolvedValue([{
    id: 21,
    nombre: 'Luna',
    especie: 'Gato',
    raza: 'Mestiza',
    edad: 3,
  }])

  const user = userEvent.setup()
  renderUserPanel('mascotas')

  await screen.findByText('Luna')
  await user.click(screen.getByRole('button', { name: 'Quitar' }))
  expect(screen.getByRole('alertdialog'))
    .toHaveTextContent('¿Quitar a Luna de tus mascotas?')

  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-delete'))

  await waitFor(() => expect(deleteMyPet).toHaveBeenCalledWith(21))
  expect(await screen.findByText('La mascota se quitó de tu cuenta.'))
    .toBeInTheDocument()
  expect(screen.queryByText('Luna')).not.toBeInTheDocument()
})

it('mantiene la mascota visible cuando la API rechaza el borrado', async () => {
  vi.mocked(getMyPets).mockResolvedValue([{
    id: 21,
    nombre: 'Luna',
    especie: 'Gato',
    raza: 'Mestiza',
    edad: 3,
  }])
  vi.mocked(deleteMyPet).mockRejectedValue(new Error('No se pudo conectar.'))

  const user = userEvent.setup()
  renderUserPanel('mascotas')

  await screen.findByText('Luna')
  await user.click(screen.getByRole('button', { name: 'Quitar' }))
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-delete'))

  expect(await screen.findByText('No se pudo conectar.')).toBeInTheDocument()
  expect(screen.getByText('Luna')).toBeInTheDocument()
})

it('presenta las citas del cliente cargadas desde la API', async () => {
  vi.mocked(getMyPets).mockResolvedValue([{
    id: 21,
    nombre: 'Luna',
    especie: 'Gato',
  }])
  vi.mocked(getMyAppointments).mockResolvedValue([{
    id: 42,
    mascotaId: 21,
    servicio: 'Consulta General',
    fecha: '2099-11-16',
    hora: '10:00:00',
    estado: 'PENDIENTE',
  }])

  renderUserPanel('citas')

  const petCell = (await screen.findByText('Luna')).closest('td')
  expect(petCell).toHaveAttribute('data-label', 'Mascota')
  expect(screen.getByRole('table')).toHaveClass('user-appointments-table')
  expect(screen.getByRole('button', { name: 'Cancelar cita' }).closest('td'))
    .toHaveAttribute('data-label', 'Acciones')
  expect(getMyAppointments).toHaveBeenCalledOnce()
})

it('cuenta las citas de la API en el resumen', async () => {
  vi.mocked(getMyAppointments).mockResolvedValue([{
    id: 42,
    mascotaId: 21,
    estado: 'PENDIENTE',
  }])

  renderUserPanel('resumen')

  await waitFor(() => expect(getMyAppointments).toHaveBeenCalledOnce())
  expect(screen.getByText('Citas').parentElement).toHaveTextContent('1')
})