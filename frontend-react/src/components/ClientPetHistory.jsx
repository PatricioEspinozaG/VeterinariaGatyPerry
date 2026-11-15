import { useState } from 'react'
import { getPetHistory } from '../services/clinicApi.js'

function formatDate(value) {
  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('es-CL')
}

function getRecordType(record) {
  return record.tipo === 'VACUNA' ? 'Vacuna' : 'Atención'
}

export default function ClientPetHistory({ pet }) {
  const [open, setOpen] = useState(false)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function openHistory() {
    setOpen(true)
    setLoading(true)
    setError('')
    setRecords([])

    try {
      const history = await getPetHistory(pet.id)
      setRecords(history.registros)
    } catch (cause) {
      setError(cause.message || 'No pudimos cargar el historial clínico.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        className="btn btn-outline-secondary rounded-pill px-3"
        type="button"
        onClick={openHistory}
      >
        Ver historial
      </button>

      {open && (
        <div className="overlay" role="presentation">
          <section
            className="overlay-panel admin-edit-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`pet-history-title-${pet.id}`}
          >
            <button
              className="overlay-close"
              type="button"
              aria-label="Cerrar historial"
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            <h2
              id={`pet-history-title-${pet.id}`}
              className="h4 fw-bold mb-3"
            >
              Historial clínico de {pet.nombre}
            </h2>

            {loading && <p role="status">Cargando historial...</p>}

            {error && (
              <p className="admin-form-message error" role="alert">
                {error}
              </p>
            )}

            {!loading && !error && records.length === 0 && (
              <p className="text-muted">
                Aún no hay registros clínicos para esta mascota.
              </p>
            )}

            {!loading && !error && records.length > 0 && (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Detalle</th>
                      <th>Estado</th>
                      <th>Profesional</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={`${record.tipo}-${record.id}`}>
                        <td>{formatDate(record.fecha)}</td>
                        <td>{getRecordType(record)}</td>
                        <td>
                          {record.nombreVacuna || record.motivo || '-'}
                          {record.diagnostico && (
                            <div className="small text-muted">
                              Diagnóstico: {record.diagnostico}
                            </div>
                          )}
                          {record.tratamiento && (
                            <div className="small text-muted">
                              Tratamiento: {record.tratamiento}
                            </div>
                          )}
                        </td>
                        <td>{record.estado}</td>
                        <td>{record.profesionalResponsable || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}