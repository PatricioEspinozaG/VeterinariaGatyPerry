import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import Checkout from './Checkout.jsx'

it('permite confirmar una compra con retiro en clínica', async () => {
  const user = userEvent.setup()
  const onCompletePurchase = vi.fn().mockResolvedValue({ id: 'pedido-1' })

  render(
    <MemoryRouter initialEntries={['/checkout']}>
      <Routes>
        <Route
          path="/checkout"
          element={
            <Checkout
              products={[{
                code: 'ME001',
                name: 'Amoxibay',
                stock: 3,
                price: 4200,
              }]}
              cart={[{ code: 'ME001', quantity: 1 }]}
              currentUser={null}
              onCompletePurchase={onCompletePurchase}
            />
          }
        />
        <Route path="/compra/:id" element={<h1>Compra completada</h1>} />
      </Routes>
    </MemoryRouter>,
  )

  await user.type(screen.getByLabelText('Nombre completo'), 'Patricio Espinoza')
  await user.type(screen.getByLabelText('Correo electrónico'), 'patricio@gmail.com')
  await user.selectOptions(screen.getByLabelText('Método de entrega'), 'retiro')

  expect(screen.queryByLabelText('Región')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

  expect(onCompletePurchase).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'Patricio Espinoza',
      email: 'patricio@gmail.com',
      method: 'retiro',
      region: '',
      commune: '',
      address: '',
    }),
    expect.stringMatching(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ),
  )
  expect(
    await screen.findByRole('heading', { name: 'Compra completada' }),
  ).toBeInTheDocument()
})

it('muestra el motivo cuando la compra es rechazada', async () => {
  const user = userEvent.setup()
  const onCompletePurchase = vi.fn().mockRejectedValue(
    new Error('El stock cambió. Revisa tu carrito.'),
  )

  render(
    <MemoryRouter>
      <Checkout
        products={[{
          code: 'ME001',
          name: 'Amoxibay',
          stock: 3,
          price: 4200,
        }]}
        cart={[{ code: 'ME001', quantity: 1 }]}
        currentUser={{ nombre: 'Patricio', email: 'patricio@gmail.com' }}
        onCompletePurchase={onCompletePurchase}
      />
    </MemoryRouter>,
  )

  await user.selectOptions(screen.getByLabelText('Método de entrega'), 'retiro')
  await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }))

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'El stock cambió. Revisa tu carrito.',
  )
})

