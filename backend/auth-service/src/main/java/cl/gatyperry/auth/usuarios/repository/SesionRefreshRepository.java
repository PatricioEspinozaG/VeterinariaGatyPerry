package cl.gatyperry.auth.usuarios.repository;

import cl.gatyperry.auth.usuarios.model.SesionRefresh;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface SesionRefreshRepository
    extends JpaRepository<SesionRefresh, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT s
        FROM SesionRefresh s
        JOIN FETCH s.usuario
        WHERE s.tokenHash = :hash
        """)
    Optional<SesionRefresh> buscarPorHashParaActualizar(
        @Param("hash") String hash
    );

    @Modifying
    @Query("""
        UPDATE SesionRefresh s
        SET s.revocadoEn = :instante
        WHERE s.familiaId = :familiaId
          AND s.revocadoEn IS NULL
        """)
    int revocarFamilia(
        @Param("familiaId") UUID familiaId,
        @Param("instante") Instant instante
    );
}