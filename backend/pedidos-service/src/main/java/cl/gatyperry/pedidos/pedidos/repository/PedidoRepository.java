package cl.gatyperry.pedidos.pedidos.repository;

import cl.gatyperry.pedidos.pedidos.model.Pedido;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PedidoRepository extends JpaRepository<Pedido, String> {

    @EntityGraph(attributePaths = "items")
    @Query("select p from Pedido p where p.id = :id")
    Optional<Pedido> buscarConItems(@Param("id") String id);

    @EntityGraph(attributePaths = "items")
    List<Pedido> findAllByUserIdOrderByCreadoEnDesc(Long userId);
}
