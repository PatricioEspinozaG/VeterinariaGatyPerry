package cl.gatyperry.clinica.repository;

import cl.gatyperry.clinica.model.Atencion;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AtencionRepository extends JpaRepository<Atencion, Long> {

    List<Atencion> findByMascotaIdOrderByFechaAtencionDescIdDesc(
        Long mascotaId,
        Pageable pageable
    );
}
