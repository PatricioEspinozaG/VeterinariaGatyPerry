import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter } from 'react-router'
import { listAppointments } from '../services/citas.js'
import { deletePet, listPets } from '../services/mascotas.js'
import UserPanel from './UserPanel.jsx'

vi.mock('../services/citas.js', () => ({
  listAppointments: vi.fn(),
}))
vi.mock('../services/mascotas.js', () => ({
  deletePet: vi.fn(),
  listPets: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  listAppointments.mockResolvedValue([])
  listPets.mockResolvedValue([])
  deletePet.mockResolvedValue(null)
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

it('muestra en el resumen la cantidad de citas obtenida del backend', async () => {
  listAppointments.mockResolvedValueOnce([{ id: 1 }, { id: 2 }])

  render(
    <MemoryRouter>
      <UserPanel currentUser={customer} section="resumen" />
    </MemoryRouter>,
  )

  const count = await screen.findByText('2')
  expect(count).toHaveClass('stat-value')
})

it('muestra las mascotas con etiquetas para su presentación móvil', async () => {
  listPets.mockResolvedValueOnce([{
    id: 'mascota-1',
    userId: customer.id,
    nombre: 'Luna',
    especie: 'Gato',
    raza: 'Mestiza',
    edad: 3,
    notas: 'Control anual',
  }])

  render(
    <MemoryRouter>
      <UserPanel currentUser={customer} section="mascotas" />
    </MemoryRouter>,
  )

  expect(await screen.findByRole('table')).toHaveClass('user-mobile-card-table')
  expect(screen.getByText('Luna').closest('td')).toHaveAttribute('data-label', 'Nombre')
})

it('permite quitar una mascota del backend después de confirmar', async () => {
  listPets.mockResolvedValueOnce([{
    id: 'mascota-quitar',
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

  expect(screen.queryByText('Luna')).not.toBeInTheDocument()
  expect(deletePet).toHaveBeenCalledWith('mascota-quitar')
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

it('presenta las citas del cliente como tarjetas adaptables a móvil', async () => {
  listAppointments.mockResolvedValueOnce([{
    id: 1,
    userId: customer.id,
    mascotaId: 10,
    servicio: 'Consulta general',
    fecha: '2099-10-20',
    hora: '10:00:00',
    estado: 'PENDIENTE',
  }])
  listPets.mockResolvedValue([{
    id: 10,
    nombre: 'Luna',
    especie: 'Gato',
  }])

  render(
    <MemoryRouter>
      <UserPanel currentUser={customer} section="citas" />
    </MemoryRouter>,
  )

  expect(await screen.findByRole('table')).toHaveClass('user-appointments-table')
  expect(screen.getByText('Luna').closest('td')).toHaveAttribute('data-label', 'Mascota')
  expect(screen.getByRole('button', { name: 'Cancelar cita' }).closest('td'))
    .toHaveAttribute('data-label', 'Acciones')
})
