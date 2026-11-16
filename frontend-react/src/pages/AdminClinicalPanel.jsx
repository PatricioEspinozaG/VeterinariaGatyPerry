import { useEffect, useState } from 'react'
import { Navigate, NavLink } from 'react-router'
import { listAppointmentClients } from '../services/clientes.js'
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
import { listManagedPets } from '../services/mascotas.js'
import '../styles/app.css'

function currentDateTime() {
  const date = new Date()
  const part = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}T${part(date.getHours())}:${part(date.getMinutes())}`
}

function currentDate() {
  return currentDateTime().slice(0, 10)
}

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Fecha no disponible'
    : date.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
}

function textOrNull(value) {
  const text = value.trim()
  return text || null
}

function clinicalForm(type, professional, detail = null) {
  if (type === 'ATENCION') {
    return {
      fechaAtencion: detail?.fechaAtencion?.slice(0, 16) || currentDateTime(),
      motivo: detail?.motivo || '',
      diagnostico: detail?.diagnostico || '',
      tratamiento: detail?.tratamiento || '',
      observaciones: detail?.observaciones || '',
      profesionalResponsable: detail?.profesionalResponsable || professional,
      citaId: detail?.citaId ? String(detail.citaId) : '',
      version: detail?.version,
    }
  }
  return {
    nombreVacuna: detail?.nombreVacuna || '',
    fechaAplicacion: detail?.fechaAplicacion || currentDate(),
    profesionalResponsable: detail?.profesionalResponsable || professional,
    lote: detail?.lote || '',
    observaciones: detail?.observaciones || '',
    proximaDosis: detail?.proximaDosis || '',
    atencionId: detail?.atencionId ? String(detail.atencionId) : '',
    version: detail?.version,
  }
}

function displayClient(client) {
  const name = [client.nombre || client.name, client.apellidos || client.lastName]
    .filter(Boolean)
    .join(' ')
  const email = client.email || ''
  return name && email ? `${name} · ${email}` : name || email || `Cliente #${client.id}`
}

export default function AdminClinicalPanel({ currentUser }) {
  const [clientsQuery, setClientsQuery] = useState({
    items: [],
    error: '',
    loading: true,
  })
  const [selectedClientId, setSelectedClientId] = useState('')
  const [petsQuery, setPetsQuery] = useState({
    clientId: '',
    items: [],
    error: '',
    loading: false,
  })
  const [selectedPetId, setSelectedPetId] = useState('')
  const [historyQuery, setHistoryQuery] = useState({
    key: '',
    items: [],
    error: '',
    loading: false,
  })
  const [historyRefresh, setHistoryRefresh] = useState(0)
  const [formState, setFormState] = useState(null)
  const [formError, setFormError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [busyRecord, setBusyRecord] = useState('')
  const [pendingAnnulment, setPendingAnnulment] = useState(null)
  const [annulmentReason, setAnnulmentReason] = useState('')
  const [annulling, setAnnulling] = useState(false)

  const petsQueryMatches = petsQuery.clientId === selectedClientId
    ? petsQuery
    : null
  const pets = petsQueryMatches?.items || []
  const petsLoading = Boolean(selectedClientId)
    && (!petsQueryMatches || petsQueryMatches.loading)
  const petsError = petsQueryMatches?.error || ''
  const historyKey = `${selectedPetId}:${historyRefresh}`
  const currentHistoryQuery = historyQuery.key === historyKey
    ? historyQuery
    : null
  const historyLoading = Boolean(selectedPetId)
    && (!currentHistoryQuery || currentHistoryQuery.loading)
  const historyError = currentHistoryQuery?.error || ''
  const historyItems = currentHistoryQuery?.items || []
  const professional = [
    currentUser?.nombre || currentUser?.name,
    currentUser?.apellidos || currentUser?.lastName,
  ].filter(Boolean).join(' ')

  useEffect(() => {
    if (currentUser?.role !== 'admin') return undefined

    let active = true
    listAppointmentClients()
      .then((items) => {
        if (active) {
          setClientsQuery({ items, error: '', loading: false })
          setSelectedClientId(items[0] ? String(items[0].id) : '')
        }
      })
      .catch((error) => {
        if (active) {
          setClientsQuery({ items: [], error: error.message, loading: false })
        }
      })

    return () => {
      active = false
    }
  }, [currentUser?.role])

  useEffect(() => {
    if (currentUser?.role !== 'admin' || !selectedClientId) return undefined

    let active = true
    listManagedPets(selectedClientId)
      .then((items) => {
        if (active) {
          setPetsQuery({
            clientId: selectedClientId,
            items,
            error: '',
            loading: false,
          })
          setSelectedPetId((previous) => (
            items.some((pet) => String(pet.id) === previous)
              ? previous
              : items[0] ? String(items[0].id) : ''
          ))
        }
      })
      .catch((error) => {
        if (active) {
          setPetsQuery({
            clientId: selectedClientId,
            items: [],
            error: error.message,
            loading: false,
          })
          setSelectedPetId('')
        }
      })

    return () => {
      active = false
    }
  }, [currentUser?.role, selectedClientId])

  useEffect(() => {
    if (currentUser?.role !== 'admin' || !selectedPetId) return undefined

    let active = true
    const key = `${selectedPetId}:${historyRefresh}`
    listPetClinicalHistory(selectedPetId)
      .then((history) => {
        if (active) {
          setHistoryQuery({
            key,
            items: history.registros,
            error: '',
            loading: false,
          })
        }
      })
      .catch((error) => {
        if (active) {
          setHistoryQuery({ key, items: [], error: error.message, loading: false })
        }
      })

    return () => {
      active = false
    }
  }, [currentUser?.role, historyRefresh, selectedPetId])

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  function resetForm() {
    setFormState(null)
    setFormError('')
  }

  function startCreate(type) {
    setFormState({
      type,
      mode: 'create',
      record: null,
      data: clinicalForm(type, professional),
    })
    setFormError('')
    setActionError('')
    setActionMessage('')
  }

  async function startEdit(record) {
    const key = `${record.tipo}-${record.id}`
    setBusyRecord(key)
    setFormError('')
    setActionError('')
    setActionMessage('')
    try {
      const detail = record.tipo === 'ATENCION'
        ? await getClinicalAttention(record.id)
        : await getClinicalVaccine(record.id)
      setFormState({
        type: record.tipo,
        mode: 'edit',
        record,
        data: clinicalForm(record.tipo, professional, detail),
      })
    } catch (error) {
      setActionError(error.message)
    } finally {
      setBusyRecord('')
    }
  }

  function updateFormField(name, value) {
    setFormState((previous) => ({
      ...previous,
      data: { ...previous.data, [name]: value },
    }))
  }

  async function saveClinicalRecord(event) {
    event.preventDefault()
    if (!formState || !selectedPetId) return

    setSaving(true)
    setFormError('')
    setActionError('')
    setActionMessage('')
    const { type, mode, record, data } = formState
    try {
      if (type === 'ATENCION') {
        const request = {
          fechaAtencion: data.fechaAtencion,
          motivo: data.motivo.trim(),
          diagnostico: data.diagnostico.trim(),
          tratamiento: textOrNull(data.tratamiento),
          observaciones: textOrNull(data.observaciones),
          profesionalResponsable: data.profesionalResponsable.trim(),
          ...(mode === 'create'
            ? {
              mascotaId: Number(selectedPetId),
              citaId: data.citaId ? Number(data.citaId) : null,
            }
            : { version: data.version }),
        }
        if (mode === 'create') {
          await createClinicalAttention(request)
        } else {
          await updateClinicalAttention(record.id, request)
        }
      } else {
        const request = {
          nombreVacuna: data.nombreVacuna.trim(),
          fechaAplicacion: data.fechaAplicacion,
          profesionalResponsable: data.profesionalResponsable.trim(),
          lote: textOrNull(data.lote),
          observaciones: textOrNull(data.observaciones),
          proximaDosis: data.proximaDosis || null,
          ...(mode === 'create'
            ? {
              mascotaId: Number(selectedPetId),
              atencionId: data.atencionId ? Number(data.atencionId) : null,
            }
            : { version: data.version }),
        }
        if (mode === 'create') {
          await createClinicalVaccine(request)
        } else {
          await updateClinicalVaccine(record.id, request)
        }
      }

      resetForm()
      setActionMessage(
        `${type === 'ATENCION' ? 'Atención' : 'Vacuna'} ${mode === 'create' ? 'registrada' : 'actualizada'} correctamente.`,
      )
      setHistoryRefresh((previous) => previous + 1)
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function requestAnnulment(record) {
    const key = `${record.tipo}-${record.id}`
    setBusyRecord(key)
    setActionError('')
    setActionMessage('')
    try {
      const detail = record.tipo === 'ATENCION'
        ? await getClinicalAttention(record.id)
        : await getClinicalVaccine(record.id)
      setPendingAnnulment({ record, version: detail.version })
      setAnnulmentReason('')
    } catch (error) {
      setActionError(error.message)
    } finally {
      setBusyRecord('')
    }
  }

  async function confirmAnnulment(event) {
    event.preventDefault()
    if (!pendingAnnulment) return

    setAnnulling(true)
    setActionError('')
    try {
      const { record, version } = pendingAnnulment
      const payload = { motivo: annulmentReason.trim(), version }
      if (record.tipo === 'ATENCION') {
        await annulClinicalAttention(record.id, payload)
      } else {
        await annulClinicalVaccine(record.id, payload)
      }
      setPendingAnnulment(null)
      setAnnulmentReason('')
      setActionMessage(
        `${record.tipo === 'ATENCION' ? 'Atención' : 'Vacuna'} anulada correctamente.`,
      )
      setHistoryRefresh((previous) => previous + 1)
    } catch (error) {
      setActionError(error.message)
    } finally {
      setAnnulling(false)
    }
  }

  const attentionRecords = historyItems.filter(
    (record) => record.tipo === 'ATENCION' && record.estado === 'ACTIVA',
  )

  return (
    <div className="admin-panel container">
      <div className="admin-header">
        <div className="admin-title">
          <h1>Gestión clínica</h1>
          <p className="muted">Administra atenciones y vacunas registradas para las mascotas.</p>
        </div>
      </div>

      <nav className="admin-nav" aria-label="Secciones de administración">
        <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>Productos</NavLink>
        <NavLink to="/admin/usuarios" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>Usuarios</NavLink>
        <NavLink to="/admin/citas" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>Citas</NavLink>
        <NavLink to="/admin/clinica" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>Clínica</NavLink>
      </nav>

      <main className="admin-main admin-main-background bg-vet-doodle">
        <section className="admin-view-card card shadow border-0 rounded-4 p-4 bg-white full">
          <div className="admin-section-heading">
            <div>
              <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7 mb-2 d-inline-block">
                HISTORIAL POR MASCOTA
              </span>
              <h2 className="h3 fw-bold text-dark">Registros clínicos</h2>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold"
                type="button"
                disabled={!selectedPetId || saving}
                onClick={() => startCreate('ATENCION')}
              >
                Registrar atención
              </button>
              <button
                className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold"
                type="button"
                disabled={!selectedPetId || saving}
                onClick={() => startCreate('VACUNA')}
              >
                Registrar vacuna
              </button>
            </div>
          </div>

          {clientsQuery.error && <p className="admin-form-message error" role="alert">{clientsQuery.error}</p>}
          {!clientsQuery.loading
            && !clientsQuery.error
            && clientsQuery.items.length === 0
            && <p className="text-muted">No hay clientes activos para seleccionar.</p>}
          {petsError && <p className="admin-form-message error" role="alert">{petsError}</p>}
          {historyError && <p className="admin-form-message error" role="alert">{historyError}</p>}
          {actionError && !pendingAnnulment && <p className="admin-form-message error" role="alert">{actionError}</p>}
          {actionMessage && <p className="admin-form-message success" role="status">{actionMessage}</p>}

          <div className="admin-form admin-clinical-filters">
            <label>Cliente
              <select
                value={selectedClientId}
                disabled={clientsQuery.loading || Boolean(clientsQuery.error)}
                onChange={(event) => {
                  setSelectedClientId(event.target.value)
                  setSelectedPetId('')
                  resetForm()
                  setActionError('')
                  setActionMessage('')
                }}
              >
                <option value="">
                  {clientsQuery.loading ? 'Cargando clientes...' : 'Selecciona un cliente'}
                </option>
                {clientsQuery.items.map((client) => (
                  <option key={client.id} value={String(client.id)}>
                    {displayClient(client)}
                  </option>
                ))}
              </select>
            </label>
            <label>Mascota
              <select
                value={selectedPetId}
                disabled={!selectedClientId || petsLoading || Boolean(petsError)}
                onChange={(event) => {
                  setSelectedPetId(event.target.value)
                  resetForm()
                  setActionError('')
                  setActionMessage('')
                }}
              >
                <option value="">
                  {petsLoading ? 'Cargando mascotas...' : 'Selecciona una mascota'}
                </option>
                {pets.map((pet) => (
                  <option key={pet.id} value={String(pet.id)}>{pet.nombre}</option>
                ))}
              </select>
            </label>
          </div>

          {selectedClientId && !petsLoading && !petsError && pets.length === 0 && (
            <p className="text-muted">Este cliente todavía no tiene mascotas registradas.</p>
          )}
          {selectedPetId && historyLoading && (
            <p className="text-center py-5" role="status">Cargando registros clínicos...</p>
          )}
          {selectedPetId && !historyLoading && !historyError && historyItems.length === 0 && (
            <p className="text-center py-5 text-muted">Esta mascota aún no tiene registros clínicos.</p>
          )}
          {selectedPetId && !historyLoading && !historyError && historyItems.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 user-mobile-card-table">
                <thead className="table-light">
                  <tr><th>Fecha</th><th>Tipo</th><th>Detalle</th><th>Profesional</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {historyItems.map((record) => {
                    const key = `${record.tipo}-${record.id}`
                    const activeRecord = record.estado === 'ACTIVA'
                    return (
                      <tr key={key}>
                        <td data-label="Fecha">{formatDate(record.fecha)}</td>
                        <td data-label="Tipo">{record.tipo === 'VACUNA' ? 'Vacuna' : 'Atención'}</td>
                        <td data-label="Detalle">
                          <strong>{record.tipo === 'VACUNA' ? record.nombreVacuna : record.motivo}</strong>
                          {record.diagnostico && <div>Diagnóstico: {record.diagnostico}</div>}
                          {record.tratamiento && <div>Tratamiento: {record.tratamiento}</div>}
                        </td>
                        <td data-label="Profesional">{record.profesionalResponsable || '-'}</td>
                        <td data-label="Estado">
                          <span className={`badge rounded-pill ${activeRecord ? 'text-bg-success' : 'text-bg-secondary'}`}>
                            {activeRecord ? 'Activa' : 'Anulada'}
                          </span>
                        </td>
                        <td className="action-cell" data-label="Acciones">
                          {activeRecord && (
                            <div className="action-buttons">
                              <button
                                className="btn btn-edit"
                                type="button"
                                disabled={Boolean(busyRecord) || saving || annulling}
                                onClick={() => startEdit(record)}
                              >
                                {busyRecord === key ? 'Cargando...' : 'Editar'}
                              </button>
                              <button
                                className="btn btn-delete"
                                type="button"
                                disabled={Boolean(busyRecord) || saving || annulling}
                                onClick={() => requestAnnulment(record)}
                              >
                                Anular
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {formState && (
            <form className="admin-form admin-clinical-form mt-4" onSubmit={saveClinicalRecord}>
              <h3 className="h5 fw-bold">
                {formState.mode === 'create' ? 'Registrar' : 'Editar'} {formState.type === 'ATENCION' ? 'atención' : 'vacuna'}
              </h3>
              {formState.type === 'ATENCION' ? (
                <>
                  <label>Fecha y hora de atención
                    <input
                      type="datetime-local"
                      value={formState.data.fechaAtencion}
                      required
                      onChange={(event) => updateFormField('fechaAtencion', event.target.value)}
                    />
                  </label>
                  {formState.mode === 'create' && (
                    <label>ID de cita (opcional)
                      <input
                        type="number"
                        min="1"
                        value={formState.data.citaId}
                        onChange={(event) => updateFormField('citaId', event.target.value)}
                      />
                    </label>
                  )}
                  <label>Motivo
                    <input
                      maxLength="200"
                      value={formState.data.motivo}
                      required
                      onChange={(event) => updateFormField('motivo', event.target.value)}
                    />
                  </label>
                  <label>Diagnóstico
                    <textarea
                      maxLength="2000"
                      value={formState.data.diagnostico}
                      required
                      onChange={(event) => updateFormField('diagnostico', event.target.value)}
                    />
                  </label>
                  <label>Tratamiento
                    <textarea
                      maxLength="2000"
                      value={formState.data.tratamiento}
                      onChange={(event) => updateFormField('tratamiento', event.target.value)}
                    />
                  </label>
                  <label>Observaciones
                    <textarea
                      maxLength="4000"
                      value={formState.data.observaciones}
                      onChange={(event) => updateFormField('observaciones', event.target.value)}
                    />
                  </label>
                  <label>Profesional responsable
                    <input
                      maxLength="120"
                      value={formState.data.profesionalResponsable}
                      required
                      onChange={(event) => updateFormField('profesionalResponsable', event.target.value)}
                    />
                  </label>
                </>
              ) : (
                <>
                  <label>Nombre de la vacuna
                    <input
                      maxLength="160"
                      value={formState.data.nombreVacuna}
                      required
                      onChange={(event) => updateFormField('nombreVacuna', event.target.value)}
                    />
                  </label>
                  <label>Fecha de aplicación
                    <input
                      type="date"
                      value={formState.data.fechaAplicacion}
                      required
                      onChange={(event) => updateFormField('fechaAplicacion', event.target.value)}
                    />
                  </label>
                  <label>Próxima dosis
                    <input
                      type="date"
                      value={formState.data.proximaDosis}
                      onChange={(event) => updateFormField('proximaDosis', event.target.value)}
                    />
                  </label>
                  {formState.mode === 'create' && (
                    <label>Atención asociada (opcional)
                      <select
                        value={formState.data.atencionId}
                        onChange={(event) => updateFormField('atencionId', event.target.value)}
                      >
                        <option value="">Sin atención asociada</option>
                        {attentionRecords.map((record) => (
                          <option key={record.id} value={String(record.id)}>
                            {record.fecha} · {record.motivo}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label>Profesional responsable
                    <input
                      maxLength="120"
                      value={formState.data.profesionalResponsable}
                      required
                      onChange={(event) => updateFormField('profesionalResponsable', event.target.value)}
                    />
                  </label>
                  <label>Lote
                    <input
                      maxLength="120"
                      value={formState.data.lote}
                      onChange={(event) => updateFormField('lote', event.target.value)}
                    />
                  </label>
                  <label>Observaciones
                    <textarea
                      maxLength="2000"
                      value={formState.data.observaciones}
                      onChange={(event) => updateFormField('observaciones', event.target.value)}
                    />
                  </label>
                </>
              )}
              {formError && <p className="admin-form-message error" role="alert">{formError}</p>}
              <div className="form-actions">
                <button className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold" type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : formState.type === 'ATENCION' ? 'Guardar atención' : 'Guardar vacuna'}
                </button>
                <button className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold" type="button" disabled={saving} onClick={resetForm}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </section>
      </main>

      {pendingAnnulment && (
        <div className="overlay" role="presentation">
          <form
            className="overlay-panel admin-confirm-panel"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clinical-annulment-title"
            onSubmit={confirmAnnulment}
          >
            <h2 id="clinical-annulment-title" className="h4 fw-bold">Anular registro clínico</h2>
            <p>El registro permanecerá en el historial y se marcará como anulado.</p>
            <label>Motivo de anulación
              <textarea
                value={annulmentReason}
                maxLength="500"
                required
                onChange={(event) => setAnnulmentReason(event.target.value)}
              />
            </label>
            {actionError && <p className="admin-form-message error" role="alert">{actionError}</p>}
            <div className="form-actions">
              <button
                className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold"
                type="button"
                disabled={annulling}
                onClick={() => {
                  setPendingAnnulment(null)
                  setActionError('')
                }}
              >
                Cancelar
              </button>
              <button className="btn btn-delete px-4 py-2 rounded-pill fw-semibold" type="submit" disabled={annulling}>
                {annulling ? 'Anulando...' : 'Confirmar anulación'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
