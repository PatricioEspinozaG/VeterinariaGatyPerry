package cl.gatyperry.productos.productos.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "PRODUCTOS")
public class Producto {

    @Id
    @Column(name = "CODIGO", length = 12)
    private String codigo;

    @Column(name = "CATEGORIA", nullable = false, length = 60)
    private String categoria;

    @Column(name = "NOMBRE", nullable = false, length = 120)
    private String nombre;

    @Column(name = "PRINCIPIO_ACTIVO", length = 120)
    private String principioActivo;

    @Column(name = "PRESENTACION", length = 120)
    private String presentacion;

    @Column(name = "ESPECIES", length = 80)
    private String especies;

    @Column(name = "STOCK", nullable = false)
    private Integer stock;

    @Column(name = "PRECIO", nullable = false)
    private Long precio;

    @Column(name = "STOCK_CRITICO", nullable = false)
    private Integer stockCritico;

    @Column(name = "ACTIVO", nullable = false)
    private boolean activo = true;

    @Version
    @Column(name = "VERSION", nullable = false)
    private Long version;

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getPrincipioActivo() {
        return principioActivo;
    }

    public void setPrincipioActivo(String principioActivo) {
        this.principioActivo = principioActivo;
    }

    public String getPresentacion() {
        return presentacion;
    }

    public void setPresentacion(String presentacion) {
        this.presentacion = presentacion;
    }

    public String getEspecies() {
        return especies;
    }

    public void setEspecies(String especies) {
        this.especies = especies;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public Long getPrecio() {
        return precio;
    }

    public void setPrecio(Long precio) {
        this.precio = precio;
    }

    public Integer getStockCritico() {
        return stockCritico;
    }

    public void setStockCritico(Integer stockCritico) {
        this.stockCritico = stockCritico;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public Long getVersion() {
        return version;
    }
}
