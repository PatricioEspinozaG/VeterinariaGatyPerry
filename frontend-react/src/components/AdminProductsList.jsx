import React from 'react'

export default function AdminProductsList({ products = [], onEdit, onDelete }) {
  return (
    <div className="admin-table">
      <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
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
              <td><strong>{p.code}</strong></td>
              <td>{p.name || p.title || p.product || '-'}</td>
              <td>{p.category || '-'}</td>
              <td>{p.price ? `$${p.price}` : '-'}</td>
              <td>{p.stock ?? '-'}</td>
              <td>{p.status || (p.stock > 0 ? 'Disponible' : 'Agotado')}</td>
              <td className="action-cell">
                <div className="action-buttons">
                  <button className="btn btn-edit" onClick={() => onEdit && onEdit(p)}>Editar</button>
                  <button className="btn btn-delete" onClick={() => onDelete && onDelete(p.code)}>Eliminar</button>
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
