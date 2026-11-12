package cl.gatyperry.pedidos.pedidos.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "PEDIDOS")
public class Pedido {

    @Id
    @Column(name = "ID", length = 36)
    private String id;

    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "NOMBRE_CLIENTE", nullable = false, length = 120)
    private String nombreCliente;

    @Column(name = "EMAIL_CLIENTE", nullable = false, length = 254)
    private String emailCliente;

    @Column(name = "METODO_ENTREGA", nullable = false, length = 10)
    private String metodoEntrega;

    @Column(name = "REGION", length = 80)
    private String region;

    @Column(name = "COMUNA", length = 80)
    private String comuna;

    @Column(name = "DIRECCION", length = 200)
    private String direccion;

    @Column(name = "SUBTOTAL", nullable = false)
    private Long subtotal;

    @Column(name = "ENVIO", nullable = false)
    private Long envio;

    @Column(name = "TOTAL", nullable = false)
    private Long total;

    @Column(name = "ESTADO", nullable = false, length = 20)
    private String estado = "REGISTRADO";

    @Column(name = "CREADO_EN", nullable = false)
    private Instant creadoEn;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoItem> items = new ArrayList<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getNombreCliente() {
        return nombreCliente;
    }

    public void setNombreCliente(String nombreCliente) {
        this.nombreCliente = nombreCliente;
    }

    public String getEmailCliente() {
        return emailCliente;
    }

    public void setEmailCliente(String emailCliente) {
        this.emailCliente = emailCliente;
    }

    public String getMetodoEntrega() {
        return metodoEntrega;
    }

    public void setMetodoEntrega(String metodoEntrega) {
        this.metodoEntrega = metodoEntrega;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getComuna() {
        return comuna;
    }

    public void setComuna(String comuna) {
        this.comuna = comuna;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public Long getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Long subtotal) {
        this.subtotal = subtotal;
    }

    public Long getEnvio() {
        return envio;
    }

    public void setEnvio(Long envio) {
        this.envio = envio;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Instant getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(Instant creadoEn) {
        this.creadoEn = creadoEn;
    }

    public List<PedidoItem> getItems() {
        return items;
    }

    public void addItem(PedidoItem item) {
        item.setPedido(this);
        items.add(item);
    }
}
