import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import {
  annulClinicalAttention,
  annulClinicalVaccine,
  createClinicalAttention,
  createClinicalVaccine,
  getClinicalAttention,
  getClinicalVaccine,
  listPetClinicalHistory,
  updateClinicalAttention,
  updateClinicalVaccine,
} from '../services/clinica.js'
import { listAppointmentClients } from '../services/clientes.js'
import { listManagedPets } from '../services/mascotas.js'
import AdminClinicalPanel from './AdminClinicalPanel.jsx'

vi.mock('../services/clinica.js', () => ({
  annulClinicalAttention: vi.fn(),
  annulClinicalVaccine: vi.fn(),
  createClinicalAttention: vi.fn(),
  createClinicalVaccine: vi.fn(),
  getClinicalAttention: vi.fn(),
  getClinicalVaccine: vi.fn(),
  listPetClinicalHistory: vi.fn(),
  updateClinicalAttention: vi.fn(),
  updateClinicalVaccine: vi.fn(),
}))
vi.mock('../services/clientes.js', () => ({
  listAppointmentClients: vi.fn(),
}))
vi.mock('../services/mascotas.js', () => ({
  listManagedPets: vi.fn(),
}))

const client = {
  id: 7,
  nombre: 'Camila',
  apellidos: 'Soto',
  email: 'camila@example.com',
}
const pet = { id: 10, nombre: 'Luna' }

beforeEach(() => {
  vi.clearAllMocks()
  listAppointmentClients.mockResolvedValue([client])
  listManagedPets.mockResolvedValue([pet])
  listPetClinicalHistory.mockResolvedValue({
    mascotaId: pet.id,
    limite: 50,
    registros: [],
  })
  createClinicalAttention.mockResolvedValue({ id: 20 })
  createClinicalVaccine.mockResolvedValue({ id: 30 })
  getClinicalAttention.mockResolvedValue({
    id: 20,
    mascotaId: pet.id,
    fechaAtencion: '2026-10-12T10:00:00',
    motivo: 'Control',
    diagnostico: 'Dermatitis',
    tratamiento: 'Crema',
    observaciones: 'Revisar en dos semanas',
    profesionalResponsable: 'Dra. Admin',
    version: 3,
  })
  getClinicalVaccine.mockResolvedValue({
    id: 30,
    mascotaId: pet.id,
    nombreVacuna: 'Antirrábica',
    fechaAplicacion: '2026-10-12',
    profesionalResponsable: 'Dra. Admin',
    lote: 'L-10',
    observaciones: '',
    proximaDosis: '2027-10-12',
    version: 2,
  })
  updateClinicalAttention.mockResolvedValue({ id: 20 })
  updateClinicalVaccine.mockResolvedValue({ id: 30 })
  annulClinicalAttention.mockResolvedValue({ id: 20 })
  annulClinicalVaccine.mockResolvedValue({ id: 30 })
})

function renderPanel() {
  return render(
    <MemoryRouter initialEntries={['/admin/clinica']}>
      <AdminClinicalPanel
        currentUser={{ id: '1', name: 'Dra. Admin', role: 'admin' }}
      />
    </MemoryRouter>,
  )
}

it('registra una atención con la mascota seleccionada', async () => {
  const user = userEvent.setup()
  renderPanel()

  await user.click(await screen.findByRole('button', { name: 'Registrar atención' }))
  await user.type(screen.getByLabelText('Motivo'), 'Control general')
  await user.type(screen.getByLabelText('Diagnóstico'), 'Sin hallazgos')
  await user.click(screen.getByRole('button', { name: 'Guardar atención' }))

  await waitFor(() => expect(createClinicalAttention).toHaveBeenCalledWith(
    expect.objectContaining({
      mascotaId: 10,
      citaId: null,
      motivo: 'Control general',
      diagnostico: 'Sin hallazgos',
      profesionalResponsable: 'Dra. Admin',
    }),
  ))
  expect(await screen.findByText('Atención registrada correctamente.'))
    .toBeInTheDocument()
})

it('edita una atención conservando la versión del backend', async () => {
  const user = userEvent.setup()
  listPetClinicalHistory.mockResolvedValueOnce({
    mascotaId: pet.id,
    limite: 50,
    registros: [{
      id: 20,
      tipo: 'ATENCION',
      fecha: '2026-10-12T10:00:00',
      estado: 'ACTIVA',
      motivo: 'Control',
      diagnostico: 'Dermatitis',
      profesionalResponsable: 'Dra. Admin',
    }],
  })
  renderPanel()

  await user.click(await screen.findByRole('button', { name: 'Editar' }))
  await user.clear(await screen.findByLabelText('Diagnóstico'))
  await user.type(screen.getByLabelText('Diagnóstico'), 'Dermatitis leve')
  await user.click(screen.getByRole('button', { name: 'Guardar atención' }))

  await waitFor(() => expect(updateClinicalAttention).toHaveBeenCalledWith(
    20,
    expect.objectContaining({
      version: 3,
      diagnostico: 'Dermatitis leve',
    }),
  ))
})

it('anula una vacuna con motivo y versión obtenida del backend', async () => {
  const user = userEvent.setup()
  listPetClinicalHistory.mockResolvedValueOnce({
    mascotaId: pet.id,
    limite: 50,
    registros: [{
      id: 30,
      tipo: 'VACUNA',
      fecha: '2026-10-12T00:00:00',
      estado: 'ACTIVA',
      nombreVacuna: 'Antirrábica',
      profesionalResponsable: 'Dra. Admin',
    }],
  })
  renderPanel()

  await user.click(await screen.findByRole('button', { name: 'Anular' }))
  await user.type(await screen.findByLabelText('Motivo de anulación'), 'Registro duplicado')
  await user.click(screen.getByRole('button', { name: 'Confirmar anulación' }))

  await waitFor(() => expect(annulClinicalVaccine).toHaveBeenCalledWith(
    30,
    { motivo: 'Registro duplicado', version: 2 },
  ))
})

it('registra una vacuna para la mascota seleccionada', async () => {
  const user = userEvent.setup()
  renderPanel()

  await user.click(await screen.findByRole('button', { name: 'Registrar vacuna' }))
  await user.type(screen.getByLabelText('Nombre de la vacuna'), 'Triple felina')
  await user.click(screen.getByRole('button', { name: 'Guardar vacuna' }))

  await waitFor(() => expect(createClinicalVaccine).toHaveBeenCalledWith(
    expect.objectContaining({
      mascotaId: 10,
      nombreVacuna: 'Triple felina',
      profesionalResponsable: 'Dra. Admin',
      atencionId: null,
    }),
  ))
})
