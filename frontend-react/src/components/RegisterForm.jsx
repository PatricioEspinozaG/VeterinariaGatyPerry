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

    // Limpiar error del campo que se está editando
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validar Nombre
    if (!formData.nombre.trim() || formData.nombre.length > 50) {
      newErrors.nombre = "Nombre obligatorio, máximo 50 caracteres.";
    }

    // Validar Apellidos
    if (!formData.apellidos.trim() || formData.apellidos.length > 100) {
      newErrors.apellidos = "Apellidos obligatorios, máximo 100 caracteres.";
    }

    // Validar RUN
    const runError = validateRun(formData.rut);
    if (runError) newErrors.rut = runError;

    // Validar Email
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    // Validar Contraseña
    const passError = validatePassword(formData.password);
    if (passError) newErrors.password = passError;

    // Validar Confirmación de Contraseña
    if (!formData.confirmarPassword || formData.password !== formData.confirmarPassword) {
      newErrors.confirmarPassword = "Las contraseñas deben coincidir.";
    }

    // Validar Dirección
    if (!formData.direccion.trim() || formData.direccion.length > 300) {
      newErrors.direccion = "Dirección obligatoria, máximo 300 caracteres.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMensaje({ tipo: "danger", texto: "Por favor corrige los errores del formulario." });
    } else {
      setErrors({});
      setMensaje({ tipo: "success", texto: "¡Cuenta creada exitosamente!" });
      console.log("Datos de registro:", formData);
    }
  };

  return (
    <div className="form-card">
      <div className="text-center mb-4">
        <span className="eyebrow">Cuenta de cliente</span>
        <h1 className="h2 mt-3">Regístrate</h1>
        <p className="text-secondary">Crea una cuenta para solicitar y revisar tus citas.</p>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo}`} role="alert">
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-3">
          {/* Nombre */}
          <div className="col-md-6">
            <label htmlFor="nombre" className="form-label">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
              maxLength={50}
              value={formData.nombre}
              onChange={handleChange}
            />
            {errors.nombre && <div className="invalid-feedback d-block">{errors.nombre}</div>}
          </div>

          {/* Apellidos */}
          <div className="col-md-6">
            <label htmlFor="apellidos" className="form-label">Apellidos</label>
            <input
              type="text"
              id="apellidos"
              name="apellidos"
              className={`form-control ${errors.apellidos ? "is-invalid" : ""}`}
              maxLength={100}
              value={formData.apellidos}
              onChange={handleChange}
            />
            {errors.apellidos && <div className="invalid-feedback d-block">{errors.apellidos}</div>}
          </div>

          {/* RUN */}
          <div className="col-md-6">
            <label htmlFor="rut" className="form-label">RUN</label>
            <input
              type="text"
              id="rut"
              name="rut"
              className={`form-control ${errors.rut ? "is-invalid" : ""}`}
              placeholder="19011022-K"
              value={formData.rut}
              onChange={handleChange}
            />
            {errors.rut && <div className="invalid-feedback d-block">{errors.rut}</div>}
          </div>

          {/* Email */}
          <div className="col-md-6">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
          </div>

          {/* Contraseña */}
          <div className="col-md-6">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              minLength={4}
              maxLength={10}
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
          </div>

          {/* Confirmar Contraseña */}
          <div className="col-md-6">
            <label htmlFor="confirmarPassword" className="form-label">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmarPassword"
              name="confirmarPassword"
              className={`form-control ${errors.confirmarPassword ? "is-invalid" : ""}`}
              value={formData.confirmarPassword}
              onChange={handleChange}
            />
            {errors.confirmarPassword && <div className="invalid-feedback d-block">{errors.confirmarPassword}</div>}
          </div>

          {/* Región */}
          <div className="col-md-6">
            <label htmlFor="region" className="form-label">Región</label>
            <select
              id="region"
              name="region"
              className="form-select"
              value={formData.region}
              onChange={handleChange}
            >
              <option value="">Selecciona Región</option>
              <option value="Valparaíso">Valparaíso</option>
              <option value="Metropolitana">Región Metropolitana</option>
            </select>
          </div>

          {/* Comuna */}
          <div className="col-md-6">
            <label htmlFor="comuna" className="form-label">Comuna</label>
            <select
              id="comuna"
              name="comuna"
              className="form-select"
              value={formData.comuna}
              onChange={handleChange}
            >
              <option value="">Selecciona Comuna</option>
              <option value="Viña del Mar">Viña del Mar</option>
              <option value="Valparaíso">Valparaíso</option>
              <option value="Quilpué">Quilpué</option>
            </select>
          </div>

          {/* Dirección */}
          <div className="col-12">
            <label htmlFor="direccion" className="form-label">Dirección</label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              className={`form-control ${errors.direccion ? "is-invalid" : ""}`}
              maxLength={300}
              value={formData.direccion}
              onChange={handleChange}
            />
            {errors.direccion && <div className="invalid-feedback d-block">{errors.direccion}</div>}
          </div>

          {/* Botón Submit */}
          <div className="col-12 d-grid mt-4">
            <button className="btn btn-primary btn-lg" type="submit">
              Crear cuenta
            </button>
          </div>
        </div>
      </form>

      <p className="text-center mt-4 mb-0">
        ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>.
      </p>
    </div>
  );
};