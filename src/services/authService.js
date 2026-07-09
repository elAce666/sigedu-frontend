// =============================================================
// SERVICIO DE AUTENTICACION - services/authService.js
// =============================================================
// Login conectado solo al microservicio real de identidad
// (POST /api/auth/login, via proxy de Vite hacia :8080).
// El backend autentica por RUN sin digito verificador y contrasena.
// =============================================================
import http from './httpClient'

const PRIORIDAD_ROLES = ['ADMIN', 'DIRECTIVO', 'INSPECTOR', 'FUNCIONARIO', 'DOCENTE', 'APODERADO', 'ESTUDIANTE']

const rolPrincipal = (roles = []) =>
  PRIORIDAD_ROLES.find((r) => roles.includes(r)) || roles[0] || 'ESTUDIANTE'

const normalizarRun = (valor) => String(valor || '').split('.').join('').split('-')[0].trim()

export const login = async ({ usuario, password }) => {
  try {
    const res = await http.post('/api/auth/login', {
      runUsuario: normalizarRun(usuario),
      contrasena: password,
    })

    const { token, runUsuario, roles } = res.data
    const rol = rolPrincipal(roles)

    return {
      data: {
        token,
        run: runUsuario,
        nombre: runUsuario,
        email: '',
        rol: rol === 'DIRECTIVO' ? 'ADMIN' : rol,
      },
    }
  } catch (err) {
    if (err.isNetworkError) {
      return Promise.reject({
        response: { status: 503, data: { error: 'No se pudo conectar con el backend de autenticacion' } },
      })
    }
    if (err.response?.status === 401 || err.response?.status === 400) {
      return Promise.reject({
        response: { status: 401, data: { error: 'RUN o contrasena incorrectos' } },
      })
    }
    throw err
  }
}
