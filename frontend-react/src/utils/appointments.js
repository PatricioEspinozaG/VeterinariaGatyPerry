import { readStorage, writeStorage } from '../services/storage.js'
import { services } from '../data/services.js'

export function ensureDemoAppointment(users = []) {
  const appointments = readStorage('appointments', [])
  if (!Array.isArray(appointments) || appointments.length > 0) {
    return { appointments: Array.isArray(appointments) ? appointments : [], error: '' }
  }

  const customer = users.find((user) => user.role === 'cliente' && user.active !== false)
  const date = new Date()
  date.setDate(date.getDate() + 1)
  const appointment = {
    id: 'cita-demo-admin',
    userId: customer?.id || '',
    usuarioNombre: customer ? [customer.name, customer.lastName].filter(Boolean).join(' ') : 'Cliente de ejemplo',
    petName: 'Luna',
    servicio: services[0]?.name || 'Consulta general',
    fecha: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
    hora: '10:00',
    estado: 'Pendiente',
    motivo: 'Cita de ejemplo para pruebas.',
  }

  if (!writeStorage('appointments', [appointment])) {
    return { appointments: [], error: 'No se pudo guardar la cita de ejemplo en este navegador.' }
  }
  return { appointments: [appointment], error: '' }
}
