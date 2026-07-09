// =============================================================
// SERVICIO DE AUTENTICACION - services/authService.js
// =============================================================
// Login conectado solo al microservicio real de identidad
// (POST /api/auth/login, via proxy de Vite hacia :8080).
// El backend autentica por RUN sin digito verificador y contrasena.
// Tras autenticar, consulta /api/usuarios/me para obtener nombre,
// correo y datos reales del usuario autenticado.
// =============================================================
import http from './httpClient'

const PRIORIDAD_ROLES = ['ADMIN', 'DIRECTIVO', 'INSPECTOR', 'FUNCIONARIO', 'DOCENTE', 'APODERADO', 'ESTUDIANTE']

const rolPrincipal = (roles = []) => {
  const rol = PRIORIDAD_ROLES.find((r) => roles.includes(r)) || roles[0] || 'ESTUDIANTE'
  return rol === 'DIRECTIVO' ? 'ADMIN' : rol
}

const normalizarRun = (valor) => String(valor || '').split('.').join('').split('-')[0].trim()

const nombreCompleto = (dto) => [
  dto.pNombreUsuario,
  dto.osNombreUsuario,
  dto.pApellidoUsuario,
  dto.osApellidoUsuario,
].filter(Boolean).join(' ').trim()

const mapPerfil = (dto, rolesFallback = []) => {
  const roles = dto.roles?.length ? dto.roles : rolesFallback
  const run = dto.runUsuario || ''
  const dv = dto.dvrunUsuario || ''

  return {
    run,
    dv,
    runCompleto: run && dv ? `${run}-${dv}` : run,
    nombre: nombreCompleto(dto) || run,
    email: dto.correoUsuario || '',
    telefono: dto.telefonoUsuario || '',
    genero: dto.genero || '',
    rol: rolPrincipal(roles),
    roles,
  }
}

export const getPerfilActual = async (tokenOverride, rolesFallback = []) => {
  const headers = tokenOverride ? { Authorization: `Bearer ${tokenOverride}` } : undefined
  const res = await http.get('/api/usuarios/me', headers ? { headers } : undefined)
  return { data: mapPerfil(res.data || {}, rolesFallback) }
}

export const login = async ({ usuario, password }) => {
  try {
    const res = await http.post('/api/auth/login', {
      runUsuario: normalizarRun(usuario),
      contrasena: password,
    })

    const { token, runUsuario, roles = [] } = res.data
    const rol = rolPrincipal(roles)

    const fallback = {
      token,
      run: runUsuario,
      nombre: runUsuario,
      email: '',
      rol,
      roles,
    }

    try {
      const perfil = await getPerfilActual(token, roles)
      return { data: { token, ...perfil.data, rol: perfil.data.rol || rol } }
    } catch {
      return { data: fallback }
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
