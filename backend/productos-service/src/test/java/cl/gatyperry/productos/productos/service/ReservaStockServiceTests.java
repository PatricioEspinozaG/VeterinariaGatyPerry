package cl.gatyperry.productos.productos.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.gatyperry.productos.productos.dto.ReservaStockLinea;
import cl.gatyperry.productos.productos.dto.ReservaStockRequest;
import cl.gatyperry.productos.productos.model.Producto;
import cl.gatyperry.productos.productos.model.ReservaStock;
import cl.gatyperry.productos.productos.repository.ProductoRepository;
import cl.gatyperry.productos.productos.repository.ReservaStockRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ReservaStockServiceTests {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private ReservaStockRepository reservaRepository;

    @InjectMocks
    private ReservaStockService service;

    @Test
    void reservarDescuentaStockYGuardaElPrecioVigente() {
        Producto producto = producto("ME001", 5, 4200L);
        when(reservaRepository.findById("pedido-1"))
            .thenReturn(Optional.empty());
        when(productoRepository.findByCodigoForUpdate("ME001"))
            .thenReturn(Optional.of(producto));
        when(reservaRepository.save(any(ReservaStock.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.reservar(new ReservaStockRequest(
            "pedido-1",
            List.of(new ReservaStockLinea("ME001", 2))
        ));

        assertEquals(3, producto.getStock());
        assertEquals(4200L, response.get(0).unitPrice());
        assertEquals(2, response.get(0).quantity());
        verify(productoRepository).saveAll(any());
        verify(reservaRepository).save(any(ReservaStock.class));
    }

    @Test
    void reservarStockInsuficienteNoGuardaCambios() {
        Producto producto = producto("ME001", 1, 4200L);
        when(reservaRepository.findById("pedido-2"))
            .thenReturn(Optional.empty());
        when(productoRepository.findByCodigoForUpdate("ME001"))
            .thenReturn(Optional.of(producto));

        assertThrows(
            ResponseStatusException.class,
            () -> service.reservar(new ReservaStockRequest(
                "pedido-2",
                List.of(new ReservaStockLinea("ME001", 2))
            ))
        );

        assertEquals(1, producto.getStock());
        verify(productoRepository, never()).saveAll(any());
        verify(reservaRepository, never()).save(any(ReservaStock.class));
    }

    @Test
    void repetirReservaDevuelveElMismoSnapshotSinDescontarDeNuevo() {
        Producto producto = producto("ME001", 3, 4200L);
        ReservaStock reserva = new ReservaStock();
        reserva.setIdPedido("pedido-3");
        var item = new cl.gatyperry.productos.productos.model.ReservaStockItem();
        item.setCodigoProducto("ME001");
        item.setNombreProducto("Producto");
        item.setCantidad(2);
        item.setPrecioUnitario(4000L);
        reserva.addItem(item);
        when(reservaRepository.findById("pedido-3"))
            .thenReturn(Optional.of(reserva));

        var response = service.reservar(new ReservaStockRequest(
            "pedido-3",
            List.of(new ReservaStockLinea("ME001", 2))
        ));

        assertEquals(3, producto.getStock());
        assertEquals(4000L, response.get(0).unitPrice());
        verify(productoRepository, never()).findByCodigoForUpdate(any());
    }

    private Producto producto(String code, int stock, long price) {
        Producto producto = new Producto();
        producto.setCodigo(code);
        producto.setNombre("Producto");
        producto.setActivo(true);
        producto.setStock(stock);
        producto.setPrecio(price);
        return producto;
    }
}
