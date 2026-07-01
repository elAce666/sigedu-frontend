// =============================================================
// CONTEXTO DE AUTENTICACIÓN — context/AuthContext.jsx
// =============================================================
// Guarda quién está logueado y con qué rol (ESTUDIANTE, APODERADO,
// DOCENTE, ADMIN), disponible para toda la app vía useAuth().
// El estado se recupera desde localStorage al recargar la página.
// =============================================================
import { createContext, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('sigedu_token'))
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem('sigedu_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback((newToken, userData) => {
    localStorage.setItem('sigedu_token', newToken)
    localStorage.setItem('sigedu_user', JSON.stringify(userData))
    setToken(newToken)
    setUsuario(userData)
  }, [])

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
    <AuthContext.Provider value={{ token, usuario, login, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
}
