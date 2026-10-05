import React, { useState } from "react";
import { validateRun, validateEmail, validatePassword } from "../utils/userValidation";

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    rut: "",
    email: "",
    password: "",
    confirmarPassword: "",
    region: "",
    comuna: "",
    direccion: ""
  });

  const [errors, setErrors] = useState({});
  const [mensaje, setMensaje] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.nombre.trim() || formData.nombre.length > 50) {
      newErrors.nombre = "Nombre obligatorio, máximo 50 caracteres.";
    }

    if (!formData.apellidos.trim() || formData.apellidos.length > 100) {
      newErrors.apellidos = "Apellidos obligatorios, máximo 100 caracteres.";
    }

    const runError = validateRun(formData.rut);
    if (runError) newErrors.rut = runError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passError = validatePassword(formData.password);
    if (passError) newErrors.password = passError;

    if (!formData.confirmarPassword || formData.password !== formData.confirmarPassword) {
      newErrors.confirmarPassword = "Las contraseñas deben coincidir.";
    }

    if (!formData.region) newErrors.region = "Selecciona una región.";
    if (!formData.comuna) newErrors.comuna = "Selecciona una comuna.";

    if (!formData.direccion.trim() || formData.direccion.length > 300) {
      newErrors.direccion = "Dirección obligatoria, máximo 300 caracteres.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMensaje({ tipo: "danger", texto: "Por favor corrige los errores del formulario." });
    } else {
      setErrors({});
      setMensaje({ tipo: "success", texto: "¡Cuenta creada exitosamente!" });
      console.log("Datos del registro:", formData);
    }
  };

  return (
    <div className="bg-vet-doodle min-vh-100 py-5 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow border-0 rounded-4 p-3 p-md-4 bg-white">
              <div className="text-center mb-4">
                <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7">
                  👤 CUENTA DE CLIENTE
                </span>
                <h1 className="h3 fw-bold mt-3 mb-1 text-dark">Regístrate</h1>
                <p className="text-muted small">Crea una cuenta para solicitar y revisar tus citas.</p>
              </div>

              {mensaje && (
                <div className={`alert alert-${mensaje.tipo} rounded-3 text-center`} role="alert">
                  {mensaje.texto}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  {/* Nombre */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="nombre" className="form-label fw-medium text-dark small">Nombre</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      className={`form-control rounded-3 ${errors.nombre ? "is-invalid" : ""}`}
                      placeholder="Ej. Juan"
                      maxLength={50}
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                    {errors.nombre && <div className="invalid-feedback d-block">{errors.nombre}</div>}
                  </div>

                  {/* Apellidos */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="apellidos" className="form-label fw-medium text-dark small">Apellidos</label>
                    <input
                      type="text"
                      id="apellidos"
                      name="apellidos"
                      className={`form-control rounded-3 ${errors.apellidos ? "is-invalid" : ""}`}
                      placeholder="Ej. Pérez"
                      maxLength={100}
                      value={formData.apellidos}
                      onChange={handleChange}
                    />
                    {errors.apellidos && <div className="invalid-feedback d-block">{errors.apellidos}</div>}
                  </div>

                  {/* RUN */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="rut" className="form-label fw-medium text-dark small">RUN</label>
                    <input
                      type="text"
                      id="rut"
                      name="rut"
                      className={`form-control rounded-3 ${errors.rut ? "is-invalid" : ""}`}
                      placeholder="19011022-K"
                      value={formData.rut}
                      onChange={handleChange}
                    />
                    {errors.rut && <div className="invalid-feedback d-block">{errors.rut}</div>}
                  </div>

                  {/* Email */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="email" className="form-label fw-medium text-dark small">Correo electrónico</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-control rounded-3 ${errors.email ? "is-invalid" : ""}`}
                      placeholder="ejemplo@duoc.cl"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                  </div>

                  {/* Contraseña */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="password" className="form-label fw-medium text-dark small">Contraseña</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className={`form-control rounded-3 ${errors.password ? "is-invalid" : ""}`}
                      minLength={4}
                      maxLength={10}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                  </div>

                  {/* Confirmar Contraseña */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="confirmarPassword" className="form-label fw-medium text-dark small">Confirmar contraseña</label>
                    <input
                      type="password"
                      id="confirmarPassword"
                      name="confirmarPassword"
                      className={`form-control rounded-3 ${errors.confirmarPassword ? "is-invalid" : ""}`}
                      value={formData.confirmarPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmarPassword && <div className="invalid-feedback d-block">{errors.confirmarPassword}</div>}
                  </div>

                  {/* Región */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="region" className="form-label fw-medium text-dark small">Región</label>
                    <select
                      id="region"
                      name="region"
                      className={`form-select rounded-3 ${errors.region ? "is-invalid" : ""}`}
                      value={formData.region}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona Región</option>
                      <option value="Valparaíso">Valparaíso</option>
                      <option value="Metropolitana">Región Metropolitana</option>
                    </select>
                    {errors.region && <div className="invalid-feedback d-block">{errors.region}</div>}
                  </div>

                  {/* Comuna */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="comuna" className="form-label fw-medium text-dark small">Comuna</label>
                    <select
                      id="comuna"
                      name="comuna"
                      className={`form-select rounded-3 ${errors.comuna ? "is-invalid" : ""}`}
                      value={formData.comuna}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona Comuna</option>
                      <option value="Viña del Mar">Viña del Mar</option>
                      <option value="Valparaíso">Valparaíso</option>
                      <option value="Quilpué">Quilpué</option>
                    </select>
                    {errors.comuna && <div className="invalid-feedback d-block">{errors.comuna}</div>}
                  </div>

                  {/* Dirección */}
                  <div className="col-12">
                    <label htmlFor="direccion" className="form-label fw-medium text-dark small">Dirección</label>
                    <input
                      type="text"
                      id="direccion"
                      name="direccion"
                      className={`form-control rounded-3 ${errors.direccion ? "is-invalid" : ""}`}
                      placeholder="Av. Libertad 123"
                      maxLength={300}
                      value={formData.direccion}
                      onChange={handleChange}
                    />
                    {errors.direccion && <div className="invalid-feedback d-block">{errors.direccion}</div>}
                  </div>

                  {/* Botón Registro !!!!! */}
                  <div className="col-12 text-center mt-4">
                   <button className="btn btn-registro-custom btn-lg px-5 py-2 rounded-pill fw-semibold shadow-sm fs-6" type="submit">
                    Crear cuenta
                  </button>
                  </div>
                </div>
              </form>

              <p className="text-center mt-4 mb-0 text-muted small">
                ¿Ya tienes cuenta? <a href="/login" className="text-decoration-none fw-semibold text-dark">Inicia sesión</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};