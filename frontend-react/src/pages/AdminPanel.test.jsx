import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import {
  createProduct,
  discontinueProduct,
  listManagedProducts,
  updateProduct,
} from '../services/productos.js'
import { listManagedAppointments } from '../services/citas.js'
import { listAppointmentClients } from '../services/clientes.js'
import { listManagedPets } from '../services/mascotas.js'
import {
  createAdminUser,
  deactivateAdminUser,
  listAdminUsers,
  updateAdminUser,
} from '../services/adminUsuarios.js'
import AdminPanel from './AdminPanel.jsx'

vi.mock('../services/productos.js', () => ({
  createProduct: vi.fn(),
  discontinueProduct: vi.fn(),
  listManagedProducts: vi.fn(),
  updateProduct: vi.fn(),
}))
vi.mock('../services/citas.js', () => ({
  listManagedAppointments: vi.fn(),
}))
vi.mock('../services/clientes.js', () => ({
  listAppointmentClients: vi.fn(),
}))
vi.mock('../services/mascotas.js', () => ({
  listManagedPets: vi.fn(),
}))
vi.mock('../services/adminUsuarios.js', () => ({
  createAdminUser: vi.fn(),
  deactivateAdminUser: vi.fn(),
  listAdminUsers: vi.fn(),
  updateAdminUser: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  listManagedProducts.mockResolvedValue([])
  createProduct.mockResolvedValue({ code: 'ME099', name: 'Producto demo' })
  updateProduct.mockResolvedValue({ code: 'ME001', name: 'Producto demo' })
  discontinueProduct.mockResolvedValue(null)
  listManagedAppointments.mockResolvedValue([])
  listAppointmentClients.mockResolvedValue([])
  listManagedPets.mockResolvedValue([])
  listAdminUsers.mockResolvedValue(initialUsers)
  createAdminUser.mockImplementation(async (user) => ({
    id: '3',
    name: user.nombre,
    lastName: user.apellidos,
    run: user.run,
    email: user.email,
    telefono: user.telefono,
    region: user.region,
    comuna: user.comuna,
    direccion: user.direccion,
    role: user.rol.toLowerCase(),
    active: user.activo,
  }))
  updateAdminUser.mockImplementation(async (id, user) => ({
    ...initialUsers.find((item) => item.id === id),
    name: user.nombre,
    lastName: user.apellidos,
    email: user.email,
    telefono: user.telefono,
    region: user.region,
    comuna: user.comuna,
    direccion: user.direccion,
    role: user.rol.toLowerCase(),
    active: user.activo,
  }))
  deactivateAdminUser.mockResolvedValue(null)
})

const initialUsers = [
  { id: '1', name: 'Administradora', lastName: 'Demo', run: '11111111-1', email: 'admin@duoc.cl', telefono: '+56912345678', region: 'Valparaíso', comuna: 'Valparaíso', direccion: '', role: 'admin', active: true },
  { id: '2', name: 'Cliente', lastName: 'Demo', run: '22222222-2', email: 'cliente@gmail.com', telefono: '+56912345678', region: 'Valparaíso', comuna: 'Valparaíso', direccion: '', role: 'cliente', active: true },
]

function StatefulAdminPanel({ onCurrentUserUpdate } = {}) {
  return (
    <MemoryRouter initialEntries={['/admin/usuarios']}>
      <AdminPanel
        section="usuarios"
        products={[]}
        setProducts={vi.fn()}
        onCurrentUserUpdate={onCurrentUserUpdate}
        currentUser={initialUsers[0]}
      />
    </MemoryRouter>
  )
}

it('permite editar los datos de un usuario', async () => {
  const user = userEvent.setup()
  const onCurrentUserUpdate = vi.fn()
  render(<StatefulAdminPanel onCurrentUserUpdate={onCurrentUserUpdate} />)

  await user.click((await screen.findAllByRole('button', { name: 'Editar' }))[0])
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  await user.clear(screen.getByLabelText('Nombre'))
  await user.type(screen.getByLabelText('Nombre'), 'Nuevo nombre')
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

  expect(screen.getByText('Nuevo nombre Demo')).toBeInTheDocument()
  expect(updateAdminUser).toHaveBeenCalledWith('1', expect.objectContaining({
    nombre: 'Nuevo nombre',
    email: 'admin@duoc.cl',
  }))
  expect(onCurrentUserUpdate).toHaveBeenCalledWith(expect.objectContaining({
    name: 'Nuevo nombre',
    id: '1',
  }))
  expect(screen.getByRole('status')).toHaveTextContent('Usuario actualizado correctamente.')
})

it('abre la edición del producto como overlay', async () => {
  const user = userEvent.setup()
  const product = { code: 'ME001', name: 'Producto demo', category: 'Consulta', price: 1000, stock: 4 }
  listManagedProducts.mockResolvedValueOnce([product])
  render(
    <MemoryRouter>
      <AdminPanel
        products={[product]}
        setProducts={vi.fn()}
        users={initialUsers}
        currentUser={initialUsers[0]}
      />
    </MemoryRouter>,
  )

  await user.click(await screen.findByRole('button', { name: 'Editar' }))

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Editar producto' })).toBeInTheDocument()
  expect(screen.getByLabelText('Nombre')).toHaveValue('Producto demo')
})

it('permite desactivar un usuario después de confirmar', async () => {
  const user = userEvent.setup()
  render(<StatefulAdminPanel />)

  await user.click((await screen.findAllByRole('button', { name: 'Desactivar' }))[1])
  expect(screen.getByRole('alertdialog')).toHaveTextContent('¿Desactivar al usuario “Cliente Demo”?')
  expect(screen.getByText('Cliente Demo')).toBeInTheDocument()
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-delete'))

  expect(deactivateAdminUser).toHaveBeenCalledWith('2')
  expect(screen.getByText('Cliente Demo')).toBeInTheDocument()
  expect(screen.getByText('Inactivo')).toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('Usuario desactivado correctamente.')
})

it('elimina un producto al confirmar desde el diálogo de la página', async () => {
  const user = userEvent.setup()
  const product = { code: 'ME001', name: 'Producto demo', category: 'Consulta', price: 1000, stock: 4 }
  const setProducts = vi.fn((update) => (
    typeof update === 'function' ? update([product]) : update
  ))
  listManagedProducts.mockResolvedValueOnce([product])
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

  await user.click(await screen.findByRole('button', { name: 'Descontinuar' }))
  expect(await screen.findByRole('alertdialog')).toHaveTextContent(
    'Dejará de aparecer en la tienda, pero permanecerá en el registro.',
  )
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-delete'))

  expect(discontinueProduct).toHaveBeenCalledWith('ME001')
  expect(setProducts).toHaveBeenCalled()
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
})

it('conserva el usuario cuando se cancela la confirmación de desactivación', async () => {
  const user = userEvent.setup()
  render(<StatefulAdminPanel />)

  await user.click((await screen.findAllByRole('button', { name: 'Desactivar' }))[1])
  expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-outline-secondary'))

  expect(screen.getByText('Cliente Demo')).toBeInTheDocument()
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('conserva el producto cuando se cancela la confirmación de eliminación', async () => {
  const user = userEvent.setup()
  const product = { code: 'ME001', name: 'Producto demo', category: 'Consulta', price: 1000, stock: 4 }
  listManagedProducts.mockResolvedValueOnce([product])
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
  await user.click(await screen.findByRole('button', { name: 'Descontinuar' }))
  expect(screen.getByRole('alertdialog')).toHaveTextContent(
    '¿Descontinuar el producto “Producto demo”?',
  )
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-outline-secondary'))

  expect(discontinueProduct).not.toHaveBeenCalled()
  expect(screen.getByText('Producto demo')).toBeInTheDocument()
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

it('muestra las citas de backend sin crear registros de demostración', async () => {
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

  expect(await screen.findByText('No hay citas registradas en esta categoría.'))
    .toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Agregar cita' })).toHaveClass('fab-pill')
  expect(listManagedAppointments).toHaveBeenCalled()
  expect(localStorage.getItem('appointments')).toBeNull()
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

  footer.remove()
})

it('mantiene el signo más en el botón circular al abrir el formulario de usuario', async () => {
  const user = userEvent.setup()
  render(<StatefulAdminPanel />)

  const addButton = screen.getByRole('button', { name: 'Agregar usuario' })
  await user.click(addButton)

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
  await user.type(screen.getByLabelText('Correo electrónico'), 'camila@gmail.com')
  await user.type(screen.getByLabelText('Teléfono de contacto'), '+56912345678')
  await user.type(screen.getByLabelText('Contraseña'), 'clave12345')
  await user.type(screen.getByLabelText('Confirmar contraseña'), 'clave12345')
  await user.selectOptions(screen.getByLabelText('Rol'), 'recepcion')
  await user.click(screen.getByRole('button', { name: 'Crear usuario' }))

  expect(screen.getByText('Camila Soto')).toBeInTheDocument()
  expect(createAdminUser).toHaveBeenCalledWith(expect.objectContaining({
    run: '12.345.678-5',
    rol: 'RECEPCION',
    activo: true,
  }))
  expect(screen.getAllByText('Recepción')).toHaveLength(2)
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
  await user.type(screen.getByLabelText('Correo electrónico'), 'cliente@gmail.com')
  await user.type(screen.getByLabelText('Teléfono de contacto'), '+56912345678')
  await user.type(screen.getByLabelText('Contraseña'), 'clave12345')
  await user.type(screen.getByLabelText('Confirmar contraseña'), 'clave12345')
  await user.click(screen.getByRole('button', { name: 'Crear usuario' }))

  expect(screen.getAllByText('Ya existe un usuario con ese correo.'))
    .toHaveLength(2)
  expect(screen.queryByText('Otro Cliente')).not.toBeInTheDocument()
})

it('crea un producto desde el panel de administración', async () => {
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

  await waitFor(() => expect(setProducts).toHaveBeenCalled())
  setProducts.mockClear()
  await user.click(screen.getByRole('button', { name: 'Nuevo Producto' }))
  await user.type(screen.getByLabelText('Nombre'), 'Vacuna demo')
  await user.type(screen.getByLabelText('Categoria'), 'Vacunas')
  await user.type(screen.getByLabelText('Precio'), '6500')
  await user.clear(screen.getByLabelText('Stock'))
  await user.type(screen.getByLabelText('Stock'), '5')
  await user.click(screen.getByRole('button', { name: 'Crear' }))

  expect(setProducts).toHaveBeenCalledTimes(1)
  expect(createProduct).toHaveBeenCalledWith(expect.objectContaining({
    name: 'Vacuna demo',
    category: 'Vacunas',
    price: 6500,
    stock: 5,
  }))
})

it('guarda las modificaciones de un producto en el backend', async () => {
  const user = userEvent.setup()
  const product = {
    code: 'ME001',
    name: 'Producto demo',
    category: 'Consulta',
    price: 1000,
    stock: 4,
    status: 'Disponible',
  }
  listManagedProducts.mockResolvedValueOnce([product])
  updateProduct.mockResolvedValueOnce({ ...product, price: 1500 })

  render(
    <MemoryRouter>
      <AdminPanel
        products={[product]}
        setProducts={vi.fn()}
        users={initialUsers}
        currentUser={initialUsers[0]}
      />
    </MemoryRouter>,
  )

  await user.click(await screen.findByRole('button', { name: 'Editar' }))
  await user.clear(screen.getByLabelText('Precio'))
  await user.type(screen.getByLabelText('Precio'), '1500')
  await user.click(screen.getByRole('button', { name: 'Guardar' }))

  await waitFor(() => expect(updateProduct).toHaveBeenCalledWith(
    'ME001',
    expect.objectContaining({ code: 'ME001', price: 1500, stock: 4 }),
  ))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})