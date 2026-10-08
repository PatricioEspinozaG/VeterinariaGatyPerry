import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function AppointmentsList({ userRole = 'cliente', currentUserId }) {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todas');

  useEffect(() => {
    cargarCitas();
  }, [currentUserId, userRole]);

  const cargarCitas = () => {
    const todasLasCitas = JSON.parse(localStorage.getItem('appointments')) || [];
    const userId = currentUserId || localStorage.getItem('currentUserId');

    // Si es cliente solo ve sus citas; si es admin/recepcion ve todas
    if (userRole === 'cliente') {
      setCitas(todasLasCitas.filter((c) => c.userId === userId));
    } else {
      setCitas(todasLasCitas);
    }
  };

  const handleCambiarEstado = (id, nuevoEstado) => {
    const todasLasCitas = JSON.parse(localStorage.getItem('appointments')) || [];
    const actualizadas = todasLasCitas.map((c) =>
      c.id === id ? { ...c, estado: nuevoEstado } : c
    );
    localStorage.setItem('appointments', JSON.stringify(actualizadas));
    cargarCitas();
  };

  const citasFiltradas = citas.filter((c) => {
    if (filtroEstado === 'todas') return true;
    return c.estado.toLowerCase() === filtroEstado.toLowerCase();
  });

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-warning text-dark';
      case 'Confirmada':
        return 'bg-info text-dark';
      case 'Completada':
        return 'bg-success text-white';
      case 'Cancelada':
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  return (
    <div className="bg-vet-doodle min-vh-100 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card shadow border-0 rounded-4 p-4 bg-white">
              
              {/* Encabezado */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                <div>
                  <span className="badge bg-light text-secondary border rounded-pill px-3 py-2 fw-semibold fs-7 mb-2 d-inline-block">
                    📋 GESTIÓN DE CITAS
                  </span>
                  <h1 className="h3 fw-bold text-dark mb-0">Citas Veterinarias</h1>
                </div>
                <button
                  className="btn btn-registro-custom px-4 py-2 rounded-pill fw-semibold shadow-sm"
                  onClick={() => navigate('/citas/nueva')}
                >
                  + Agendar Nueva Cita
                </button>
              </div>

              {/* Filtros */}
              <div className="row mb-4">
                <div className="col-12 col-md-4">
                  <label htmlFor="filtroEstado" className="form-label fw-medium text-dark small">Filtrar por estado:</label>
                  <select
                    id="filtroEstado"
                    className="form-select rounded-3"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="todas">Todas las citas</option>
                    <option value="Pendiente">Pendientes</option>
                    <option value="Confirmada">Confirmadas</option>
                    <option value="Completada">Completadas</option>
                    <option value="Cancelada">Canceladas</option>
                  </select>
                </div>
              </div>

              {/* Tabla de Citas */}
              {citasFiltradas.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No hay citas registradas en esta categoría.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Mascota</th>
                        <th>Servicio</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citasFiltradas.map((cita) => (
                        <tr key={cita.id}>
                          <td className="fw-semibold text-dark">{cita.petName}</td>
                          <td>{cita.servicio}</td>
                          <td>{cita.fecha}</td>
                          <td>{cita.hora} hrs</td>
                          <td>
                            <span className={`badge rounded-pill px-3 py-2 ${getBadgeClass(cita.estado)}`}>
                              {cita.estado}
                            </span>
                          </td>
                          <td>
                            {userRole !== 'cliente' ? (
                              <select
                                className="form-select form-select-sm rounded-3"
                                value={cita.estado}
                                onChange={(e) => handleCambiarEstado(cita.id, e.target.value)}
                              >
                                <option value="Pendiente">Pendiente</option>
                                <option value="Confirmada">Confirmar</option>
                                <option value="Completada">Completar</option>
                                <option value="Cancelada">Cancelar</option>
                              </select>
                            ) : (
                              cita.estado === 'Pendiente' && (
                                <button
                                  className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                  onClick={() => handleCambiarEstado(cita.id, 'Cancelada')}
                                >
                                  Cancelar
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}