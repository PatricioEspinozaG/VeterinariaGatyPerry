import { useEffect, useState } from 'react'
import { createClinicalVisit, hasClinicalVisitForAppointment } from '../services/clinicApi.js'

function getLocalDateTime() {
  const now = new Date()
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)

  return localDate.toISOString().slice(0, 16)
}

export default function ClinicalVisitForm({ appointment }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [checking, setChecking] = useState(true)
  const [checkError, setCheckError] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fechaAtencion: getLocalDateTime(),
    motivo: appointment.motivo || appointment.servicio || '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
    profesionalResponsable: '',
  })

  useEffect(() => {
    let active = true

    hasClinicalVisitForAppointment(appointment.id)
      .then((registered) => {
        if (active) setSaved(registered)
      })
      .catch(() => {
        if (active) setCheckError('No pudimos comprobar si ya existe una atención. Recarga la página.')
      })
      .finally(() => {
        if (active) setChecking(false)
      })

    return () => { active = false }
  }, [appointment.id])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      await createClinicalVisit({
        mascotaId: appointment.mascotaId,
        citaId: appointment.id,
        ...form,
      })
      setSaved(true)
      setOpen(false)
    } catch (cause) {
      setError(cause.message || 'No pudimos registrar la atención.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {checking ? (
        <span role="status">Comprobando atención...</span>
      ) : checkError ? (
        <span className="text-danger" role="alert">{checkError}</span>
      ) : saved ? (
        <span className="badge bg-success text-white">
          Atención registrada
        </span>
      ) : (
        <button
          className="btn btn-outline-secondary rounded-pill px-3"
          type="button"
          onClick={() => {
            setError('')
            setOpen(true)
          }}
        >
          Registrar atención
        </button>
      )}

      {open && (
        <div className="overlay" role="presentation">
          <section
            className="overlay-panel admin-edit-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`clinical-visit-title-${appointment.id}`}
          >
            <button
              className="overlay-close"
              type="button"
              aria-label="Cerrar formulario"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              ×
            </button>

            <h2
              id={`clinical-visit-title-${appointment.id}`}
              className="h4 fw-bold mb-3"
            >
              Registrar atención clínica
            </h2>

            <p className="text-muted">
              Cita #{appointment.id} · Mascota #{appointment.mascotaId}
            </p>

            <form
              className="admin-form admin-user-form"
              onSubmit={handleSubmit}
            >
              <label>
                Fecha y hora de atención
                <input
                  type="datetime-local"
                  name="fechaAtencion"
                  value={form.fechaAtencion}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                Motivo
                <input
                  name="motivo"
                  maxLength="200"
                  value={form.motivo}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                Diagnóstico
                <textarea
                  name="diagnostico"
                  maxLength="2000"
                  value={form.diagnostico}
                  onChange={updateField}
                  required
                />
              </label>

              <label>
                Tratamiento
                <textarea
                  name="tratamiento"
                  maxLength="2000"
                  value={form.tratamiento}
                  onChange={updateField}
                />
              </label>

              <label>
                Observaciones
                <textarea
                  name="observaciones"
                  maxLength="4000"
                  value={form.observaciones}
                  onChange={updateField}
                />
              </label>

              <label>
                Profesional responsable
                <input
                  name="profesionalResponsable"
                  maxLength="120"
                  value={form.profesionalResponsable}
                  onChange={updateField}
                  required
                />
              </label>

              {error && (
                <p className="admin-form-message error" role="alert">
                  {error}
                </p>
              )}

              <div className="form-actions">
                <button
                  className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar atención'}
                </button>
                <button
                  className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold"
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  )
}