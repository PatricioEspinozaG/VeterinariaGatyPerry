package cl.gatyperry.clinica.repository;

import cl.gatyperry.clinica.model.Atencion;
import cl.gatyperry.clinica.model.EstadoRegistro;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AtencionRepository extends JpaRepository<Atencion, Long> {

    boolean existsByCitaIdAndEstado(Long citaId, EstadoRegistro estado);

    List<Atencion> findByMascotaIdOrderByFechaAtencionDescIdDesc(
        Long mascotaId,
        Pageable pageable
    );
}
