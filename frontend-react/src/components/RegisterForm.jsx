import { useState } from 'react'
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
    const newErrors = validateUser(formData, users)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      setGeneralError(newErrors.general || 'Por favor corrige los errores del formulario.')
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
