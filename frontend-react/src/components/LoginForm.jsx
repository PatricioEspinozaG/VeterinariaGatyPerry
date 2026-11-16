import { useState } from 'react';
import { useNavigate, Link } from "react-router";

export default function LoginForm({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [mensaje, setMensaje] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Expresión regular de correos permitidos
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Ingresa un correo permitido (@duoc.cl, @profesor.duoc.cl, @gmail.com).';
      valid = false;
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ type: '', text: '' });

    if (!validate()) {
      return;
    }

    if (!onLogin) {
      setMensaje({ type: 'danger', text: 'El inicio de sesión no está disponible.' });
      return;
    }

    setSubmitting(true);
    try {
      await onLogin(formData);
      setMensaje({ type: 'success', text: '¡Inicio de sesión exitoso! Redirigiendo...' });
      navigate('/');
    } catch (error) {
      setMensaje({
        type: 'danger',
        text: error.message || 'No se pudo iniciar sesión.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-vet-doodle login-page">
      <section className="section-space py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-7 col-lg-5">
              <div className="form-card login-card bg-white p-4 p-md-5 rounded-4 shadow-sm border">
                
                {/* Encabezado */}
                <div className="text-center mb-4">
                  <span className="eyebrow">Acceso</span>
                  <h1 className="h2 mt-3">Iniciar sesión</h1>
                  <p className="text-secondary small">
                    Ingresa con tu cuenta de Gaty Perry.
                  </p>
                </div>

                {/* Mensaje de estado */}
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
                  <button className="button button-primary login-submit w-100" type="submit" disabled={submitting}>
                    {submitting ? 'Ingresando...' : 'Ingresar'}
                  </button>
                </form>

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
