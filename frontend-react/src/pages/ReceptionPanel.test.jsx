import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import ReceptionPanel from './ReceptionPanel.jsx'

it('no muestra el panel a una cuenta que no es de recepción', () => {
  render(
    <MemoryRouter initialEntries={['/recepcion']}>
      <ReceptionPanel currentUser={{ id: 'c1', role: 'cliente' }} />
    </MemoryRouter>,
  )

  expect(
    screen.queryByRole('heading', { name: 'Panel de recepción' }),
  ).not.toBeInTheDocument()
})

it('permite a recepción cambiar el estado de una cita', async () => {
  localStorage.setItem(
    'appointments',
    JSON.stringify([{
      id: 'cita-1',
      userId: 'c1',
      petName: 'Michi',
      servicio: 'Consulta General',
      fecha: '2099-05-20',
      hora: '10:00',
      estado: 'Pendiente',
      motivo: 'Control general',
    }]),
  )

  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/recepcion']}>
      <ReceptionPanel
        currentUser={{ id: 'r1', name: 'Recepción', role: 'recepcion' }}
        users={[{
          id: 'c1',
          name: 'Cliente',
          role: 'cliente',
          active: true,
        }]}
      />
    </MemoryRouter>,
  )

  await user.click(screen.getByRole('button', { name: 'Editar' }))
  await user.selectOptions(screen.getByLabelText('Estado'), 'Confirmada')
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

  expect(JSON.parse(localStorage.getItem('appointments'))[0].estado)
    .toBe('Confirmada')
})