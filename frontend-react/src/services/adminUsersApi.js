import { fetchWithAuth } from './authApi.js'

const BASE = '/api/v1/admin/usuarios'

async function request(url, options) {
  const response = options ? await fetchWithAuth(url, options) : await fetchWithAuth(url)
  if (response.status === 204) return null
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.detail || data?.message || `No pudimos gestionar usuarios (${response.status}).`)
  }
  return data
}

function toUser(data) {
  return {
    id: data.id,
    run: data.run,
    name: data.nombre,
    lastName: data.apellidos,
    email: data.email,
    phone: data.telefono,
    region: data.region,
    commune: data.comuna,
    address: data.direccion || '',
    role: data.rol.toLowerCase(),
    active: data.activo,
  }
}

export async function getAdminUsers() {
  const users = []
  for (let page = 0; ; page += 1) {
    const result = await request(`${BASE}?pagina=${page}&tamano=100`)
    if (!Array.isArray(result?.content) || !Number.isInteger(result.totalPages)) {
      throw new Error('El servidor devolvió usuarios inválidos.')
    }
    users.push(...result.content.map(toUser))
    if (page + 1 >= result.totalPages) return users
  }
}

export async function createAdminUser(form) {
  if (form.password !== form.confirmPassword) {
    throw new Error('Las contraseñas no coinciden.')
  }
  const created = await request(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: form.name.trim(), apellidos: form.lastName.trim(), run: form.run.trim(),
      email: form.email.trim(), telefono: form.phone.trim(), password: form.password,
      confirmPassword: form.confirmPassword,
      region: form.region.trim(), comuna: form.commune.trim(), direccion: form.address.trim(),
      rol: form.role.toUpperCase(), activo: form.active,
    }),
  })
  return toUser(created)
}

export async function updateAdminUser(id, form) {
  const updated = await request(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: form.name.trim(), apellidos: form.lastName.trim(),
      email: form.email.trim(), telefono: form.phone.trim(),
      region: form.region.trim(), comuna: form.commune.trim(), direccion: form.address.trim(),
      rol: form.role.toUpperCase(), activo: form.active,
    }),
  })
  return toUser(updated)
}

export async function deactivateAdminUser(id) {
  await request(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
