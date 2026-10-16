import { expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import AppointmentsList from './AppointmentsList.jsx'
import { render, screen, fireEvent } from '@testing-library/react'

it('permite al dueño cancelar su cita y guarda el nuevo estado', async () => {
  localStorage.setItem('appointments', JSON.stringify([
    {
      id: 'cita-1',
      userId: 1,
      petName: 'Michi',
      servicio: 'Consulta General',
      fecha: '2026-10-20',
      hora: '10:00',
      estado: 'Pendiente',
    },
    {
      id: 'cita-2',
      userId: 'usuario-2',
      petName: 'Luna',
      servicio: 'Vacunación',
      fecha: '2026-10-21',
      hora: '11:00',
      estado: 'Pendiente',
    },
  ]))

  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AppointmentsList userRole="cliente" currentUserId="1" />
    </MemoryRouter>,
  )

  expect(screen.getByText('Michi')).toBeInTheDocument()
  expect(screen.queryByText('Luna')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Cancelar cita' }))
  expect(screen.getByRole('alertdialog')).toHaveTextContent('¿Quieres cancelar la cita de “Michi”?')
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-outline-secondary'))
  expect(JSON.parse(localStorage.getItem('appointments'))[0].estado).toBe('Pendiente')

  await user.click(screen.getByRole('button', { name: 'Cancelar cita' }))
  await user.click(screen.getByRole('button', { name: 'Sí, cancelar cita' }))

  const citasGuardadas = JSON.parse(localStorage.getItem('appointments'))
  expect(citasGuardadas[0].estado).toBe('Cancelada')
  expect(citasGuardadas[1].estado).toBe('Pendiente')
})

it('abre la edición administrativa de una cita en un overlay', async () => {
  localStorage.setItem('appointments', JSON.stringify([
    {
      id: 'cita-editar',
      userId: 'cliente-1',
      petName: 'Luna',
      servicio: 'Consulta general',
      fecha: '2026-10-20',
      hora: '10:00',
      estado: 'Pendiente',
      motivo: 'Control anual',
    },
  ]))

  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AppointmentsList
        userRole="admin"
        adminMode
        users={[{ id: 'cliente-1', name: 'Cliente', lastName: 'Demo', role: 'cliente', active: true }]}
      />
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Editar' }))

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Editar cita' })).toBeInTheDocument()
  expect(screen.getByDisplayValue('Luna')).toBeInTheDocument()
})

it('conserva la cita cuando se cancela la confirmación de eliminación', async () => {
  localStorage.setItem('appointments', JSON.stringify([
    {
      id: 'cita-no-eliminar',
      userId: 'cliente-1',
      petName: 'Luna',
      servicio: 'Consulta general',
      fecha: '2026-10-20',
      hora: '10:00',
      estado: 'Pendiente',
    },
  ]))

  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AppointmentsList
        userRole="admin"
        adminMode
        users={[{ id: 'cliente-1', name: 'Cliente', lastName: 'Demo', role: 'cliente', active: true }]}
      />
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Eliminar' }))
  expect(screen.getByRole('alertdialog')).toHaveTextContent('¿Eliminar la cita de “Luna”?')
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-outline-secondary'))

  expect(screen.getByText('Luna')).toBeInTheDocument()
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem('appointments'))).toHaveLength(1)
})

it('elimina una cita al confirmar desde el diálogo de la página', async () => {
  localStorage.setItem('appointments', JSON.stringify([
    {
      id: 'cita-eliminar',
      userId: 'cliente-1',
      petName: 'Luna',
      servicio: 'Consulta general',
      fecha: '2026-10-20',
      hora: '10:00',
      estado: 'Pendiente',
    },
  ]))

  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AppointmentsList
        userRole="admin"
        adminMode
        users={[{ id: 'cliente-1', name: 'Cliente', lastName: 'Demo', role: 'cliente', active: true }]}
      />
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Eliminar' }))
  await user.click(screen.getByRole('alertdialog').querySelector('button.btn-delete'))

  expect(screen.queryByText('Luna')).not.toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem('appointments'))).toEqual([])
})

it('permite a administración confirmar una cita y guarda el cambio', async () => {
  localStorage.setItem('appointments', JSON.stringify([
    {
      id: 'cita-admin-1',
      userId: 'usuario-2',
      petName: 'Luna',
      servicio: 'Vacunación',
      fecha: '2026-10-21',
      hora: '11:00',
      estado: 'Pendiente',
    },
  ]))

  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AppointmentsList userRole="admin" currentUserId="admin-1" />
    </MemoryRouter>,
  )

  expect(screen.getByText('Luna')).toBeInTheDocument()

  await user.selectOptions(screen.getByDisplayValue('Pendiente'), 'Confirmada')

  expect(screen.getByText('Confirmada')).toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem('appointments'))[0].estado)
    .toBe('Confirmada')
  
    await user.selectOptions(screen.getByLabelText('Filtrar por estado:'), 'Cancelada')

  expect(screen.getByText('No hay citas registradas en esta categoría.'))
    .toBeInTheDocument()
  expect(screen.queryByText('Luna')).not.toBeInTheDocument()
})

it('permite a administración crear una cita nueva', async () => {
  localStorage.setItem('appointments', JSON.stringify([]))

  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AppointmentsList
        userRole="admin"
        adminMode
        users={[{
          id: 'cliente-1',
          name: 'Cliente',
          lastName: 'Demo',
          email: 'cliente@gmail.com',
          role: 'cliente',
          active: true,
        }]}
      />
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Agregar cita' }))
  await user.selectOptions(screen.getByLabelText('Cliente'), 'cliente-1')
  await user.type(screen.getByLabelText('Mascota'), 'Nina')
  await user.type(screen.getByLabelText('Fecha'), '2099-05-20')
  await user.selectOptions(screen.getByLabelText('Hora'), '10:00')
  await user.type(screen.getByLabelText('Motivo'), 'Vacunación anual')
  await user.click(screen.getByRole('button', { name: 'Crear cita' }))

  expect(screen.getByText('Nina')).toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem('appointments'))[0]).toEqual(
    expect.objectContaining({
      userId: 'cliente-1',
      petName: 'Nina',
      estado: 'Pendiente',
      motivo: 'Vacunación anual',
    }),
  )
})

it('permite crear una cita y la guarda en localStorage', async () => {
  localStorage.setItem('appointments', JSON.stringify([]))

  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AppointmentsList
        userRole="admin"
        adminMode
        users={[
          {
            id: 'cliente-1',
            name: 'Cliente',
            lastName: 'Demo',
            email: 'cliente@example.com',
            role: 'cliente',
            active: true,
          },
        ]}
        initialAppointments={[]}
      />
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Agregar cita' }))
  await user.selectOptions(screen.getByLabelText('Cliente'), 'cliente-1')
  await user.type(screen.getByLabelText('Mascota'), 'Michi')
  fireEvent.change(screen.getByLabelText('Fecha'), {
    target: { value: new Date().toISOString().slice(0, 10) },
  })
  await user.selectOptions(screen.getByLabelText('Hora'), '10:00')
  await user.type(screen.getByLabelText('Motivo'), 'Control anual')
  await user.click(screen.getByRole('button', { name: 'Crear cita' }))

  expect(await screen.findByText('Michi')).toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem('appointments'))[0]).toMatchObject({
    userId: 'cliente-1',
    petName: 'Michi',
    hora: '10:00',
    motivo: 'Control anual',
    estado: 'Pendiente',
  })
})

it('rechaza crear una cita con fecha anterior a hoy', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <AppointmentsList
        userRole="admin"
        adminMode
        users={[
          {
            id: 'cliente-1',
            name: 'Cliente',
            lastName: 'Demo',
            email: 'cliente@example.com',
            role: 'cliente',
            active: true,
          },
        ]}
        initialAppointments={[]}
      />
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Agregar cita' }))
  await user.selectOptions(screen.getByLabelText('Cliente'), 'cliente-1')

  const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  fireEvent.change(screen.getByLabelText('Fecha'), {
    target: { value: ayer },
  })
  fireEvent.submit(screen.getByText('Nueva cita').closest('form'))

  expect(screen.getByRole('alert'))
    .toHaveTextContent('La fecha de la cita no puede ser anterior a hoy.')
})

