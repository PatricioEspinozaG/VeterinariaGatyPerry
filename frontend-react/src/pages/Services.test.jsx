import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Services from './Services.jsx'

describe('Services', () => {
  it('filtra los servicios por categoría', async () => {
    const user = userEvent.setup()
    render(<Services />)

    expect(screen.getByText('Consulta general')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Categoría'), 'Vacunación')

    expect(screen.getByText('Vacuna antirrábica canina')).toBeInTheDocument()
    expect(screen.queryByText('Consulta general')).not.toBeInTheDocument()
  })

  it('muestra un mensaje si la búsqueda no tiene resultados', async () => {
    const user = userEvent.setup()
    render(<Services />)

    await user.type(screen.getByLabelText('Buscar servicio'), 'servicio-inexistente-xyz')

    expect(screen.getByText('No se encontraron servicios con esos filtros.')).toBeInTheDocument()
  })
})