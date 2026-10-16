export default function AdminProductsList({ products = [], onEdit, onDelete }) {
  return (
    <div className="admin-table">
      <div className="table-responsive">
      <table className="table table-hover align-middle mb-0 admin-products-table">
        <thead className="table-light">
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.code}>
              <td data-label="Código"><strong>{p.code}</strong></td>
              <td data-label="Producto">{p.name || p.title || p.product || '-'}</td>
              <td data-label="Categoría">{p.category || '-'}</td>
              <td data-label="Precio">{p.price ? `$${p.price}` : '-'}</td>
              <td data-label="Stock">{p.stock ?? '-'}</td>
              <td data-label="Estado">{p.status || (p.stock > 0 ? 'Disponible' : 'Agotado')}</td>
              <td className="action-cell" data-label="Acciones">
                <div className="action-buttons">
                  <button className="btn btn-edit" type="button" onClick={() => onEdit && onEdit(p)}>Editar</button>
                  <button className="btn btn-delete" type="button" onClick={() => onDelete && onDelete(p.code)}>Eliminar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}
