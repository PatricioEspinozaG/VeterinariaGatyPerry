import { useState } from 'react'

function generateCode() {
  return `ME${Math.floor(100 + Math.random() * 900)}`
}

export default function AdminProductForm({ product, onCreate, onUpdate, onCancel }) {
  const [form, setForm] = useState(() => product
    ? {
      code: product.code,
      name: product.name || product.title || '',
      category: product.category || '',
      price: product.price ?? '',
      stock: product.stock ?? 0,
      status: product.status || 'Disponible',
    }
    : {
      code: generateCode(),
      name: '',
      category: '',
      price: '',
      stock: 0,
      status: 'Disponible',
    }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((current) => ({
      ...current,
      [name]: name === 'stock' ? Number(value) : value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    }

    try {
      if (product) {
        await onUpdate?.(product.code, payload)
      } else {
        await onCreate?.(payload)
        setForm((current) => ({
          ...current,
          code: generateCode(),
          name: '',
          category: '',
          price: '',
          stock: 0,
        }))
      }
    } catch (cause) {
      setError(cause.message || 'No pudimos guardar el producto.')
    } finally {
      setSaving(false)
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
        <input type="number" name="price" min="0" step="1" required value={form.price} onChange={handleChange} />
      </label>

      <label>Stock
        <input type="number" name="stock" min="0" step="1" required value={form.stock} onChange={handleChange} />
      </label>

      <label>Estado
        <select name="status" value={form.status} onChange={handleChange}>
          <option>Disponible</option>
          <option>Agotado</option>
          <option>Descontinuado</option>
        </select>
      </label>

      {error && (
        <p className="admin-form-message error" role="alert">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-registro-custom" disabled={saving}>
          {saving ? 'Guardando...' : product ? 'Guardar' : 'Crear'}
        </button>
        {product ? (
          <button type="button" className="btn" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  )
}