// =============================================================
// SERVICIO DE AUTENTICACIÓN — services/authService.js
// =============================================================
// login(data) busca un usuario por email+password en el mock y
// devuelve un "token" falso + los datos básicos del usuario, en
// la misma forma en que lo haría POST /auth/login contra el
// API Gateway real (ver módulo S0 - Identidad y Acceso).
// =============================================================
import { getDB } from '../mock/db'
import { resolveData, rejectError } from './apiClient'

export const login = ({ email, password }) => {
  const db = getDB()
  const user = db.usuarios.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
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
