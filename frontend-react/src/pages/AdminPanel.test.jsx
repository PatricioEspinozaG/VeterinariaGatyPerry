import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter } from 'react-router'
import AdminPanel from './AdminPanel.jsx'
import {
  createProduct,
  discontinueProduct,
  updateProduct,
} from '../services/productsApi.js'
import { getManagedAppointments } from '../services/appointmentsApi.js'
import { createAdminUser, deactivateAdminUser, getAdminUsers, updateAdminUser } from '../services/adminUsersApi.js'

vi.mock('../services/adminUsersApi.js', () => ({
  getAdminUsers: vi.fn(),
  createAdminUser: vi.fn(),
  updateAdminUser: vi.fn(),
  deactivateAdminUser: vi.fn(),
}))

vi.mock('../services/productsApi.js', () => ({
  createProduct: vi.fn(),
  discontinueProduct: vi.fn(),
  updateProduct: vi.fn(),
}))
vi.mock('../services/appointmentsApi.js', () => ({
  getManagedAppointments: vi.fn(),
  changeManagedAppointmentStatus: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(getManagedAppointments).mockResolvedValue([])
  vi.mocked(getAdminUsers).mockResolvedValue(initialUsers)
  vi.mocked(deactivateAdminUser).mockResolvedValue(undefined)
  vi.mocked(updateAdminUser).mockImplementation(async (id, form) => ({
    ...initialUsers.find((item) => item.id === id), name: form.name,
  }))
  vi.mocked(createAdminUser).mockImplementation(async (form) => ({
    id: 'new-user', name: form.name, lastName: form.lastName,
    email: form.email, role: form.role, active: form.active,
  }))
})

const initialUsers = [
  { id: 'admin-1', run: '123456785', phone: '+56912345678', region: "O'Higgins", commune: 'Rancagua', name: 'Administradora', lastName: 'Demo', email: 'admin@duoc.cl', role: 'admin', active: true },
  { id: 'client-1', run: '111111111', phone: '+56912345679', region: "O'Higgins", commune: 'Rancagua', name: 'Cliente', lastName: 'Demo', email: 'cliente@gmail.com', role: 'cliente', active: true },
]

function StatefulAdminPanel() {
  const [users, setUsers] = useState(initialUsers)
  const currentUser = users.find((user) => user.id === 'admin-1')

  return (
    <MemoryRouter initialEntries={['/admin/usuarios']}>
      <AdminPanel
        section="usuarios"
        products={[]}
        setProducts={vi.fn()}
        users={users}
        setUsers={setUsers}
        currentUser={currentUser}
      />
    </MemoryRouter>
  )
}

it('permite editar los datos de un usuario', async () => {
  const user = userEvent.setup()
  render(<StatefulAdminPanel />)

  await user.click((await screen.findAllByRole('button', { name: 'Editar' }))[0])
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  await user.clear(screen.getByLabelText('Nombre'))
  await user.type(screen.getByLabelText('Nombre'), 'Nuevo nombre')
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

  expect(await screen.findByText('Nuevo nombre Demo')).toBeInTheDocument()
  expect(updateAdminUser).toHaveBeenCalledWith('admin-1', expect.objectContaining({ name: 'Nuevo nombre' }))
  expect(screen.getByRole('status')).toHaveTextContent('Usuario actualizado correctamente.')
})

it('abre la edición del producto como overlay', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AdminPanel
        products={[{ code: 'ME001', name: 'Producto demo', category: 'Consulta', price: 1000, stock: 4 }]}
        setProducts={vi.fn()}
        users={initialUsers}
        currentUser={initialUsers[0]}
      />
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Editar' }))

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Editar producto' })).toBeInTheDocument()
  expect(screen.getByLabelText('Nombre')).toHaveValue('Producto demo')
})

it('permite eliminar un usuario después de confirmar', async () => {
  const user = userEvent.setup()
  render(<StatefulAdminPanel />)

  await user.click((await screen.findAllByRole('button', { name: 'Desactivar' }))[1])
  expect(screen.getByRole('alertdialog')).toHaveTextContent(
  '¿Desactivar al usuario "Cliente Demo"?',)
  expect(screen.getByText('Cliente Demo')).toBeInTheDocument()
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-delete'))

  expect(await screen.findByText('Inactivo')).toBeInTheDocument()
  expect(deactivateAdminUser).toHaveBeenCalledWith('client-1')
  expect(screen.getByRole('status')).toHaveTextContent('Usuario desactivado correctamente.')
})

it('descontinúa un producto después de confirmarlo en la API', async () => {
  vi.mocked(discontinueProduct).mockResolvedValue(null)

  const user = userEvent.setup()
  const product = {
    code: 'ME001',
    name: 'Producto demo',
    category: 'Consulta',
    price: 1000,
    stock: 4,
  }
  const setProducts = vi.fn()

  render(
    <MemoryRouter>
      <AdminPanel
        products={[product]}
        setProducts={setProducts}
        users={initialUsers}
        currentUser={initialUsers[0]}
      />
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Descontinuar' }))
  expect(screen.getByRole('alertdialog')).toHaveTextContent(
    '¿Descontinuar el producto "Producto demo"?',
  )

  await user.click(
    screen.getByRole('alertdialog').querySelector('button.btn-delete'),
  )

  await waitFor(() => {
    expect(discontinueProduct).toHaveBeenCalledWith('ME001')
    expect(setProducts).toHaveBeenCalledOnce()
  })

  const updateProducts = setProducts.mock.calls[0][0]
  expect(updateProducts([product])).toEqual([
    { ...product, status: 'Descontinuado' },
  ])
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
})

it('conserva el usuario cuando se cancela la confirmación de eliminación', async () => {
  const user = userEvent.setup()
  render(<StatefulAdminPanel />)

  await user.click((await screen.findAllByRole('button', { name: 'Desactivar' }))[1])
  expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-outline-secondary'))

  expect(screen.getByText('Cliente Demo')).toBeInTheDocument()
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('conserva el producto si se cancela la descontinuación', async () => {
  vi.mocked(discontinueProduct).mockClear()

  const user = userEvent.setup()
  const product = {
    code: 'ME001',
    name: 'Producto demo',
    category: 'Consulta',
    price: 1000,
    stock: 4,
  }
  const setProducts = vi.fn()

  render(
    <MemoryRouter>
      <AdminPanel
        products={[product]}
        setProducts={setProducts}
        users={initialUsers}
        currentUser={initialUsers[0]}
      />
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Descontinuar' }))
  expect(screen.getByRole('alertdialog')).toHaveTextContent(
    '¿Descontinuar el producto "Producto demo"?',
  )

  await user.click(
    screen.getByRole('alertdialog').querySelector('button.btn-outline-secondary'),
  )

  expect(discontinueProduct).not.toHaveBeenCalled()
  expect(setProducts).not.toHaveBeenCalled()
  expect(screen.getByText('Producto demo')).toBeInTheDocument()
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
})

it('impide eliminar la cuenta del administrador que inició sesión', async () => {
  const user = userEvent.setup()
  render(<StatefulAdminPanel />)

  const deleteButtons = await screen.findAllByRole('button', { name: 'Desactivar' })
  expect(deleteButtons[0]).toBeDisabled()
  await user.click(deleteButtons[0])

  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  expect(screen.getByText('Administradora Demo')).toBeInTheDocument()
})

it('muestra las citas recibidas desde citas-service', async () => {
  vi.mocked(getManagedAppointments).mockResolvedValue([{
    id: 77,
    userId: 'client-1',
    mascotaId: 15,
    servicio: 'Consulta general',
    fecha: '2099-05-20',
    hora: '10:00:00',
    motivo: 'Control anual',
    estado: 'PENDIENTE',
    version: 0,
  }])

  render(
    <MemoryRouter initialEntries={['/admin/citas']}>
      <AdminPanel
        section="citas"
        products={[]}
        setProducts={vi.fn()}
        users={initialUsers}
        setUsers={vi.fn()}
        currentUser={initialUsers[0]}
      />
    </MemoryRouter>,
  )

  expect(await screen.findByText('Cliente Demo')).toBeInTheDocument()
  expect(screen.getByText('#15')).toBeInTheDocument()
  expect(screen.getByText('Consulta general')).toBeInTheDocument()
  expect(getManagedAppointments).toHaveBeenCalledOnce()
})

it('usa el mismo botón flotante de creación en la sección de usuarios', () => {
  render(<StatefulAdminPanel />)

  expect(screen.getByRole('button', { name: 'Agregar usuario' })).toHaveClass('fab-pill')
})

it('desplaza el botón flotante hacia arriba cuando el footer se acerca', () => {
  const footer = document.createElement('footer')
  footer.className = 'site-footer'
  footer.getBoundingClientRect = () => ({ top: window.innerHeight - 100 })
  document.body.append(footer)

  render(<StatefulAdminPanel />)

  const offset = Number.parseFloat(
    screen.getByRole('button', { name: 'Agregar usuario' }).style.getPropertyValue('--fab-footer-offset'),
  )
  expect(offset).toBeGreaterThan(0)

  footer.getBoundingClientRect = () => ({ top: -200 })
  window.dispatchEvent(new Event('scroll'))
  const boundedOffset = Number.parseFloat(
    screen.getByRole('button', { name: 'Agregar usuario' }).style.getPropertyValue('--fab-footer-offset'),
  )
  expect(boundedOffset).toBeLessThanOrEqual(window.innerHeight - 16)

  footer.remove()
})

it('mantiene el signo más en el botón circular al abrir el formulario de usuario', async () => {
  const user = userEvent.setup()
  render(<StatefulAdminPanel />)

  const addButton = screen.getByRole('button', { name: 'Agregar usuario' })
  await user.click(addButton)

  expect(screen.getByRole('dialog', { name: 'Nuevo usuario' })).toBeInTheDocument()
  expect(addButton.querySelector('.fab-plus')).toHaveTextContent('+')
  expect(screen.getByRole('button', { name: 'Cancelar creación de usuario' })).toBeInTheDocument()
})

it('crea un usuario de recepción', async () => {
  const user = userEvent.setup()
  render(<StatefulAdminPanel />)

  await user.click(screen.getByRole('button', { name: 'Agregar usuario' }))
  await user.type(screen.getByLabelText('Nombre'), 'Camila')
  await user.type(screen.getByLabelText('Apellidos'), 'Soto')
  await user.type(screen.getByLabelText('RUN'), '12.345.678-5')
  await user.type(screen.getByLabelText('Teléfono'), '+56912345678')
  await user.type(screen.getByLabelText('Correo electrónico'), 'camila@gmail.com')
  await user.type(screen.getByLabelText('Contraseña'), 'clave12345')
  await user.selectOptions(screen.getByLabelText('Rol'), 'recepcion')
  await user.click(screen.getByRole('button', { name: 'Crear usuario' }))

  expect(await screen.findByText('Camila Soto')).toBeInTheDocument()
  expect(createAdminUser).toHaveBeenCalledWith(expect.objectContaining({
    run: '12.345.678-5', phone: '+56912345678', role: 'recepcion',
  }))
  expect(screen.getAllByText('Recepción')).toHaveLength(1)
  expect(screen.getByRole('status'))
    .toHaveTextContent('Usuario agregado correctamente.')
})

it('rechaza crear un usuario con un correo ya registrado', async () => {
  const user = userEvent.setup()
  render(<StatefulAdminPanel />)

  await user.click(screen.getByRole('button', { name: 'Agregar usuario' }))
  await user.type(screen.getByLabelText('Nombre'), 'Otro')
  await user.type(screen.getByLabelText('Apellidos'), 'Cliente')
  await user.type(screen.getByLabelText('RUN'), '12.345.678-5')
  await user.type(screen.getByLabelText('Teléfono'), '+56912345678')
  await user.type(screen.getByLabelText('Correo electrónico'), 'cliente@gmail.com')
  await user.type(screen.getByLabelText('Contraseña'), 'clave12345')
  await user.click(screen.getByRole('button', { name: 'Crear usuario' }))

  expect(screen.getAllByText('Ya existe un usuario con ese correo.'))
    .toHaveLength(1)
  expect(screen.queryByText('Otro Cliente')).not.toBeInTheDocument()
})

it('crea un producto y muestra la respuesta de la API', async () => {
  vi.mocked(createProduct).mockImplementation(async (product) => ({
    ...product,
    stock: 6,
    version: 1,
  }))

  const user = userEvent.setup()
  const setProducts = vi.fn()

  render(
    <MemoryRouter>
      <AdminPanel
        products={[]}
        setProducts={setProducts}
        users={initialUsers}
        currentUser={initialUsers[0]}
      />
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Nuevo Producto' }))
  await user.type(screen.getByLabelText('Nombre'), 'Vacuna demo')
  await user.type(screen.getByLabelText('Categoria'), 'Vacunas')
  await user.type(screen.getByLabelText('Precio'), '6500')
  await user.clear(screen.getByLabelText('Stock'))
  await user.type(screen.getByLabelText('Stock'), '5')
  await user.click(screen.getByRole('button', { name: 'Crear' }))

  await waitFor(() => {
    expect(createProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Vacuna demo',
        category: 'Vacunas',
        price: 6500,
        stock: 5,
      }),
    )
    expect(setProducts).toHaveBeenCalledOnce()
  })

  const updateProducts = setProducts.mock.calls[0][0]
  expect(updateProducts([])[0]).toMatchObject({
    name: 'Vacuna demo',
    category: 'Vacunas',
    price: 6500,
    stock: 6,
    version: 1,
  })
})

it('actualiza un producto y muestra la respuesta de la API', async () => {
  vi.mocked(updateProduct).mockImplementation(async (code, changes) => ({
    ...changes,
    code,
    price: 1100,
    version: 2,
  }))

  const user = userEvent.setup()
  const product = {
    code: 'ME001',
    name: 'Producto demo',
    category: 'Consulta',
    price: 1000,
    stock: 4,
    status: 'Disponible',
    version: 1,
  }
  const setProducts = vi.fn()

  render(
    <MemoryRouter>
      <AdminPanel
        products={[product]}
        setProducts={setProducts}
        users={initialUsers}
        currentUser={initialUsers[0]}
      />
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Editar' }))
  await user.clear(screen.getByLabelText('Precio'))
  await user.type(screen.getByLabelText('Precio'), '1050')
  await user.click(screen.getByRole('button', { name: 'Guardar' }))

  await waitFor(() => {
    expect(updateProduct).toHaveBeenCalledWith(
      'ME001',
      expect.objectContaining({ price: 1050 }),
    )
    expect(setProducts).toHaveBeenCalledOnce()
  })

  const updateProducts = setProducts.mock.calls[0][0]
  expect(updateProducts([product])[0]).toMatchObject({
    code: 'ME001',
    price: 1100,
    version: 2,
  })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
