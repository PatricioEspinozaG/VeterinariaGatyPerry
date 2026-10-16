import { useState, useEffect } from 'react'

function generateCode() {
  return `ME${Math.floor(100 + Math.random() * 900)}`
}

export default function AdminProductForm({ product, onCreate, onUpdate, onCancel }) {
  const [form, setForm] = useState({ code: '', name: '', category: '', price: '', stock: 0, status: 'Disponible' })

  useEffect(() => {
    if (product) setForm({ code: product.code, name: product.name || product.title || '', category: product.category || '', price: product.price || '', stock: product.stock ?? 0, status: product.status || 'Disponible' })
    else setForm({ code: generateCode(), name: '', category: '', price: '', stock: 0, status: 'Disponible' })
  }, [product])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((s) => ({ ...s, [name]: name === 'stock' ? Number(value) : value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = { ...form }
    if (product) {
      onUpdate && onUpdate(product.code, payload)
    } else {
      onCreate && onCreate(payload)
      setForm((s) => ({ ...s, code: generateCode(), name: '', category: '', price: '', stock: 0 }))
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label>Codigo
        <input name="code" value={form.code} onChange={handleChange} disabled />
      </label>

      <label>Nombre
        <input name="name" value={form.name} onChange={handleChange} required />
      </label>

      <label>Categoria
        <input name="category" value={form.category} onChange={handleChange} />
      </label>

      <label>Precio
        <input name="price" value={form.price} onChange={handleChange} />
      </label>

      <label>Stock
        <input type="number" name="stock" value={form.stock} onChange={handleChange} />
      </label>

      <label>Estado
        <select name="status" value={form.status} onChange={handleChange}>
          <option>Disponible</option>
          <option>Agotado</option>
          <option>Descontinuado</option>
        </select>
      </label>

      <div className="form-actions">
        <button type="submit" className="btn btn-registro-custom">{product ? 'Guardar' : 'Crear'}</button>
        {product ? <button type="button" className="btn" onClick={onCancel}>Cancelar</button> : null}
      </div>
    </form>
  )
}
