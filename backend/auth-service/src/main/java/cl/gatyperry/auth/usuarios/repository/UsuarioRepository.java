package cl.gatyperry.auth.usuarios.repository;

import cl.gatyperry.auth.usuarios.model.Usuario;
import cl.gatyperry.auth.usuarios.model.Rol;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByRun(String run);

    List<Usuario> findAllByRolAndActivoTrueOrderByApellidosAscNombreAsc(
        Rol rol
    );
}