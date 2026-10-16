import { expect, it } from 'vitest'
import { validateUser } from './userValidation.js'

it('rechaza un correo que ya pertenece a otra cuenta', () => {
  const formulario = {
    run: '12.345.678-5',
    email: 'cliente@gmail.com',
    password: 'clave1234',
    confirmPassword: 'clave1234',
    telefono: '912345678',
    nombre: 'Patricio',
    apellidos: 'Espinoza',
    region: 'Valparaíso',
    comuna: 'Viña del Mar',
  }
  const usuarios = [{ email: 'CLIENTE@GMAIL.COM', run: 'otro-run' }]

  const errores = validateUser(formulario, usuarios)

  expect(errores.general).toBe(
    'Ya existe una cuenta registrada con este correo o RUN.',
  )
})