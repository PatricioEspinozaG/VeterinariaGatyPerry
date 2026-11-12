package cl.gatyperry.productos.productos.dto;

import cl.gatyperry.productos.productos.model.Producto;

public record ProductoResponse(
    String code,
    String category,
    String name,
    String activeIngredient,
    String presentation,
    String species,
    Integer stock,
    Long price,
    Integer criticalStock,
    String status,
    Long version
) {
    public static ProductoResponse from(Producto producto) {
        String estado = !producto.isActivo()
            ? "Descontinuado"
            : producto.getStock() == 0 ? "Agotado" : "Disponible";
        return new ProductoResponse(
            producto.getCodigo(),
            producto.getCategoria(),
            producto.getNombre(),
            producto.getPrincipioActivo(),
            producto.getPresentacion(),
            producto.getEspecies(),
            producto.getStock(),
            producto.getPrecio(),
            producto.getStockCritico(),
            estado,
            producto.getVersion()
        );
    }
}
