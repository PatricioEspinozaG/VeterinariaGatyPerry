import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import {
  listManagedOrders,
  updateManagedOrderStatus,
} from '../services/pedidos.js'
import OrdersManagementPanel from './OrdersManagementPanel.jsx'

vi.mock('../services/pedidos.js', () => ({
  listManagedOrders: vi.fn(),
  updateManagedOrderStatus: vi.fn(),
}))

const order = {
  id: 'pedido-1',
  customerName: 'Ana Soto',
  customerEmail: 'ana@example.com',
  items: [{ code: 'ME001', name: 'Alimento', quantity: 2 }],
  subtotal: 8400,
  shipping: 3990,
  total: 12390,
  deliveryMethod: 'envio',
  status: 'REGISTRADO',
  createdAt: '2026-03-01T10:00:00Z',
  region: 'Metropolitana',
  commune: 'Santiago',
  address: 'Calle 1',
  version: 0,
}

beforeEach(() => {
  vi.clearAllMocks()
  listManagedOrders.mockResolvedValue([order])
  updateManagedOrderStatus.mockImplementation(async (id, status, version) => ({
    ...order,
    status,
    version: version + 1,
  }))
})

it('muestra el pedido y avanza solo al siguiente estado permitido', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/admin/pedidos']}>
      <OrdersManagementPanel
        currentUser={{ id: '1', name: 'Admin', role: 'admin' }}
      />
    </MemoryRouter>,
  )

  expect(await screen.findByText('Ana Soto')).toBeInTheDocument()
  expect(screen.getByText('Calle 1, Santiago, Metropolitana')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Marcar: En preparación' }))

  await waitFor(() => expect(updateManagedOrderStatus).toHaveBeenCalledWith(
    'pedido-1',
    'EN_PREPARACION',
    0,
  ))
  expect(await screen.findByRole('button', { name: 'Marcar: En camino' }))
    .toBeInTheDocument()
})
