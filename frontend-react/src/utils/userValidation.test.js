import { expect, it } from 'vitest'
import { validateEmail, validateUser } from './userValidation.js'

it('acepta correos válidos de cualquier dominio', () => {
  expect(validateEmail('recepcion@example.test')).toBe('')
  expect(validateEmail('contacto@veterinaria.cl')).toBe('')
  expect(validateEmail('  usuario@gmail.com  ')).toBe('')
})

it('rechaza correos vacíos o con formato inválido', () => {
  expect(validateEmail('')).toBe('El correo es obligatorio.')
  expect(validateEmail('usuario@')).toBe('Ingresa un correo electrónico válido.')
  expect(validateEmail('usuario @ejemplo.cl')).toBe('Ingresa un correo electrónico válido.')
})

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
