package cl.gatyperry.clinica.repository;

import cl.gatyperry.clinica.model.Vacuna;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VacunaRepository extends JpaRepository<Vacuna, Long> {

    List<Vacuna> findByMascotaIdOrderByFechaAplicacionDescIdDesc(
        Long mascotaId,
        Pageable pageable
    );
}
