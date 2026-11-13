package cl.gatyperry.citas.citas.repository;

import cl.gatyperry.citas.citas.model.Cita;
import cl.gatyperry.citas.citas.model.EstadoCita;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CitaRepository extends JpaRepository<Cita, Long> {

    List<Cita> findAllByUserIdOrderByFechaHoraDesc(Long userId);

    List<Cita> findAllByOrderByFechaHoraDesc();

    Optional<Cita> findByIdAndUserId(Long id, Long userId);

    boolean existsByFechaHoraAndEstadoIn(
        LocalDateTime fechaHora,
        List<EstadoCita> estados
    );

    boolean existsByFechaHoraAndEstadoInAndIdNot(
        LocalDateTime fechaHora,
        List<EstadoCita> estados,
        Long id
    );

    List<Cita> findAllByFechaHoraGreaterThanEqualAndFechaHoraLessThanAndEstadoIn(
        LocalDateTime inicio,
        LocalDateTime fin,
        List<EstadoCita> estados
    );
}