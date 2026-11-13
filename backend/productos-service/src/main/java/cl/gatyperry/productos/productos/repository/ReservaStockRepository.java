package cl.gatyperry.productos.productos.repository;

import cl.gatyperry.productos.productos.model.ReservaStock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservaStockRepository
    extends JpaRepository<ReservaStock, String> {
}
