import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { validateUser } from '../utils/userValidation.js'

export function RegisterForm({ users = [], onRegister }) {
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
    direccion: ''
  })

  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')

  // Función flexible para validar RUN (acepta con/sin puntos y con/sin guion)
  const flexibleValidateRun = (runStr) => {
    if (!runStr) return false
    // Limpiar puntos y guion
    const clean = runStr.replace(/[\.\-]/g, '').toUpperCase()
    if (clean.length < 8 || clean.length > 9) return false
    
    // Si la función importada existe, probamos formateando a xx.xxx.xxx-x
    const body = clean.slice(0, -1)
    const dv = clean.slice(-1)
    
    // Si tienes validateRun de utils, se intenta con el valor limpio o formateado
    if (typeof validateRun === 'function') {
      return validateRun(runStr) || validateRun(`${body}-${dv}`)
    }
    
    return true
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setGeneralError('')
    const newErrors = {}

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.'
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Los apellidos son obligatorios.'

    // Validación de RUN flexible
    if (!formData.run.trim()) {
      newErrors.run = 'El RUN es obligatorio.'
    } else if (!flexibleValidateRun(formData.run)) {
      newErrors.run = 'El RUN ingresado no es válido.'
    }

    // Validación de Correo
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es obligatorio.'
    } else if (typeof validateEmail === 'function' && !validateEmail(formData.email)) {
      newErrors.email = 'El correo debe ser de un dominio permitido (@duoc.cl, @profesor.duoc.cl, @gmail.com).'
    }

    // Validación de Teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio.'
    }

    // Validación de Contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria.'
    } else if (typeof validatePassword === 'function' && !validatePassword(formData.password)) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setGeneralError('Por favor corrige los errores del formulario.')
      return
    }

    // Verificar si el correo o RUN ya existen
    const exists = users.some(
      (u) =>
        u.email?.toLowerCase() === formData.email.trim().toLowerCase() ||
        u.run?.replace(/[\.\-]/g, '').toUpperCase() === formData.run.replace(/[\.\-]/g, '').toUpperCase()
    )

    if (exists) {
      setGeneralError('Ya existe una cuenta registrada con este correo o RUN.')
      return
    }

    // Guardar usuario
    if (onRegister) {
      onRegister(formData)
    }

    navigate('/')
  }

  return (
    <div className="bg-vet-doodle min-vh-100 py-5 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow border-0 rounded-4 p-4 bg-white">
              <div className="text-center mb-4">
                <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7">
                  👤 CUENTA DE CLIENTE
                </span>
                <h1 className="h3 fw-bold mt-3 mb-1 text-dark">Regístrate</h1>
                <p className="text-muted small">Crea una cuenta para solicitar y revisar tus citas.</p>
              </div>

              {generalError && (
                <div className="alert alert-danger rounded-3 text-center mb-4">
                  {generalError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Nombre y Apellidos */}
                  <div className="col-md-6 text-start">
                    <label className="form-label fw-medium text-dark small">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      className={`form-control rounded-3 ${errors.nombre ? 'is-invalid' : ''}`}
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                    {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                  </div>

                  <div className="col-md-6 text-start">
                    <label className="form-label fw-medium text-dark small">Apellidos</label>
                    <input
                      type="text"
                      name="apellidos"
                      className={`form-control rounded-3 ${errors.apellidos ? 'is-invalid' : ''}`}
                      value={formData.apellidos}
                      onChange={handleChange}
                    />
                    {errors.apellidos && <div className="invalid-feedback">{errors.apellidos}</div>}
                  </div>

                  {/* RUN y Correo */}
                  <div className="col-md-6 text-start">
                    <label className="form-label fw-medium text-dark small">RUN</label>
                    <input
                      type="text"
                      name="run"
                      placeholder="19.011.022-K o 19011022-K"
                      className={`form-control rounded-3 ${errors.run ? 'is-invalid' : ''}`}
                      value={formData.run}
                      onChange={handleChange}
                    />
                    {errors.run && <div className="invalid-feedback">{errors.run}</div>}
                  </div>

                  <div className="col-md-6 text-start">
                    <label className="form-label fw-medium text-dark small">Correo electrónico</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="camila.soto@duoc.cl"
                      className={`form-control rounded-3 ${errors.email ? 'is-invalid' : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  {/* Teléfono */}
                  <div className="col-12 text-start">
                    <label className="form-label fw-medium text-dark small">Teléfono de contacto</label>
                    <input
                      type="tel"
                      name="telefono"
                      placeholder="+56 9 1234 5678"
                      className={`form-control rounded-3 ${errors.telefono ? 'is-invalid' : ''}`}
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                    {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
                  </div>

                  {/* Contraseñas */}
                  <div className="col-md-6 text-start">
                    <label className="form-label fw-medium text-dark small">Contraseña</label>
                    <input
                      type="password"
                      name="password"
                      className={`form-control rounded-3 ${errors.password ? 'is-invalid' : ''}`}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>

                  <div className="col-md-6 text-start">
                    <label className="form-label fw-medium text-dark small">Confirmar contraseña</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className={`form-control rounded-3 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>

                  {/* Región y Comuna */}
                  <div className="col-md-6 text-start">
                    <label className="form-label fw-medium text-dark small">Región</label>
                    <select
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
                    <label className="form-label fw-medium text-dark small">Comuna</label>
                    <select
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

                  {/* Dirección */}
                  <div className="col-12 text-start">
                    <label className="form-label fw-medium text-dark small">Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      className="form-control rounded-3"
                      placeholder="Av. España 1234"
                      value={formData.direccion}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    className="btn btn-registro-custom btn-lg w-100 rounded-pill fw-semibold shadow-sm fs-6"
                    type="submit"
                  >
                    Crear cuenta
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