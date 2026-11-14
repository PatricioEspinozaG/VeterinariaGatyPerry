import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from './App.jsx'
import {
  getMe,
  login,
  logout,
  refreshSession,
  register,
} from './services/authApi.js'
import { getProducts } from './services/productsApi.js'
import { products as sampleProducts } from './data/products.js'
import { getMyPets } from './services/petsApi.js'

vi.mock('./services/authApi.js', () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
  register: vi.fn(),
}))
vi.mock('./services/productsApi.js', () => ({
  getProducts: vi.fn(),
}))
vi.mock('./services/petsApi.js', () => ({
  getMyPets: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  vi.mocked(refreshSession).mockResolvedValue(null)
  vi.mocked(getProducts).mockResolvedValue(sampleProducts)
  vi.mocked(getMyPets).mockResolvedValue([])
})

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

it('permite agregar un producto y verlo en el carrito', async () => {
  const user = userEvent.setup()
  renderAt('/')

  const navegacion = screen.getByRole('navigation', {
    name: 'Navegación principal',
  })
  await user.click(
    within(navegacion).getByRole('link', { name: 'Productos' }),
  )

  expect(
    screen.getByRole('heading', { name: 'Catálogo de productos' }),
  ).toBeInTheDocument()

  await user.type(screen.getByLabelText('Buscar productos'), 'Nexgard')
  await user.click(
    await screen.findByRole('button', { name: 'Agregar al carrito' }),
  )

  await user.click(
    screen.getByRole('link', { name: 'Carrito, 1 productos' }),
  )

  expect(
    screen.getByRole('heading', { name: 'Carrito de productos' }),
  ).toBeInTheDocument()
  expect(screen.getByText('Unidades: 1')).toBeInTheDocument()
})

it('completa una compra y deja el carrito vacío', async () => {
  const user = userEvent.setup()
  renderAt('/productos')

  await user.type(
    await screen.findByLabelText('Buscar productos'),
    'Nexgard',
  )
  await user.click(
    await screen.findByRole('button', { name: 'Agregar al carrito' }),
  )
  await user.click(screen.getByRole('link', { name: 'Carrito, 1 productos' }))
  await user.click(screen.getByRole('link', { name: 'Continuar a compra' }))

  await user.type(
    screen.getByLabelText('Nombre completo'),
    'Patricio Espinoza',
  )
  await user.type(
    screen.getByLabelText('Correo electrónico'),
    'patricio@gmail.com',
  )
  await user.selectOptions(
    screen.getByLabelText('Método de entrega'),
    'retiro',
  )
  await user.click(
    screen.getByRole('button', { name: 'Confirmar compra simulada' }),
  )

  expect(
    await screen.findByRole('heading', { name: '¡Pedido registrado!' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'Carrito, 0 productos' }),
  ).toBeInTheDocument()
})

it('envía al login si se intenta abrir citas sin sesión', async () => {
  renderAt('/citas')

  expect(
    await screen.findByRole('heading', { name: 'Iniciar sesión' }),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('heading', { name: 'Citas Veterinarias' }),
  ).not.toBeInTheDocument()
})

it('activa la sesión real después del registro', async () => {
  const usuario = {
    id: 12,
    nombre: 'Camila',
    apellidos: 'Soto',
    email: 'camila@example.test',
    rol: 'CLIENTE',
    activo: true,
  }
  vi.mocked(register).mockResolvedValue(usuario)
  vi.mocked(login).mockResolvedValue({
    accessToken: 'jwt-de-prueba',
    expiresIn: 900,
    usuario,
  })

  const user = userEvent.setup()
  renderAt('/registro')

  await user.type(screen.getByLabelText('Nombre'), 'Camila')
  await user.type(screen.getByLabelText('Apellidos'), 'Soto')
  await user.type(screen.getByLabelText('RUN'), '18.765.432-7')
  await user.type(
    screen.getByLabelText('Correo electrónico'),
    'camila@example.test',
  )
  await user.type(
    screen.getByLabelText('Teléfono de contacto'),
    '+56912345678',
  )
  await user.type(screen.getByLabelText('Contraseña'), 'clave12345')
  await user.type(
    screen.getByLabelText('Confirmar contraseña'),
    'clave12345',
  )
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

  expect(register).toHaveBeenCalledOnce()
  expect(
    await screen.findByRole('heading', { name: 'Mi cuenta' }),
  ).toBeInTheDocument()

  await user.click(screen.getByRole('link', { name: 'Mis mascotas' }))
  await user.click(
    await screen.findByRole('link', { name: '+ Agregar mascota' }),
  )

  expect(
    screen.getByRole('heading', { name: 'Registrar Mascota' }),
  ).toBeInTheDocument()
  expect(localStorage.getItem('currentUserId')).toBeNull()
})

it('recupera la sesión y permite cerrarla', async () => {
  const usuario = {
    id: 5,
    nombre: 'Recepción',
    email: 'recepcion.prueba@example.test',
    rol: 'RECEPCION',
    activo: true,
  }
  vi.mocked(refreshSession).mockResolvedValue({
    accessToken: 'jwt-renovado',
    usuario,
  })
  vi.mocked(getMe).mockResolvedValue(usuario)
  vi.mocked(logout).mockResolvedValue(null)

  const user = userEvent.setup()
  renderAt('/recepcion')

  expect(
    await screen.findByRole('heading', { name: 'Panel de recepción' }),
  ).toBeInTheDocument()
  expect(refreshSession).toHaveBeenCalled()
  expect(getMe).toHaveBeenCalled()

  await user.click(screen.getByRole('button', { name: 'Salir' }))

  expect(logout).toHaveBeenCalled()
  expect(
    await screen.findByRole('heading', { name: 'Iniciar sesión' }),
  ).toBeInTheDocument()
})

it('permite abrir un consejo y volver a la lista', async () => {
  const user = userEvent.setup()
  renderAt('/')

  const navegacion = screen.getByRole('navigation', {
    name: 'Navegación principal',
  })
  await user.click(
    within(navegacion).getByRole('link', { name: 'Consejos' }),
  )

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
  renderAt('/consejos/no-existe')

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