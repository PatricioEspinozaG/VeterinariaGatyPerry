-- Las atenciones sin cita pueden seguir registrándose de forma independiente.
-- Una atención anulada conserva el historial y permite corregir el registro.
CREATE UNIQUE INDEX ux_atenciones_cita_activa ON atenciones (cita_id)
    WHERE cita_id IS NOT NULL AND estado = 'ACTIVA';
