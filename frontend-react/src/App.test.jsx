import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { products as catalogProducts } from './data/products.js'
import { listAppointments } from './services/citas.js'
import { listPets } from './services/mascotas.js'
import { createOrder } from './services/pedidos.js'
import { listProducts } from './services/productos.js'
import App from './App.jsx'

vi.mock('./services/citas.js', () => ({
  cancelAppointment: vi.fn(),
  createAppointment: vi.fn(),
  listAppointments: vi.fn(),
}))
vi.mock('./services/mascotas.js', () => ({
  createPet: vi.fn(),
  deletePet: vi.fn(),
  listPets: vi.fn(),
}))
vi.mock('./services/productos.js', () => ({
  listProducts: vi.fn(),
}))
vi.mock('./services/pedidos.js', () => ({
  createOrder: vi.fn(),
}))
vi.mock('./services/auth.js', () => ({
  loginUser: vi.fn(async () => ({
    id: 'usuario-backend',
    nombre: 'Camila',
    name: 'Camila',
    apellidos: 'Soto',
    email: 'camila@gmail.com',
    role: 'cliente',
    active: true,
  })),
  logoutUser: vi.fn(async () => {}),
  registerUser: vi.fn(async () => ({})),
  restoreSession: vi.fn(async () => null),
}))

beforeEach(() => {
  listProducts.mockResolvedValue(catalogProducts)
  listPets.mockResolvedValue([])
  listAppointments.mockResolvedValue([])
  createOrder.mockResolvedValue({
    id: 'pedido-1',
    items: [{ code: 'ME004', name: 'Nexgard', quantity: 1, unitPrice: 9500 }],
    subtotal: 9500,
    shipping: 0,
    total: 9500,
    deliveryMethod: 'retiro',
    status: 'PENDIENTE',
    createdAt: '2026-11-16T18:00:00Z',
  })
})

it('permite agregar un producto y verlo en el carrito', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )

  const navegacion = screen.getByRole('navigation', {
    name: 'Navegación principal',
  })
  await user.click(
    within(navegacion).getByRole('link', { name: 'Productos' }),
  )

  expect(
    await screen.findByRole('heading', { name: 'Catálogo de productos' }),
  ).toBeInTheDocument()

  await user.type(screen.getByLabelText('Buscar productos'), 'Nexgard')
  await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))

  await user.click(
    screen.getByRole('link', { name: 'Carrito, 1 productos' }),
  )

  expect(
    screen.getByRole('heading', { name: 'Carrito de productos' }),
  ).toBeInTheDocument()
  expect(screen.getByText('Unidades: 1')).toBeInTheDocument()
})

it('muestra el error si no se puede cargar el catálogo', async () => {
  listProducts.mockRejectedValueOnce(new Error('Catálogo no disponible.'))

  render(
    <MemoryRouter initialEntries={['/productos']}>
      <App />
    </MemoryRouter>,
  )

  expect(await screen.findByRole('alert')).toHaveTextContent('Catálogo no disponible.')
})

it('completa una compra y deja el carrito vacío', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/productos']}>
      <App />
    </MemoryRouter>,
  )

  await screen.findByRole('heading', { name: 'Catálogo de productos' })
  await user.type(screen.getByLabelText('Buscar productos'), 'Nexgard')
  await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
  await user.click(screen.getByRole('link', { name: 'Carrito, 1 productos' }))
  await user.click(screen.getByRole('link', { name: 'Continuar a compra' }))

  await user.type(screen.getByLabelText('Nombre completo'), 'Patricio Espinoza')
  await user.type(screen.getByLabelText('Correo electrónico'), 'patricio@gmail.com')
  await user.selectOptions(screen.getByLabelText('Método de entrega'), 'retiro')
  await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

  expect(
    await screen.findByRole('heading', { name: '¡Pedido registrado!' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'Carrito, 0 productos' }),
  ).toBeInTheDocument()
  expect(createOrder).toHaveBeenCalledWith(
    {
      items: [{ code: 'ME004', quantity: 1 }],
      delivery: expect.objectContaining({
        name: 'Patricio Espinoza',
        email: 'patricio@gmail.com',
        method: 'retiro',
      }),
    },
    expect.stringMatching(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ),
  )
})

it('envía al inicio de sesión si se intenta abrir citas sin cuenta', async () => {
  render(
    <MemoryRouter initialEntries={['/citas']}>
      <App />
    </MemoryRouter>,
  )

  expect(
    await screen.findByRole('heading', { name: 'Iniciar sesión' }),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('heading', { name: 'Citas Veterinarias' }),
  ).not.toBeInTheDocument()
})

it('activa la sesión al registrarse y permite abrir mascotas', async () => {
  const user = userEvent.setup()
  const { container } = render(
    <MemoryRouter initialEntries={['/registro']}>
      <App />
    </MemoryRouter>,
  )

  const escribir = async (campo, valor) => {
    await user.type(container.querySelector(`[name="${campo}"]`), valor)
  }

  await escribir('nombre', 'Camila')
  await escribir('apellidos', 'Soto')
  await escribir('run', '12.345.678-5')
  await escribir('email', 'camila@gmail.com')
  await escribir('telefono', '+56 9 1234 5678')
  await escribir('password', 'clave1234')
  await escribir('confirmPassword', 'clave1234')

  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

  await user.click(await screen.findByRole('button', { name: 'Camila' }))
  await user.click(screen.getByRole('link', { name: 'Administrar mascotas' }))
  const enlaceMascota = await screen.findByRole('link', { name: '+ Agregar mascota' })
  await user.click(enlaceMascota)

  expect(
    screen.getByRole('heading', { name: 'Registrar Mascota' }),
  ).toBeInTheDocument()
})

it('permite abrir un consejo y volver a la lista', async () => {
  const user = userEvent.setup()

  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )

  const navegacion = screen.getByRole('navigation', {
    name: 'Navegación principal',
  })
  await user.click(within(navegacion).getByRole('link', { name: 'Consejos' }))

  expect(
    screen.getByRole('heading', { name: 'Consejos para cuidarlos mejor' }),
  ).toBeInTheDocument()

  await user.click(screen.getAllByRole('link', { name: 'Leer consejo' })[0])

  expect(
    screen.getByRole('heading', { name: 'Calendario de vacunas para perros' }),
  ).toBeInTheDocument()

  await user.click(screen.getByRole('link', { name: 'Volver a consejos' }))

  expect(
    screen.getByRole('heading', { name: 'Consejos para cuidarlos mejor' }),
  ).toBeInTheDocument()
})

it('muestra un aviso cuando el consejo no existe', () => {
  render(
    <MemoryRouter initialEntries={['/consejos/no-existe']}>
      <App />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { name: 'Consejo no encontrado' }),
  ).toBeInTheDocument()
  expect(
    screen.getByText('No encontramos el consejo que buscabas.'),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'Volver a consejos' }),
  ).toHaveAttribute('href', '/consejos')
})