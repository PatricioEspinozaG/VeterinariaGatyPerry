import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { login, register } from '../services/authApi.js'
import {
  validateLastName,
  validateName,
  validatePassword,
  validatePhone,
  validateRun,
} from '../utils/userValidation.js'

export function RegisterForm({ onRegister }) {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    run: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    region: 'Valparaíso',
    comuna: 'Valparaíso',
    direccion: '',
  })
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => ({ ...previous, [name]: '' }))
  }

  function validate() {
    const nextErrors = {}

    nextErrors.nombre = validateName(formData.nombre)
    nextErrors.apellidos = validateLastName(formData.apellidos)
    nextErrors.run = validateRun(formData.run)
    nextErrors.telefono = validatePhone(formData.telefono)
    nextErrors.password = validatePassword(formData.password)

    const email = formData.email.trim()
    if (!email) {
      nextErrors.email = 'El correo es obligatorio.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Ingresa un correo válido.'
    }

    if (formData.password.length > 64) {
      nextErrors.password = 'La contraseña no puede superar 64 caracteres.'
    }
    if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Las contraseñas no coinciden.'
    }
    if (!formData.region) {
      nextErrors.region = 'Selecciona una región.'
    }
    if (!formData.comuna) {
      nextErrors.comuna = 'Selecciona una comuna.'
    }

    for (const key of Object.keys(nextErrors)) {
      if (!nextErrors[key]) delete nextErrors[key]
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading || accountCreated) return

    setGeneralError('')
    if (!validate()) {
      setGeneralError('Corrige los campos indicados.')
      return
    }

    setLoading(true)
    let created = false

    try {
      await register({
        ...formData,
        nombre: formData.nombre.trim(),
        apellidos: formData.apellidos.trim(),
        run: formData.run.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
      })

      created = true
      setAccountCreated(true)

      const session = await login(
        formData.email.trim(),
        formData.password,
      )
      onRegister?.(session.usuario)
      navigate('/mi-cuenta', { replace: true })
    } catch (error) {
      if (created) {
        setGeneralError(
          'La cuenta fue creada, pero no pudimos iniciar sesión. Ingresa desde la página de acceso.',
        )
      } else if (error.status === 409) {
        setGeneralError('Ese correo o RUN ya está registrado.')
      } else {
        setGeneralError(
          'No pudimos crear la cuenta. Revisa los datos e inténtalo nuevamente.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-vet-doodle min-vh-100 py-5 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow border-0 rounded-4 p-4 bg-white">
              <div className="text-center mb-4">
                <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7">
                  CUENTA DE CLIENTE
                </span>
                <h1 className="h3 fw-bold mt-3 mb-1 text-dark">Regístrate</h1>
                <p className="text-muted small">
                  Crea una cuenta para solicitar y revisar tus citas.
                </p>
              </div>

              {generalError && (
                <div
                  className="alert alert-danger rounded-3 text-center mb-4"
                  role="alert"
                >
                  {generalError}
                  {accountCreated && (
                    <>
                      {' '}
                      <Link to="/login">Ir a iniciar sesión</Link>
                    </>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-md-6 text-start">
                    <label htmlFor="nombre" className="form-label fw-medium text-dark small">
                      Nombre
                    </label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      className={`form-control rounded-3 ${errors.nombre ? 'is-invalid' : ''}`}
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                    {errors.nombre && (
                      <div className="invalid-feedback">{errors.nombre}</div>
                    )}
                  </div>

                  <div className="col-md-6 text-start">
                    <label htmlFor="apellidos" className="form-label fw-medium text-dark small">
                      Apellidos
                    </label>
                    <input
                      id="apellidos"
                      name="apellidos"
                      type="text"
                      className={`form-control rounded-3 ${errors.apellidos ? 'is-invalid' : ''}`}
                      value={formData.apellidos}
                      onChange={handleChange}
                    />
                    {errors.apellidos && (
                      <div className="invalid-feedback">{errors.apellidos}</div>
                    )}
                  </div>

                  <div className="col-md-6 text-start">
                    <label htmlFor="run" className="form-label fw-medium text-dark small">
                      RUN
                    </label>
                    <input
                      id="run"
                      name="run"
                      type="text"
                      placeholder="12.345.678-5"
                      className={`form-control rounded-3 ${errors.run ? 'is-invalid' : ''}`}
                      value={formData.run}
                      onChange={handleChange}
                    />
                    {errors.run && (
                      <div className="invalid-feedback">{errors.run}</div>
                    )}
                  </div>

                  <div className="col-md-6 text-start">
                    <label htmlFor="email-registro" className="form-label fw-medium text-dark small">
                      Correo electrónico
                    </label>
                    <input
                      id="email-registro"
                      name="email"
                      type="email"
                      className={`form-control rounded-3 ${errors.email ? 'is-invalid' : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="col-12 text-start">
                    <label htmlFor="telefono" className="form-label fw-medium text-dark small">
                      Teléfono de contacto
                    </label>
                    <input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      className={`form-control rounded-3 ${errors.telefono ? 'is-invalid' : ''}`}
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                    {errors.telefono && (
                      <div className="invalid-feedback">{errors.telefono}</div>
                    )}
                  </div>

                  <div className="col-md-6 text-start">
                    <label htmlFor="password-registro" className="form-label fw-medium text-dark small">
                      Contraseña
                    </label>
                    <input
                      id="password-registro"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      className={`form-control rounded-3 ${errors.password ? 'is-invalid' : ''}`}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>

                  <div className="col-md-6 text-start">
                    <label htmlFor="confirmPassword" className="form-label fw-medium text-dark small">
                      Confirmar contraseña
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className={`form-control rounded-3 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && (
                      <div className="invalid-feedback">{errors.confirmPassword}</div>
                    )}
                  </div>

                  <div className="col-md-6 text-start">
                    <label htmlFor="region" className="form-label fw-medium text-dark small">
                      Región
                    </label>
                    <select
                      id="region"
                      name="region"
                      className="form-select rounded-3"
                      value={formData.region}
                      onChange={handleChange}
                    >
                      <option value="Valparaíso">Valparaíso</option>
                      <option value="Metropolitana">Metropolitana</option>
                      <option value="O'Higgins">O'Higgins</option>
                    </select>
                  </div>

                  <div className="col-md-6 text-start">
                    <label htmlFor="comuna" className="form-label fw-medium text-dark small">
                      Comuna
                    </label>
                    <select
                      id="comuna"
                      name="comuna"
                      className="form-select rounded-3"
                      value={formData.comuna}
                      onChange={handleChange}
                    >
                      <option value="Valparaíso">Valparaíso</option>
                      <option value="Viña del Mar">Viña del Mar</option>
                      <option value="Quilpué">Quilpué</option>
                      <option value="Rancagua">Rancagua</option>
                      <option value="Santiago">Santiago</option>
                    </select>
                  </div>

                  <div className="col-12 text-start">
                    <label htmlFor="direccion" className="form-label fw-medium text-dark small">
                      Dirección
                    </label>
                    <input
                      id="direccion"
                      name="direccion"
                      type="text"
                      className="form-control rounded-3"
                      value={formData.direccion}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    className="btn btn-registro-custom btn-lg w-100 rounded-pill fw-semibold shadow-sm fs-6"
                    type="submit"
                    disabled={loading || accountCreated}
                  >
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}