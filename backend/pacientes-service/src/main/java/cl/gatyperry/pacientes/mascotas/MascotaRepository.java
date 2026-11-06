package cl.gatyperry.pacientes.mascotas;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MascotaRepository extends JpaRepository<Mascota, Long> {

    List<Mascota> findAllByUserIdOrderByNombreAsc(String userId);

    Optional<Mascota> findByIdAndUserId(Long id, String userId);
}