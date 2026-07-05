// =============================================================
// SERVICIO DE AUTENTICACIÓN — services/authService.js
// =============================================================
// login(data) ahora se conecta al microservicio de identidad
// real (POST /api/auth/login, vía proxy de Vite hacia :8080).
// El backend autentica por RUN (sin dígito verificador) y
// contraseña, y responde { token, tipo, runUsuario, roles,
// expiraEn }; aquí se normaliza a la forma { token, run,
// nombre, email, rol } que ya consumen Login y AuthContext.
//
// Si el backend no está disponible (error de red), se usa el
// mock local como fallback para no bloquear el desarrollo:
// en ese caso el identificador se busca como correo en el mock.
// =============================================================
import { getDB } from '../mock/db'
import { resolveData, rejectError } from './apiClient'
import http from './httpClient'

// Prioridad para elegir el rol "principal" que usa el frontend
// para redirigir y mostrar permisos.
const PRIORIDAD_ROLES = ['ADMIN', 'DIRECTIVO', 'INSPECTOR', 'FUNCIONARIO', 'DOCENTE', 'APODERADO', 'ESTUDIANTE']

const rolPrincipal = (roles = []) =>
  PRIORIDAD_ROLES.find((r) => roles.includes(r)) || roles[0] || 'ESTUDIANTE'

const loginMock = ({ usuario, password }) => {
  const db = getDB()
  const user = db.usuarios.find(
    (u) => u.email.toLowerCase() === String(usuario).toLowerCase() && u.password === password
  )

  if (!user) {
    return rejectError('Correo o contraseña incorrectos', 401)
  }

  const token = btoa(`${user.run}:${Date.now()}`)
  return resolveData({
    token,
    run: user.run,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
  })
}

export const login = async ({ usuario, password }) => {
  try {
    const res = await http.post('/api/auth/login', {
      runUsuario: String(usuario).trim(),
      contrasena: password,
    })

    const { token, runUsuario, roles } = res.data
    const rol = rolPrincipal(roles)

    return {
      data: {
        token,
        run: runUsuario,
        // El login del backend no retorna nombre/correo; se usa el
        // RUN como etiqueta hasta enriquecer con /api/usuarios.
        nombre: runUsuario,
        email: '',
        rol: rol === 'DIRECTIVO' ? 'ADMIN' : rol,
      },
    }
  } catch (err) {
    if (err.isNetworkError) {
      console.warn('[authService] Backend no disponible, usando mock local:', err.message)
      return loginMock({ usuario, password })
    }
    if (err.response?.status === 401 || err.response?.status === 400) {
      return Promise.reject({
        response: { status: 401, data: { error: 'RUN o contraseña incorrectos' } },
      })
    }
    throw err
  }
}
