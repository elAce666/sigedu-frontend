// =============================================================
// CONTEXTO DE AUTENTICACION - context/AuthContext.jsx
// =============================================================
// Guarda quien esta logueado y con que rol (ESTUDIANTE, APODERADO,
// DOCENTE, ADMIN), disponible para toda la app via useAuth().
// El estado se recupera desde localStorage al recargar la pagina.
// =============================================================
import { createContext, useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { getPerfilActual } from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('sigedu_token'))
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem('sigedu_user')
    return stored ? JSON.parse(stored) : null
  })

  const guardarUsuario = useCallback((userData) => {
    localStorage.setItem('sigedu_user', JSON.stringify(userData))
    setUsuario(userData)
  }, [])

  const login = useCallback((newToken, userData) => {
    localStorage.setItem('sigedu_token', newToken)
    setToken(newToken)
    guardarUsuario(userData)
  }, [guardarUsuario])

  const actualizarUsuario = useCallback((userData) => {
    setUsuario((actual) => {
      const actualizado = { ...(actual || {}), ...userData }
      localStorage.setItem('sigedu_user', JSON.stringify(actualizado))
      return actualizado
    })
  }, [])

  useEffect(() => {
    if (!token || !usuario) return undefined

    const faltaNombre = !usuario.nombre || usuario.nombre === usuario.run
    const faltaCorreo = !usuario.email
    if (!faltaNombre && !faltaCorreo) return undefined

    let activo = true
    getPerfilActual(token, usuario.roles || [usuario.rol])
      .then((res) => {
        if (!activo) return
        actualizarUsuario(res.data)
      })
      .catch(() => {})

    return () => { activo = false }
  }, [token, usuario, actualizarUsuario])

  const logout = useCallback(() => {
    localStorage.removeItem('sigedu_token')
    localStorage.removeItem('sigedu_user')
    setToken(null)
    setUsuario(null)
  }, [])

  const isAuthenticated = !!token && !!usuario

  const hasRole = useCallback((rol) => {
    if (!usuario) return false
    if (Array.isArray(rol)) return rol.includes(usuario.rol)
    return usuario.rol === rol
  }, [usuario])

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout, actualizarUsuario, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
}
