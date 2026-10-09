import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function PetForm({ currentUserId, onAddPet }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    especie: 'Perro',
    raza: '',
    edad: '',
    sexo:'',
    notas: ''
  });

  const [errors, setErrors] = useState({});
  const [mensaje, setMensaje] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim() || formData.nombre.length > 30) {
      newErrors.nombre = 'Nombre obligatorio (máximo 30 caracteres).';
    }

    if (!formData.especie) {
      newErrors.especie = 'Selecciona una especie.';
    }

    if (!formData.raza.trim() || formData.raza.length > 30) {
      newErrors.raza = 'Raza obligatoria (máximo 30 caracteres).';
    }

    if (!formData.edad || isNaN(formData.edad) || Number(formData.edad) < 0 || Number(formData.edad) > 30) {
      newErrors.edad = 'Ingresa una edad válida entre 0 y 30 años.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMensaje(null);

    if (!validate()) return;

    // Obtener ID del usuario activo si no viene por prop
    const userId = currentUserId || localStorage.getItem('currentUserId');

    const nuevaMascota = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      userId: userId || 'invitado',
      nombre: formData.nombre.trim(),
      especie: formData.especie,
      raza: formData.raza.trim(),
      edad: Number(formData.edad),
      notas: formData.notas.trim()
    };

    if (onAddPet) {
      onAddPet(nuevaMascota);
    } else {
      const mascotasGuardadas = JSON.parse(localStorage.getItem('pets')) || [];
      localStorage.setItem('pets', JSON.stringify([...mascotasGuardadas, nuevaMascota]));
    }

    setMensaje({ tipo: 'success', texto: '¡Mascota registrada exitosamente!' });

    setTimeout(() => {
      // Si tienes ruta para ver las mascotas o agendar cita
      navigate('/');
    }, 1200);
  };

  return (
    <div className="bg-vet-doodle min-vh-100 py-5 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow border-0 rounded-4 p-3 p-md-4 bg-white">
              
              {/* Encabezado */}
              <div className="text-center mb-4">
                <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7">
                  🐾 REGISTRO DE MASCOTA
                </span>
                <h1 className="h3 fw-bold mt-3 mb-1 text-dark">Registrar Mascota</h1>
                <p className="text-muted small">Ingresa la información de tu mascota para agendar atenciones.</p>
              </div>

              {/* Alerta de mensaje */}
              {mensaje && (
                <div className={`alert alert-${mensaje.tipo} rounded-3 text-center`} role="alert">
                  {mensaje.texto}
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  
                  {/* Nombre Mascota */}
                  <div className="col-12 col-md-6 text-start">
                    <label htmlFor="nombre" className="form-label fw-medium text-dark small">Nombre de la mascota</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      className={`form-control rounded-3 ${errors.nombre ? 'is-invalid' : ''}`}
                      placeholder="Ej. Firulais"
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                    {errors.nombre && <div className="invalid-feedback d-block">{errors.nombre}</div>}
                  </div>

                  {/* Especie */}
                  <div className="col-12 col-md-6 text-start">
                    <label htmlFor="especie" className="form-label fw-medium text-dark small">Especie</label>
                    <select
                      id="especie"
                      name="especie"
                      className={`form-select rounded-3 ${errors.especie ? 'is-invalid' : ''}`}
                      value={formData.especie}
                      onChange={handleChange}
                    >
                      <option value="Perro">Perro</option>
                      <option value="Gato">Gato</option>
                      <option value="Ave">Ave</option>
                      <option value="Exótico">Exótico / Otro</option>
                    </select>
                    {errors.especie && <div className="invalid-feedback d-block">{errors.especie}</div>}
                  </div>

                  {/* Raza */}
                  <div className="col-12 col-md-6 text-start">
                    <label htmlFor="raza" className="form-label fw-medium text-dark small">Raza</label>
                    <input
                      type="text"
                      id="raza"
                      name="raza"
                      className={`form-control rounded-3 ${errors.raza ? 'is-invalid' : ''}`}
                      placeholder="Ej. Poodle, Mestizo, Siames"
                      value={formData.raza}
                      onChange={handleChange}
                    />
                    {errors.raza && <div className="invalid-feedback d-block">{errors.raza}</div>}
                  </div>

                  {/* Edad */}
                  <div className="col-12 col-md-6 text-start">
                    <label htmlFor="edad" className="form-label fw-medium text-dark small">Edad (años)</label>
                    <input
                      type="number"
                      id="edad"
                      name="edad"
                      className={`form-control rounded-3 ${errors.edad ? 'is-invalid' : ''}`}
                      placeholder="Ej. 3"
                      min="0"
                      max="30"
                      value={formData.edad}
                      onChange={handleChange}
                    />
                    {errors.edad && <div className="invalid-feedback d-block">{errors.edad}</div>}
                  </div>

                  <div className="col-md-6 text-start">
                <label className="form-label fw-medium text-dark small">Sexo</label>
                <select
                name="sexo"
                className="form-select rounded-3"
                value={formData.sexo}
                onChange={handleChange}
                >
                 <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                </select>
                    </div>

                  {/* Observaciones / Notas */}
                  <div className="col-12 text-start">
                    <label htmlFor="notas" className="form-label fw-medium text-dark small">Observaciones o Alergias (Opcional)</label>
                    <textarea
                      id="notas"
                      name="notas"
                      rows="2"
                      className="form-control rounded-3"
                      placeholder="Ej. Alérgico a la penicilina, agresivo con otros animales..."
                      value={formData.notas}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  {/* Botón Guardar */}
                  <div className="col-12 text-center mt-4">
                    <button className="btn btn-registro-custom btn-lg px-5 py-2 rounded-pill fw-semibold shadow-sm fs-6" type="submit">
                      Guardar Mascota
                    </button>
                  </div>

                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
