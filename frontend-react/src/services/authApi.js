const AUTH_URL = '/api/v1/auth'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
const REFRESH_LOCK_NAME = 'gatyperry-refresh-session'

let accessToken = null
let refreshPending = null

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`
}

export class AuthApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
  }
}

async function readResponse(response) {
  let data = null

  if (response.status !== 204) {
    const contentType = response.headers.get('content-type') || ''

    data = contentType.includes('json')
      ? await response.json()
      : await response.text()
  }

  if (!response.ok) {
    const message =
      (typeof data === 'object' &&
        data !== null &&
        (data.detail || data.message || data.title)) ||
      `La solicitud falló (${response.status}).`

    throw new AuthApiError(message, response.status)
  }

  return data
}

export function getAccessToken() {
  return accessToken
}

export async function register(userData) {
  const response = await fetch(apiUrl(`${AUTH_URL}/registro`), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  return readResponse(response)
}

export async function login(email, password) {
  const response = await fetch(apiUrl(`${AUTH_URL}/login`), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await readResponse(response)
  accessToken = data.accessToken
  return data
}

export async function refreshSession() {
  if (!refreshPending) {
    async function requestRefresh() {
      const response = await fetch(apiUrl(`${AUTH_URL}/refresh`), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Gaty-Client': 'web',
        },
      })

      if (response.status === 401) {
        accessToken = null
        return null
      }

      const data = await readResponse(response)
      accessToken = data.accessToken
      return data
    }

    const locks = globalThis.navigator?.locks

    refreshPending = (
      locks
        ? locks.request(REFRESH_LOCK_NAME, requestRefresh)
        : requestRefresh()
    ).finally(() => {
      refreshPending = null
    })
  }

  return refreshPending
}

export async function getMe() {
  if (!accessToken) {
    throw new AuthApiError('No hay una sesión activa.', 401)
  }

  const response = await fetch(apiUrl(`${AUTH_URL}/me`), {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return readResponse(response)
}

export async function logout() {
  try {
    const response = await fetch(apiUrl(`${AUTH_URL}/logout`), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-Gaty-Client': 'web',
      },
    })

    await readResponse(response)
  } finally {
    accessToken = null
  }
}

export async function fetchWithAuth(url, options = {}) {
  if (!accessToken) {
    const renewed = await refreshSession()
    if (!renewed) {
      throw new AuthApiError('Inicia sesión para continuar.', 401)
    }
  }

  async function send() {
    const headers = new Headers(options.headers)
    headers.set('Authorization', `Bearer ${accessToken}`)

    return fetch(apiUrl(url), {
      ...options,
      credentials: 'include',
      headers,
    })
  }

  let response = await send()

  if (response.status === 401) {
    const renewed = await refreshSession()
    if (!renewed) {
      throw new AuthApiError('Tu sesión expiró. Inicia sesión nuevamente.', 401)
    }

    response = await send()
  }

  return response
}