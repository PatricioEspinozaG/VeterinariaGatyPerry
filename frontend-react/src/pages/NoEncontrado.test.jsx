import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import NoEncontrado from './NoEncontrado.jsx'

it('muestra el aviso y el enlace para volver al inicio', () => {
  render(
    <MemoryRouter>
      <NoEncontrado />
    </MemoryRouter>,
  )

  expect(
    screen.getByRole('heading', { name: '¡Ups! No encontramos esta página' }),
  ).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Volver al inicio' }))
    .toHaveAttribute('href', '/')
})