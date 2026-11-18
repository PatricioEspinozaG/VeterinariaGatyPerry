import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { getMyPets } from '../services/petsApi.js'
import {
  createMyAppointment,
  getAvailableHours,
} from '../services/appointmentsApi.js'

const todayInClinic = () => new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/Santiago',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date())

export default function AppointmentForm({ returnTo = '/' }) {
  const navigate = useNavigate()
  const [mascotas, setMascotas] = useState([])
  const [petsLoading, setPetsLoading] = useState(true)
  const [petsError, setPetsError] = useState('')
  const [availableHours, setAvailableHours] = useState([])
  const [hoursLoading, setHoursLoading] = useState(false)
  const [hoursError, setHoursError] = useState('')
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    mascotaId: '',
    servicio: 'Consulta General',
    fecha: '',
    hora: '',
    motivo: '',
  })
  const [errors, setErrors] = useState({})
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    let active = true

    async function loadPets() {
      try {
        const result = await getMyPets()
        if (active) setMascotas(result)
      } catch (error) {
        if (active) setPetsError(error.message || 'No pudimos cargar tus mascotas.')
      } finally {
        if (active) setPetsLoading(false)
      }
    }

    loadPets()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!formData.fecha) return

    let active = true

    async function loadHours() {
      setHoursLoading(true)
      setHoursError('')

      try {
        const result = await getAvailableHours(formData.fecha)
        if (active) setAvailableHours(result.map((hour) => hour.slice(0, 5)))
      } catch (error) {
        if (active) {
          setAvailableHours([])
          setHoursError(error.message || 'No pudimos consultar los horarios.')
        }
      } finally {
        if (active) setHoursLoading(false)
      }
    }

    loadHours()
    return () => { active = false }
  }, [formData.fecha])

  const selectedPetId = formData.mascotaId || String(mascotas[0]?.id ?? '')

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'fecha' ? { hora: '' } : {}),
    }))
    setErrors((previous) => ({ ...previous, [name]: '' }))

    if (name === 'fecha') {
      setAvailableHours([])
      setHoursError('')
    }
  }

  function validate() {
    const nextErrors = {}

    if (!selectedPetId) nextErrors.mascotaId = 'Debes seleccionar una mascota.'
    if (!formData.servicio) nextErrors.servicio = 'Selecciona un servicio.'

    if (!formData.fecha) {
      nextErrors.fecha = 'Selecciona una fecha.'
    } else if (formData.fecha < todayInClinic()) {
      nextErrors.fecha = 'La fecha no puede ser anterior a hoy.'
    }

    if (!formData.hora || !availableHours.includes(formData.hora)) {
      nextErrors.hora = 'Selecciona una hora disponible.'
    }

    if (!formData.motivo.trim() || formData.motivo.trim().length > 200) {
      nextErrors.motivo = 'Motivo obligatorio (máximo 200 caracteres).'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMensaje(null)
    if (saving || hoursLoading || !validate()) return

    setSaving(true)

    try {
      await createMyAppointment({
        mascotaId: Number(selectedPetId),
        servicio: formData.servicio,
        fecha: formData.fecha,
        hora: formData.hora,
        motivo: formData.motivo.trim(),
      })

      setMensaje({ tipo: 'success', texto: '¡Cita agendada exitosamente!' })
      window.setTimeout(() => navigate(returnTo), 1200)
    } catch (error) {
      setMensaje({
        tipo: 'danger',
        texto: error.message || 'No pudimos agendar la cita.',
      })
      setSaving(false)
    }
  }

  return (
    <div className="bg-vet-doodle min-vh-100 py-5 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow border-0 rounded-4 p-3 p-md-4 bg-white">
              <div className="text-center mb-4">
                <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7">
                  📅 AGENDAR CITA
                </span>
                <h1 className="h3 fw-bold mt-3 mb-1 text-dark">Reserva Veterinaria</h1>
                <p className="text-muted small">Selecciona los datos para programar la atención de tu mascota.</p>
              </div>

              {mensaje && (
                <div className={`alert alert-${mensaje.tipo} rounded-3 text-center`} role="alert">
                  {mensaje.texto}
                </div>
              )}

              {petsLoading ? (
                <p role="status">Cargando mascotas...</p>
              ) : petsError ? (
                <p className="text-danger" role="alert">{petsError}</p>
              ) : mascotas.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">Aún no tienes mascotas registradas para agendar una cita.</p>
                  <button
                    className="btn btn-outline-dark rounded-pill fw-semibold px-4 py-2"
                    type="button"
                    onClick={() => navigate('/mascotas/nueva?returnTo=%2Fcitas%2Fnueva')}
                  >
                    🐾 Registrar Mascota Primero
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="row g-3">
                    <div className="col-12 col-md-6 text-start">
                      <label htmlFor="mascotaId" className="form-label fw-medium text-dark small">Mascota</label>
                      <select
                        id="mascotaId"
                        name="mascotaId"
                        className={`form-select rounded-3 ${errors.mascotaId ? 'is-invalid' : ''}`}
                        value={selectedPetId}
                        onChange={handleChange}
                      >
                        {mascotas.map((pet) => (
                          <option key={pet.id} value={pet.id}>
                            {pet.nombre} ({pet.especie})
                          </option>
                        ))}
                      </select>
                      {errors.mascotaId && <div className="invalid-feedback d-block">{errors.mascotaId}</div>}
                    </div>

                    <div className="col-12 col-md-6 text-start">
                      <label htmlFor="servicio" className="form-label fw-medium text-dark small">Servicio</label>
                      <select
                        id="servicio"
                        name="servicio"
                        className={`form-select rounded-3 ${errors.servicio ? 'is-invalid' : ''}`}
                        value={formData.servicio}
                        onChange={handleChange}
                      >
                        <option value="Consulta General">Consulta General</option>
                        <option value="Vacunación">Vacunación</option>
                        <option value="Desparasitación">Desparasitación</option>
                        <option value="Control">Control Médico</option>
                        <option value="Urgencia">Urgencia</option>
                      </select>
                      {errors.servicio && <div className="invalid-feedback d-block">{errors.servicio}</div>}
                    </div>

                    <div className="col-12 col-md-6 text-start">
                      <label htmlFor="fecha" className="form-label fw-medium text-dark small">Fecha</label>
                      <input
                        type="date"
                        id="fecha"
                        name="fecha"
                        min={todayInClinic()}
                        className={`form-control rounded-3 ${errors.fecha ? 'is-invalid' : ''}`}
                        value={formData.fecha}
                        onChange={handleChange}
                      />
                      {errors.fecha && <div className="invalid-feedback d-block">{errors.fecha}</div>}
                    </div>

                    <div className="col-12 col-md-6 text-start">
                      <label htmlFor="hora" className="form-label fw-medium text-dark small">Hora</label>
                      <select
                        id="hora"
                        name="hora"
                        className={`form-select rounded-3 ${errors.hora ? 'is-invalid' : ''}`}
                        value={formData.hora}
                        onChange={handleChange}
                        disabled={!formData.fecha || hoursLoading || Boolean(hoursError)}
                      >
                        <option value="">
                          {hoursLoading ? 'Consultando horarios...' : 'Selecciona una hora'}
                        </option>
                        {availableHours.map((hour) => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                      {errors.hora && <div className="invalid-feedback d-block">{errors.hora}</div>}
                      {hoursError && <p className="text-danger small mt-2" role="alert">{hoursError}</p>}
                      {formData.fecha && !hoursLoading && !hoursError && availableHours.length === 0 && (
                        <p className="text-muted small mt-2">No hay horarios disponibles para esta fecha.</p>
                      )}
                    </div>

                    <div className="col-12 text-start">
                      <label htmlFor="motivo" className="form-label fw-medium text-dark small">Motivo de la consulta</label>
                      <textarea
                        id="motivo"
                        name="motivo"
                        rows="3"
                        className={`form-control rounded-3 ${errors.motivo ? 'is-invalid' : ''}`}
                        placeholder="Describe brevemente el motivo de la atención..."
                        value={formData.motivo}
                        onChange={handleChange}
                      />
                      {errors.motivo && <div className="invalid-feedback d-block">{errors.motivo}</div>}
                    </div>

                    <div className="col-12 text-center mt-4">
                      <button
                        className="btn btn-registro-custom btn-lg px-5 py-2 rounded-pill fw-semibold shadow-sm fs-6"
                        type="submit"
                        disabled={saving || hoursLoading}
                      >
                        {saving ? 'Agendando...' : 'Confirmar Cita'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}