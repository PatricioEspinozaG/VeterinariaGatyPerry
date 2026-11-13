package cl.gatyperry.citas.citas.service;

import cl.gatyperry.citas.citas.model.Cita;
import cl.gatyperry.citas.citas.model.EstadoCita;
import cl.gatyperry.citas.citas.repository.CitaRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DisponibilidadService {

    private static final List<EstadoCita> ESTADOS_ACTIVOS = List.of(
        EstadoCita.PENDIENTE,
        EstadoCita.CONFIRMADA
    );

    private final CitaRepository repository;

    public DisponibilidadService(CitaRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<LocalTime> horasLibres(LocalDate fecha) {
        LocalDateTime ahora = LocalDateTime.now(HorarioCitas.ZONA_CLINICA);

        if (fecha.isBefore(ahora.toLocalDate())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La fecha no puede ser pasada"
            );
        }

        if (fecha.getDayOfWeek() == DayOfWeek.SUNDAY) {
            return List.of();
        }

        List<Cita> ocupadas =
            repository.findAllByFechaHoraGreaterThanEqualAndFechaHoraLessThanAndEstadoIn(
                fecha.atStartOfDay(),
                fecha.plusDays(1).atStartOfDay(),
                ESTADOS_ACTIVOS
            );

        Set<LocalTime> horasOcupadas = ocupadas.stream()
            .map(cita -> cita.getFechaHora().toLocalTime())
            .collect(Collectors.toSet());

        return HorarioCitas.HORAS.stream()
            .filter(hora -> fecha.atTime(hora).isAfter(ahora))
            .filter(hora -> !horasOcupadas.contains(hora))
            .toList();
    }
}