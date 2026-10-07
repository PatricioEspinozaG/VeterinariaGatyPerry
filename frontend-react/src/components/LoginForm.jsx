import React, { useState } from 'react';
import { useNavigate, Link } from "react-router";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [mensaje, setMensaje] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  // Expresión regular de correos permitidos de la entrega anterior
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Limpiar error del campo al escribir
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    // Validar correo
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Ingresa un correo permitido.';
      valid = false;
    }

    // Validar contraseña (entre 4 y 10 caracteres)
    if (!formData.password || formData.password.length < 4 || formData.password.length > 10) {
      newErrors.password = 'Debe tener entre 4 y 10 caracteres.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMensaje({ type: '', text: '' });

    if (!validate()) {
      return;
    }

    // Lógica de simulación académica o consulta a usuarios guardados
    const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Usuarios por defecto si no existen en localStorage
    const usuariosDefault = [
      { email: 'admin@duoc.cl', password: 'admin123', rol: 'admin' },
      { email: 'recepcion@duoc.cl', password: 'recep123', rol: 'recepcion' },
      { email: 'cliente@gmail.com', password: 'cliente1', rol: 'cliente' }
    ];

    const todosLosUsuarios = [...usuariosDefault, ...usuariosGuardados];

    const usuarioEncontrado = todosLosUsuarios.find(
      (u) => u.email.toLowerCase() === formData.email.toLowerCase() && u.password === formData.password
    );

    if (usuarioEncontrado) {
      // Guardar sesión activa en localStorage
      localStorage.setItem('usuarioActivo', JSON.stringify(usuarioEncontrado));
      setMensaje({ type: 'success', text: '¡Inicio de sesión exitoso! Redirigiendo...' });

      setTimeout(() => {
        navigate('/');
      }, 1200);
    } else {
      setMensaje({ type: 'danger', text: 'Credenciales incorrectas. Inténtalo nuevamente.' });
    }
  };

  return (
    <main className="bg-cream">
      <section className="section-space py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-7 col-lg-5">
              <div className="form-card bg-white p-4 p-md-5 rounded-4 shadow-sm border">
                
                {/* Encabezado */}
                <div className="text-center mb-4">
                  <span className="eyebrow">Acceso</span>
                  <h1 className="h2 mt-3">Iniciar sesión</h1>
                  <p className="text-secondary small">
                    Simulación académica con datos guardados en localStorage.
                  </p>
                </div>

                {/* Mensaje de estado (Exitoso / Error credenciales) */}
                {mensaje.text && (
                  <div className={`alert alert-${mensaje.type} py-2 fs-6 text-center mb-3`} role="alert">
                    {mensaje.text}
                  </div>
                )}

                {/* Formulario de Login */}
                <form id="formLogin" onSubmit={handleSubmit} noValidate>
                  
                  {/* Correo */}
                  <div className="mb-3 text-start">
                    <label htmlFor="email" className="form-label fw-semibold">Correo</label>
                    <input
                      id="email"
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <div className="invalid-feedback d-block">{errors.email}</div>
                    )}
                  </div>

                  {/* Contraseña */}
                  <div className="mb-4 text-start">
                    <label htmlFor="password" className="form-label fw-semibold">Contraseña</label>
                    <input
                      id="password"
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && (
                      <div className="invalid-feedback d-block">{errors.password}</div>
                    )}
                  </div>

                  {/* Botón Ingresar */}
                  <button className="btn btn-primary btn-lg w-100" type="submit">
                    Ingresar
                  </button>
                </form>

                {/* Caja Informativa con Datos de Demostración */}
                <div className="alert alert-light border mt-4 small text-start">
                  <strong>Administrador:</strong> admin@duoc.cl / admin123<br />
                  <strong>Recepción:</strong> recepcion@duoc.cl / recep123<br />
                  <strong>Cliente:</strong> cliente@gmail.com / cliente1
                </div>

                {/* Enlace a Registro */}
                <p className="text-center mb-0 mt-3 small">
                  ¿No tienes cuenta? <Link to="/registro" className="fw-semibold">Regístrate</Link>.
                </p>

              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}