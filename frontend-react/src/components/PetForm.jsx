import { useState } from 'react'
import { useNavigate } from 'react-router'
import { createMyPet } from '../services/petsApi.js'

export default function PetForm({ returnTo = '/' }) {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nombre: '',
    especie: 'Perro',
    raza: '',
    edad: '',
    sexo: 'Macho',
    notas: '',
  })
  const [errors, setErrors] = useState({})
  const [mensaje, setMensaje] = useState(null)
  const [saving, setSaving] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => ({ ...previous, [name]: '' }))
  }

  function validate() {
    const nextErrors = {}

    if (!formData.nombre.trim() || formData.nombre.trim().length > 30) {
      nextErrors.nombre = 'Nombre obligatorio (máximo 30 caracteres).'
    }
    if (!formData.especie) {
      nextErrors.especie = 'Selecciona una especie.'
    }
    if (!formData.raza.trim() || formData.raza.trim().length > 30) {
      nextErrors.raza = 'Raza obligatoria (máximo 30 caracteres).'
    }
    if (formData.edad === '' || !Number.isInteger(Number(formData.edad)) ||
        Number(formData.edad) < 0 || Number(formData.edad) > 30) {
      nextErrors.edad = 'Ingresa una edad válida entre 0 y 30 años.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMensaje(null)
    if (saving || !validate()) return

    setSaving(true)

    try {
      await createMyPet({
        nombre: formData.nombre.trim(),
        especie: formData.especie,
        raza: formData.raza.trim(),
        edad: Number(formData.edad),
        sexo: formData.sexo,
        notas: formData.notas.trim(),
      })

      setMensaje({ tipo: 'success', texto: '¡Mascota registrada exitosamente!' })
      window.setTimeout(() => navigate(returnTo), 1200)
    } catch (error) {
      setMensaje({
        tipo: 'danger',
        texto: error.message || 'No pudimos registrar la mascota.',
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
                  🐾 REGISTRO DE MASCOTA
                </span>
                <h1 className="h3 fw-bold mt-3 mb-1 text-dark">Registrar Mascota</h1>
                <p className="text-muted small">Ingresa la información de tu mascota para agendar atenciones.</p>
              </div>

              {mensaje && (
                <div className={`alert alert-${mensaje.tipo} rounded-3 text-center`} role="alert">
                  {mensaje.texto}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-12 col-md-6 text-start">
                    <label htmlFor="nombre" className="form-label fw-medium text-dark small">Nombre de la mascota</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      className={`form-control rounded-3 ${errors.nombre ? 'is-invalid' : ''}`}
                      placeholder="Ej. Firulais"
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                    {errors.nombre && <div className="invalid-feedback d-block">{errors.nombre}</div>}
                  </div>

                  <div className="col-12 col-md-6 text-start">
                    <label htmlFor="especie" className="form-label fw-medium text-dark small">Especie</label>
                    <select
                      id="especie"
                      name="especie"
                      className={`form-select rounded-3 ${errors.especie ? 'is-invalid' : ''}`}
                      value={formData.especie}
                      onChange={handleChange}
                    >
                      <option value="Perro">Perro</option>
                      <option value="Gato">Gato</option>
                      <option value="Ave">Ave</option>
                      <option value="Exótico">Exótico / Otro</option>
                    </select>
                    {errors.especie && <div className="invalid-feedback d-block">{errors.especie}</div>}
                  </div>

                  <div className="col-12 col-md-6 text-start">
                    <label htmlFor="raza" className="form-label fw-medium text-dark small">Raza</label>
                    <input
                      type="text"
                      id="raza"
                      name="raza"
                      className={`form-control rounded-3 ${errors.raza ? 'is-invalid' : ''}`}
                      placeholder="Ej. Poodle, Mestizo, Siamés"
                      value={formData.raza}
                      onChange={handleChange}
                    />
                    {errors.raza && <div className="invalid-feedback d-block">{errors.raza}</div>}
                  </div>

                  <div className="col-12 col-md-6 text-start">
                    <label htmlFor="edad" className="form-label fw-medium text-dark small">Edad (años)</label>
                    <input
                      type="number"
                      id="edad"
                      name="edad"
                      className={`form-control rounded-3 ${errors.edad ? 'is-invalid' : ''}`}
                      placeholder="Ej. 3"
                      min="0"
                      max="30"
                      value={formData.edad}
                      onChange={handleChange}
                    />
                    {errors.edad && <div className="invalid-feedback d-block">{errors.edad}</div>}
                  </div>

                  <div className="col-md-6 text-start">
                    <label htmlFor="sexo" className="form-label fw-medium text-dark small">Sexo</label>
                    <select
                      id="sexo"
                      name="sexo"
                      className="form-select rounded-3"
                      value={formData.sexo}
                      onChange={handleChange}
                    >
                      <option value="Macho">Macho</option>
                      <option value="Hembra">Hembra</option>
                    </select>
                  </div>

                  <div className="col-12 text-start">
                    <label htmlFor="notas" className="form-label fw-medium text-dark small">Observaciones o Alergias (Opcional)</label>
                    <textarea
                      id="notas"
                      name="notas"
                      rows="2"
                      className="form-control rounded-3"
                      placeholder="Ej. Alérgico a la penicilina..."
                      value={formData.notas}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 text-center mt-4">
                    <button
                      className="btn btn-registro-custom btn-lg px-5 py-2 rounded-pill fw-semibold shadow-sm fs-6"
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? 'Guardando...' : 'Guardar Mascota'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}