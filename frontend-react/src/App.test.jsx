import { expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from './App.jsx'

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
    screen.getByRole('heading', { name: 'Catálogo de productos' }),
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

it('completa una compra y deja el carrito vacío', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/productos']}>
      <App />
    </MemoryRouter>,
  )

  await user.type(screen.getByLabelText('Buscar productos'), 'Nexgard')
  await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
  await user.click(screen.getByRole('link', { name: 'Carrito, 1 productos' }))
  await user.click(screen.getByRole('link', { name: 'Continuar a compra' }))

  await user.type(screen.getByLabelText('Nombre completo'), 'Patricio Espinoza')
  await user.type(screen.getByLabelText('Correo electrónico'), 'patricio@gmail.com')
  await user.selectOptions(screen.getByLabelText('Método de entrega'), 'retiro')
  await user.click(screen.getByRole('button', { name: 'Confirmar compra simulada' }))

  expect(
    await screen.findByRole('heading', { name: '¡Pedido registrado!' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'Carrito, 0 productos' }),
  ).toBeInTheDocument()
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

  const enlaceMascota = await screen.findByRole('link', { name: '+ Mascota' })
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

