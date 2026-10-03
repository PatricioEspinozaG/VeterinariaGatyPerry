export const STORAGE_KEYS = {
  products: 'gaty-react-v2-products',
  cart: 'gaty-react-v2-cart',
  users: 'gaty-react-v2-users',
  session: 'gaty-react-v2-session',
  appointments: 'gaty-react-v2-appointments',
  pets: 'gaty-react-v2-pets',
  contacts: 'gaty-react-v2-contacts',
  orders: 'gaty-react-v2-orders',
}

export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}