import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { login } from '../services/authApi.js'

export default function LoginForm({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña.')
      return
    }

    setLoading(true)

    try {
      const respuesta = await login(email.trim(), password)
      onLogin?.(respuesta.usuario)

      const destino = {
        ADMIN: '/admin',
        RECEPCION: '/recepcion',
        CLIENTE: '/mi-cuenta',
      }[respuesta.usuario.rol] || '/'

      navigate(destino, { replace: true })
    } catch (errorDeLogin) {
      setError(
        errorDeLogin.status === 401
          ? 'Correo o contraseña incorrectos.'
          : 'No pudimos iniciar sesión. Inténtalo nuevamente.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-vet-doodle login-page">
      <section className="section-space py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-7 col-lg-5">
              <div className="form-card login-card bg-white p-4 p-md-5 rounded-4 shadow-sm border">
                <div className="text-center mb-4">
                  <span className="eyebrow">Acceso</span>
                  <h1 className="h2 mt-3">Iniciar sesión</h1>
                  <p className="text-secondary small">
                    Ingresa con tu cuenta de Gaty Perry.
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger py-2 fs-6 text-center mb-3" role="alert">
                    {error}
                  </div>
                )}

                <form id="formLogin" onSubmit={handleSubmit} noValidate>
                  <div className="mb-3 text-start">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Correo
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="mb-4 text-start">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <button
                    className="button button-primary login-submit w-100"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Ingresando...' : 'Ingresar'}
                  </button>
                </form>

                <p className="text-center mb-0 mt-3 small">
                  ¿No tienes cuenta?{' '}
                  <Link to="/registro" className="fw-semibold">
                    Regístrate
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}