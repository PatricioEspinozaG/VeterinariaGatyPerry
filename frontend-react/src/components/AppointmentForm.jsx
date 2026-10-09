import { useState } from 'react';
import { useNavigate } from 'react-router';
import { readStorage } from '../services/storage.js';

export default function AppointmentForm({ currentUserId, onAddAppointment }) {
  const navigate = useNavigate();

  const [mascotas] = useState(() => {
    const userId = currentUserId || localStorage.getItem('currentUserId');
    return readStorage('pets', []).filter((pet) => pet.userId === userId);
  });
  const [formData, setFormData] = useState({
    petId: '',
    servicio: 'Consulta General',
    fecha: '',
    hora: '',
    motivo: ''
  });

  const [errors, setErrors] = useState({});
  const [mensaje, setMensaje] = useState(null);

  const selectedPetId = formData.petId || mascotas[0]?.id || '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!selectedPetId) {
      newErrors.petId = 'Debes seleccionar una mascota.';
    }

    if (!formData.servicio) {
      newErrors.servicio = 'Selecciona un servicio.';
    }

    if (!formData.fecha) {
      newErrors.fecha = 'Selecciona una fecha.';
    } else {
      const hoy = new Date().toISOString().split('T')[0];
      if (formData.fecha < hoy) {
        newErrors.fecha = 'La fecha no puede ser anterior a hoy.';
      }
    }

    if (!formData.hora) {
      newErrors.hora = 'Selecciona una hora.';
    }

    if (!formData.motivo.trim() || formData.motivo.length > 200) {
      newErrors.motivo = 'Motivo obligatorio (máximo 200 caracteres).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMensaje(null);

    if (!validate()) return;

    const userId = currentUserId || localStorage.getItem('currentUserId');
    const mascotaSeleccionada = mascotas.find((m) => m.id === selectedPetId);

    const nuevaCita = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      userId: userId || 'invitado',
      petId: selectedPetId,
      petName: mascotaSeleccionada ? mascotaSeleccionada.nombre : 'Mascota',
      servicio: formData.servicio,
      fecha: formData.fecha,
      hora: formData.hora,
      motivo: formData.motivo.trim(),
      estado: 'Pendiente'
    };

    if (onAddAppointment) {
      onAddAppointment(nuevaCita);
    } else {
      const citasGuardadas = JSON.parse(localStorage.getItem('appointments')) || [];
      localStorage.setItem('appointments', JSON.stringify([...citasGuardadas, nuevaCita]));
    }

    setMensaje({ tipo: 'success', texto: '¡Cita agendada exitosamente!' });

    setTimeout(() => {
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
                  📅 AGENDAR CITA
                </span>
                <h1 className="h3 fw-bold mt-3 mb-1 text-dark">Reserva Veterinaria</h1>
                <p className="text-muted small">Selecciona los datos para programar la atención de tu mascota.</p>
              </div>

              {/* Alerta de mensaje */}
              {mensaje && (
                <div className={`alert alert-${mensaje.tipo} rounded-3 text-center`} role="alert">
                  {mensaje.texto}
                </div>
              )}

              {/* Advertencia si no hay mascotas registradas */}
              {mascotas.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">Aún no tienes mascotas registradas para agendar una cita.</p>
                  <button
                    className="btn btn-outline-dark rounded-pill fw-semibold px-4 py-2"
                    onClick={() => navigate('/mascotas/nueva')}
                  >
                    🐾 Registrar Mascota Primero
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="row g-3">
                    
                    {/* Seleccionar Mascota */}
                    <div className="col-12 col-md-6 text-start">
                      <label htmlFor="petId" className="form-label fw-medium text-dark small">Mascota</label>
                      <select
                        id="petId"
                        name="petId"
                        className={`form-select rounded-3 ${errors.petId ? 'is-invalid' : ''}`}
                        value={selectedPetId}
                        onChange={handleChange}
                      >
                        {mascotas.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nombre} ({m.especie})
                          </option>
                        ))}
                      </select>
                      {errors.petId && <div className="invalid-feedback d-block">{errors.petId}</div>}
                    </div>

                    {/* Servicio */}
                    <div className="col-12 col-md-6 text-start">
                      <label htmlFor="servicio" className="form-label fw-medium text-dark small">Servicio</label>
                      <select
                        id="servicio"
                        name="servicio"
                        className={`form-select rounded-3 ${errors.servicio ? 'is-invalid' : ''}`}
                        value={formData.servicio}
                        onChange={handleChange}
                      >
                        <option value="Consulta General">Consulta General</option>
                        <option value="Vacunación">Vacunación</option>
                        <option value="Desparasitación">Desparasitación</option>
                        <option value="Control">Control Médico</option>
                        <option value="Urgencia">Urgencia</option>
                      </select>
                      {errors.servicio && <div className="invalid-feedback d-block">{errors.servicio}</div>}
                    </div>

                    {/* Fecha */}
                    <div className="col-12 col-md-6 text-start">
                      <label htmlFor="fecha" className="form-label fw-medium text-dark small">Fecha</label>
                      <input
                        type="date"
                        id="fecha"
                        name="fecha"
                        className={`form-control rounded-3 ${errors.fecha ? 'is-invalid' : ''}`}
                        value={formData.fecha}
                        onChange={handleChange}
                      />
                      {errors.fecha && <div className="invalid-feedback d-block">{errors.fecha}</div>}
                    </div>

                    {/* Hora */}
                    <div className="col-12 col-md-6 text-start">
                      <label htmlFor="hora" className="form-label fw-medium text-dark small">Hora</label>
                      <select
                        id="hora"
                        name="hora"
                        className={`form-select rounded-3 ${errors.hora ? 'is-invalid' : ''}`}
                        value={formData.hora}
                        onChange={handleChange}
                      >
                        <option value="">Selecciona Hora</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="16:00">04:00 PM</option>
                        <option value="17:00">05:00 PM</option>
                      </select>
                      {errors.hora && <div className="invalid-feedback d-block">{errors.hora}</div>}
                    </div>

                    {/* Motivo */}
                    <div className="col-12 text-start">
                      <label htmlFor="motivo" className="form-label fw-medium text-dark small">Motivo de la consulta</label>
                      <textarea
                        id="motivo"
                        name="motivo"
                        rows="3"
                        className={`form-control rounded-3 ${errors.motivo ? 'is-invalid' : ''}`}
                        placeholder="Describe brevemente el motivo de la atención..."
                        value={formData.motivo}
                        onChange={handleChange}
                      ></textarea>
                      {errors.motivo && <div className="invalid-feedback d-block">{errors.motivo}</div>}
                    </div>

                    {/* Botón Agendar */}
                    <div className="col-12 text-center mt-4">
                      <button className="btn btn-registro-custom btn-lg px-5 py-2 rounded-pill fw-semibold shadow-sm fs-6" type="submit">
                        Confirmar Cita
                      </button>
                    </div>

                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
