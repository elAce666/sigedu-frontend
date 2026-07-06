// =============================================================
// CLIENTE HTTP REAL — services/httpClient.js
// =============================================================
// Cliente basado en fetch que conserva el contrato que ya usan
// las páginas: toda función devuelve una Promise que resuelve
// { data } y rechaza con { response: { status, data } } (la
// misma forma de axios que imita apiClient.js). Así los
// services pueden migrar del mock al backend real sin que las
// páginas cambien.
//
// - Adjunta automáticamente el JWT (sigedu_token) como Bearer.
// - Las rutas son relativas (/api/...): en desarrollo el proxy
//   de Vite (vite.config.js) las reenvía al microservicio que
//   corresponda; en producción se puede fijar VITE_API_BASE_URL.
// =============================================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = localStorage.getItem('sigedu_token')

  const finalHeaders = {
    Accept: 'application/json',
    ...(body !== undefined && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...headers,
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })
  } catch (networkError) {
    // Sin conexión / backend caído: se marca para que el service
    // que llama pueda decidir si usa un fallback (p. ej. el mock).
    const err = new Error('No se pudo conectar con el servidor')
    err.isNetworkError = true
    err.cause = networkError
    throw err
  }

  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null)

  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}`)
    error.response = { status: res.status, data }
    throw error
  }

  return { data }
}

export const http = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}

export default http
