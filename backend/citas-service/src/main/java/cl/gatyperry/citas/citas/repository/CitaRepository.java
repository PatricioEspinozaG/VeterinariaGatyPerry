package cl.gatyperry.citas.citas.repository;

import cl.gatyperry.citas.citas.model.Cita;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CitaRepository extends JpaRepository<Cita, Long> {

    List<Cita> findAllByUserIdOrderByFechaHoraDesc(Long userId);

    List<Cita> findAllByOrderByFechaHoraDesc();

    Optional<Cita> findByIdAndUserId(Long id, Long userId);
}