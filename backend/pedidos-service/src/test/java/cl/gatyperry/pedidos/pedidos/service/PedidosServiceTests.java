package cl.gatyperry.pedidos.pedidos.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.gatyperry.pedidos.pedidos.dto.EntregaRequest;
import cl.gatyperry.pedidos.pedidos.dto.LineaPedidoRequest;
import cl.gatyperry.pedidos.pedidos.dto.PedidoRequest;
import cl.gatyperry.pedidos.pedidos.model.Pedido;
import cl.gatyperry.pedidos.pedidos.model.PedidoItem;
import cl.gatyperry.pedidos.pedidos.repository.PedidoRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class PedidosServiceTests {

    @Mock
    private PedidoRepository repository;

    @Mock
    private PedidoPersistenceService persistence;

    @Mock
    private ProductosClient productosClient;

    @InjectMocks
    private PedidosService service;

    @Test
    void compraInvitadoUsaPrecioDeCatalogoYCalculaEnvioEnServidor() {
        String id = UUID.randomUUID().toString();
        var producto = new ProductosClient.ProductoReservado(
            "ME001",
            "Amoxibay",
            2,
            4200L
        );
        Pedido pedido = pedido(id, 8400, 3990);

        when(repository.buscarConItems(id)).thenReturn(Optional.empty());
        when(productosClient.reservar(eq(id), anyList()))
            .thenReturn(List.of(producto));
        when(persistence.guardar(
            eq(id),
            isNull(),
            eq("Ana"),
            eq("ana@example.com"),
            eq("envio"),
            eq("Metropolitana"),
            eq("Santiago"),
            eq("Calle 1"),
            eq(8400L),
            eq(3990L),
            anyList()
        )).thenReturn(pedido);

        var response = service.crear(
            null,
            new PedidoRequest(
                List.of(new LineaPedidoRequest("ME001", 2)),
                new EntregaRequest(
                    " Ana ",
                    "ana@example.com",
                    "envio",
                    "Metropolitana",
                    "Santiago",
                    "Calle 1"
                )
            ),
            id
        );

        assertEquals(id, response.id());
        assertEquals(8400L, response.subtotal());
        assertEquals(3990L, response.shipping());
        assertEquals(12390L, response.total());
        verify(productosClient).confirmar(id);
    }

    @Test
    void envioSinDireccionNoReservaStock() {
        assertThrows(
            ResponseStatusException.class,
            () -> service.crear(
                null,
                new PedidoRequest(
                    List.of(new LineaPedidoRequest("ME001", 1)),
                    new EntregaRequest(
                        "Ana",
                        "ana@example.com",
                        "envio",
                        "",
                        "",
                        ""
                    )
                ),
                UUID.randomUUID().toString()
            )
        );

        verify(productosClient, never()).reservar(anyString(), anyList());
        verify(persistence, never()).guardar(
            anyString(),
            any(),
            anyString(),
            anyString(),
            anyString(),
            anyString(),
            anyString(),
            anyString(),
            anyLong(),
            anyLong(),
            anyList()
        );
    }

    private Pedido pedido(String id, long subtotal, long envio) {
        Pedido pedido = new Pedido();
        pedido.setId(id);
        pedido.setNombreCliente("Ana");
        pedido.setEmailCliente("ana@example.com");
        pedido.setMetodoEntrega("envio");
        pedido.setRegion("Metropolitana");
        pedido.setComuna("Santiago");
        pedido.setDireccion("Calle 1");
        pedido.setSubtotal(subtotal);
        pedido.setEnvio(envio);
        pedido.setTotal(subtotal + envio);
        pedido.setCreadoEn(Instant.now());

        PedidoItem item = new PedidoItem();
        item.setCodigoProducto("ME001");
        item.setNombreProducto("Amoxibay");
        item.setCantidad(2);
        item.setPrecioUnitario(4200L);
        item.setTotalLinea(8400L);
        pedido.addItem(item);
        return pedido;
    }
}
