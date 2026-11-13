package cl.gatyperry.productos.productos.repository;

import cl.gatyperry.productos.productos.model.Producto;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductoRepository extends JpaRepository<Producto, String> {

    List<Producto> findAllByActivoTrueOrderByCodigoAsc();

    List<Producto> findAllByOrderByCodigoAsc();

    Optional<Producto> findByCodigoAndActivoTrue(String codigo);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Producto p where p.codigo = :codigo")
    Optional<Producto> findByCodigoForUpdate(@Param("codigo") String codigo);
}
