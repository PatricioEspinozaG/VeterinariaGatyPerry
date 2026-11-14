import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter } from 'react-router'
import { deleteMyPet, getMyPets } from '../services/petsApi.js'
import UserPanel from './UserPanel.jsx'

vi.mock('../services/petsApi.js', () => ({
  getMyPets: vi.fn(),
  deleteMyPet: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(getMyPets).mockReset()
  vi.mocked(deleteMyPet).mockReset()
  vi.mocked(getMyPets).mockResolvedValue([])
  vi.mocked(deleteMyPet).mockResolvedValue(undefined)
})

const customer = {
  id: 'cliente-1',
  name: 'Cliente',
  lastName: 'Demo',
  email: 'cliente@example.com',
  role: 'cliente',
  active: true,
}

function StatefulUserPanel({ section, initialOrders = [] }) {
  const [orders, setOrders] = useState(initialOrders)
  return (
    <MemoryRouter>
      <UserPanel currentUser={customer} section={section} orders={orders} setOrders={setOrders} />
    </MemoryRouter>
  )
}

it('muestra los detalles de compras con etiquetas para su presentación móvil', () => {
  render(
    <MemoryRouter>
      <UserPanel
        currentUser={customer}
        setOrders={() => {}}
        section="compras"
        orders={[{
          id: 'pedido-1',
          userId: customer.id,
          createdAt: '2026-10-16T10:00:00.000Z',
          items: [{ name: 'Alimento', quantity: 2 }],
          delivery: { method: 'retiro' },
          total: 5000,
        }]}
      />
    </MemoryRouter>,
  )

  expect(screen.getByRole('table')).toHaveClass('user-mobile-card-table')
  expect(screen.getByText('Alimento × 2').closest('td')).toHaveAttribute('data-label', 'Productos')
  expect(screen.getByRole('button', { name: 'Quitar' }).closest('td')).toHaveAttribute('data-label', 'Acciones')
})

it('muestra las mascotas recibidas de la API con etiquetas para móvil', async () => {
  vi.mocked(getMyPets).mockResolvedValue([{
    id: 21,
    userId: customer.id,
    nombre: 'Luna',
    especie: 'Gato',
    raza: 'Mestiza',
    edad: 3,
    notas: 'Control anual',
  }])

  render(<StatefulUserPanel section="mascotas" />)

  expect(await screen.findByText('Luna')).toBeInTheDocument()
  expect(screen.getByRole('table')).toHaveClass('user-mobile-card-table')
  expect(screen.getByText('Luna').closest('td')).toHaveAttribute('data-label', 'Nombre')
  expect(getMyPets).toHaveBeenCalledOnce()
})

it('permite quitar una mascota después de confirmarla en la API', async () => {
  vi.mocked(getMyPets).mockResolvedValue([{
    id: 21,
    userId: customer.id,
    nombre: 'Luna',
    especie: 'Gato',
    raza: 'Mestiza',
    edad: 3,
  }])

  const user = userEvent.setup()
  render(<StatefulUserPanel section="mascotas" />)

  await screen.findByText('Luna')
  await user.click(screen.getByRole('button', { name: 'Quitar' }))
  expect(screen.getByRole('alertdialog')).toHaveTextContent('¿Quitar a Luna de tus mascotas?')
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-delete'))

  await waitFor(() => expect(deleteMyPet).toHaveBeenCalledWith(21))
  expect(await screen.findByText('La mascota se quitó de tu cuenta.')).toBeInTheDocument()
  expect(screen.queryByText('Luna')).not.toBeInTheDocument()
})

it('mantiene la mascota visible cuando la API rechaza el borrado', async () => {
  vi.mocked(getMyPets).mockResolvedValue([{
    id: 21,
    userId: customer.id,
    nombre: 'Luna',
    especie: 'Gato',
    raza: 'Mestiza',
    edad: 3,
  }])
  vi.mocked(deleteMyPet).mockRejectedValue(new Error('No se pudo conectar.'))

  const user = userEvent.setup()
  render(<StatefulUserPanel section="mascotas" />)

  await screen.findByText('Luna')
  await user.click(screen.getByRole('button', { name: 'Quitar' }))
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-delete'))

  expect(await screen.findByText('No se pudo conectar.')).toBeInTheDocument()
  expect(screen.getByText('Luna')).toBeInTheDocument()
})

it('permite quitar una compra del historial después de confirmar', async () => {
  const user = userEvent.setup()
  render(<StatefulUserPanel
    section="compras"
    initialOrders={[{
      id: 'pedido-quitar',
      userId: customer.id,
      items: [{ name: 'Alimento', quantity: 1 }],
      total: 1000,
    }]}
  />)

  await user.click(screen.getByRole('button', { name: 'Quitar' }))
  expect(screen.getByRole('alertdialog')).toHaveTextContent('¿Quitar el pedido #pedido-quitar de tu historial?')
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-delete'))

  expect(await screen.findByText('Todavía no tienes compras registradas.')).toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('La compra se quitó del historial.')
})

it('presenta las citas del cliente como tarjetas adaptables a móvil', () => {
  localStorage.setItem('appointments', JSON.stringify([{
    id: 'cita-1',
    userId: customer.id,
    petName: 'Luna',
    servicio: 'Consulta general',
    fecha: '2026-10-20',
    hora: '10:00',
    status: 'pending',
  }]))

  render(<StatefulUserPanel section="citas" />)

  expect(screen.getByRole('table')).toHaveClass('user-appointments-table')
  expect(screen.getByText('Luna').closest('td')).toHaveAttribute('data-label', 'Mascota')
  expect(screen.getByRole('button', { name: 'Cancelar cita' }).closest('td'))
    .toHaveAttribute('data-label', 'Acciones')
})