import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter } from 'react-router'
import AdminPanel from './AdminPanel.jsx'

const initialUsers = [
  { id: 'admin-1', name: 'Administradora', lastName: 'Demo', email: 'admin@example.com', password: 'admin12345', role: 'admin', active: true },
  { id: 'client-1', name: 'Cliente', lastName: 'Demo', email: 'cliente@example.com', password: 'cliente12345', role: 'cliente', active: true },
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

  await user.click(screen.getAllByRole('button', { name: 'Editar' })[0])
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  await user.clear(screen.getByLabelText('Nombre'))
  await user.type(screen.getByLabelText('Nombre'), 'Nuevo nombre')
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

  expect(screen.getByText('Nuevo nombre Demo')).toBeInTheDocument()
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

  await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[1])
  expect(screen.getByRole('alertdialog')).toHaveTextContent('¿Eliminar al usuario “Cliente Demo”?')
  expect(screen.getByText('Cliente Demo')).toBeInTheDocument()
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-delete'))

  expect(screen.queryByText('Cliente Demo')).not.toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('Usuario eliminado correctamente.')
})

it('elimina un producto al confirmar desde el diálogo de la página', async () => {
  const user = userEvent.setup()
  const product = { code: 'ME001', name: 'Producto demo', category: 'Consulta', price: 1000, stock: 4 }
  const setProducts = vi.fn((update) => update([product]))
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

  await user.click(screen.getByRole('button', { name: 'Eliminar' }))
  expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-delete'))

  expect(setProducts).toHaveBeenCalled()
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
})

it('conserva el usuario cuando se cancela la confirmación de eliminación', async () => {
  const user = userEvent.setup()
  render(<StatefulAdminPanel />)

  await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[1])
  expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-outline-secondary'))

  expect(screen.getByText('Cliente Demo')).toBeInTheDocument()
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('conserva el producto cuando se cancela la confirmación de eliminación', async () => {
  const user = userEvent.setup()
  const product = { code: 'ME001', name: 'Producto demo', category: 'Consulta', price: 1000, stock: 4 }
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
  await user.click(screen.getByRole('button', { name: 'Eliminar' }))
  expect(screen.getByRole('alertdialog')).toHaveTextContent('¿Eliminar el producto “Producto demo”?')
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-outline-secondary'))

  expect(setProducts).not.toHaveBeenCalled()
  expect(screen.getByText('Producto demo')).toBeInTheDocument()
})

it('impide eliminar la cuenta del administrador que inició sesión', async () => {
  const user = userEvent.setup()
  render(<StatefulAdminPanel />)

  const deleteButtons = screen.getAllByRole('button', { name: 'Eliminar' })
  expect(deleteButtons[0]).toBeDisabled()
  await user.click(deleteButtons[0])

  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  expect(screen.getByText('Administradora Demo')).toBeInTheDocument()
})

it('crea y muestra una cita de ejemplo al abrir la sección de citas vacía', async () => {
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

  expect(await screen.findByText('Luna')).toBeInTheDocument()
  expect(screen.getByText('Consulta general')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Agregar cita' })).toHaveClass('fab-pill')
  expect(JSON.parse(localStorage.getItem('appointments'))).toEqual([
    expect.objectContaining({
      id: 'cita-demo-admin',
      userId: 'client-1',
      petName: 'Luna',
      estado: 'Pendiente',
    }),
  ])
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
