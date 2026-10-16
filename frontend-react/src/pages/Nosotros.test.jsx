import { expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Nosotros from './Nosotros.jsx'

it('muestra la información de la clínica y del equipo', () => {
  render(<Nosotros />)

  expect(screen.getByRole('heading', { name: 'Gaty Perry' }))
    .toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Misión' }))
    .toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Visión' }))
    .toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'Equipo veterinario junto a mascotas' }))
    .toBeInTheDocument()
})