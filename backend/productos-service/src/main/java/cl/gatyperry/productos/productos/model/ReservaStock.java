package cl.gatyperry.productos.productos.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "RESERVAS_STOCK")
public class ReservaStock {

    @Id
    @Column(name = "ID_PEDIDO", length = 36)
    private String idPedido;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false, length = 12)
    private EstadoReserva estado = EstadoReserva.RESERVADA;

    @Column(name = "CREADA_EN", nullable = false)
    private Instant creadaEn;

    @OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReservaStockItem> items = new ArrayList<>();

    public String getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(String idPedido) {
        this.idPedido = idPedido;
    }

    public EstadoReserva getEstado() {
        return estado;
    }

    public void setEstado(EstadoReserva estado) {
        this.estado = estado;
    }

    public Instant getCreadaEn() {
        return creadaEn;
    }

    public void setCreadaEn(Instant creadaEn) {
        this.creadaEn = creadaEn;
    }

    public List<ReservaStockItem> getItems() {
        return items;
    }

    public void addItem(ReservaStockItem item) {
        item.setReserva(this);
        items.add(item);
    }
}
