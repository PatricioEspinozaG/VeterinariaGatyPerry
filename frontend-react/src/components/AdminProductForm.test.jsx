import { expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import AdminProductForm from './AdminProductForm.jsx'

it('crea un producto con precio y stock numéricos', () => {
  const onCreate = vi.fn()
  render(<AdminProductForm onCreate={onCreate} />)

  fireEvent.change(screen.getByLabelText('Nombre'), {
    target: { value: 'Producto demo' },
  })
  fireEvent.change(screen.getByLabelText('Precio'), {
    target: { value: '1000' },
  })
  fireEvent.change(screen.getByLabelText('Stock'), {
    target: { value: '2' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Crear' }))

  expect(onCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'Producto demo',
      price: 1000,
      stock: 2,
    }),
  )
})

it('actualiza un producto conservando su código', () => {
  const onUpdate = vi.fn()
  render(
    <AdminProductForm
      product={{
        code: 'ME001',
        name: 'Producto demo',
        category: 'Medicamento',
        price: 500,
        stock: 3,
      }}
      onUpdate={onUpdate}
    />,
  )

  fireEvent.change(screen.getByLabelText('Precio'), {
    target: { value: '800' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

  expect(onUpdate).toHaveBeenCalledWith(
    'ME001',
    expect.objectContaining({ price: 800, stock: 3 }),
  )
})