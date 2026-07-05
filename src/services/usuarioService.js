// =============================================================
// SERVICIO DE USUARIOS — services/usuarioService.js
// =============================================================
// Conectado al backend real:
//  - identidad (8080): /api/usuarios (listar, crear, actualizar, eliminar)
//  - academica (8083): /api/academica/cursos
//  - gestionacademica (8087): /api/asignatura
//  - matricula (8088): /api/matricula (para derivar el curso de cada estudiante)
// Las respuestas del backend se adaptan a la forma que ya consumen
// las páginas (run, nombre, rol, email, curso, ...). El RUN se
// maneja SIN dígito verificador (igual que el login); `runCompleto`
// incluye el DV para mostrar y para las rutas PUT/DELETE del backend.
// =============================================================
import http from './httpClient'

const PRIORIDAD_ROLES = ['ADMIN', 'DIRECTIVO', 'INSPECTOR', 'FUNCIONARIO', 'DOCENTE', 'APODERADO', 'ESTUDIANTE']

const rolPrincipal = (roles = []) => {
  const rol = PRIORIDAD_ROLES.find((r) => roles.includes(r)) || roles[0] || 'ESTUDIANTE'
  return rol === 'DIRECTIVO' ? 'ADMIN' : rol
}

// '12345678-5' | '12.345.678-5' | '12345678' -> { run: '12345678', dv: '5' }
const partirRun = (valor) => {
  const limpio = String(valor || '').replace(/\./g, '').trim()
  const [run, dv] = limpio.split('-')
  return { run: (run || '').replace(/\D/g, ''), dv: (dv || '').toUpperCase() }
}

const mapUsuario = (dto) => ({
  run: dto.runUsuario,
  dv: dto.dvrunUsuario,
  runCompleto: `${dto.runUsuario}-${dto.dvrunUsuario}`,
  nombre: [dto.pNombreUsuario, dto.pApellidoUsuario].filter(Boolean).join(' '),
  email: dto.correoUsuario || '',
  telefono: dto.telefonoUsuario || '',
  genero: dto.genero,
  rol: rolPrincipal(dto.roles),
  roles: dto.roles || [],
})

const mapCurso = (dto) => ({
  id: dto.id,
  nombre: dto.nombre,
  descripcion: dto.descripcion,
  nivelId: dto.nivelId,
  periodoId: dto.periodoId,
  salaId: dto.salaId,
  activo: dto.activo,
  nivel: dto.nombre,
  sala: dto.salaId ? `Sala ${dto.salaId}` : '',
})

// El backend de asignaturas referencia un nivel; las páginas esperan
// cursoId, así que se deriva buscando el curso de ese nivel.
const mapAsignatura = (dto, cursos = []) => ({
  id: dto.id_asignatura,
  nombre: dto.nombre_asignatura,
  docenteRun: dto.run_docente_ref,
  nivelId: dto.id_nivel_ref,
  cursoId: cursos.find((c) => c.nivelId === dto.id_nivel_ref)?.id ?? null,
})

// Mapa runEstudiante -> nombre de curso, derivado de las matrículas.
// Si el rol del token no puede listar matrículas, se degrada a vacío.
const cargarCursosPorEstudiante = async (cursos) => {
  try {
    const res = await http.get('/api/matricula')
    const porEstudiante = {}
    for (const m of res.data || []) {
      const curso = cursos.find((c) => c.id === m.id_curso_ref)
      if (curso) porEstudiante[m.run_estudiante_ref] = curso.nombre
    }
    return porEstudiante
  } catch {
    return {}
  }
}

export const getCursos = async () => {
  const res = await http.get('/api/academica/cursos')
  return { data: (res.data || []).map(mapCurso) }
}

export const getAsignaturas = async () => {
  let cursos = []
  try {
    cursos = (await getCursos()).data
  } catch { /* sin cursos igual se listan las asignaturas */ }
  const res = await http.get('/api/asignatura')
  return { data: (res.data || []).map((a) => mapAsignatura(a, cursos)) }
}

export const getAllUsuarios = async () => {
  let res
  try {
    res = await http.get('/api/usuarios')
  } catch (err) {
    // Roles sin permiso de listado (p. ej. APODERADO) reciben 403;
    // se degrada a lista vacía para no romper las páginas que
    // solo usan el directorio como información complementaria.
    if (err.response?.status === 403) return { data: [] }
    throw err
  }
  const usuarios = (res.data || []).map(mapUsuario)
  try {
    const cursos = (await getCursos()).data
    const cursoPorRun = await cargarCursosPorEstudiante(cursos)
    usuarios.forEach((u) => { u.curso = cursoPorRun[u.run] || null })
  } catch { /* el curso es informativo; sin matrícula queda vacío */ }
  return { data: usuarios }
}

export const getUsuarioByRun = async (runConDv) => {
  const { run, dv } = partirRun(runConDv)
  const res = await http.get(`/api/usuarios/${run}/${dv}`)
  return { data: mapUsuario(res.data) }
}

export const getEstudiantesDeCurso = async (cursoNombre) => {
  const res = await getAllUsuarios()
  return { data: res.data.filter((u) => u.rol === 'ESTUDIANTE' && (!cursoNombre || u.curso === cursoNombre)) }
}

// APODERADO: identidad no expone "listar mis pupilos", así que el
// intento de listar usuarios fallará (403) y se degrada a lista vacía.
export const getEstudiantesVinculados = async (usuario) => {
  if (usuario?.rol === 'ESTUDIANTE') {
    return { data: [{ run: usuario.run, nombre: usuario.nombre || usuario.run, rol: 'ESTUDIANTE', curso: usuario.curso || '' }] }
  }
  try {
    const res = await getAllUsuarios()
    return { data: res.data.filter((u) => u.rol === 'ESTUDIANTE') }
  } catch {
    return { data: [] }
  }
}

// data viene del formulario del panel: { nombre, run, email, rol,
// curso?, genero?, runApoderado?, password }.
export const createUsuario = async (data) => {
  const { run, dv } = partirRun(data.run)
  const partesNombre = String(data.nombre || '').trim().split(/\s+/)
  const pNombre = partesNombre[0] || ''
  const pApellido = partesNombre.length > 1 ? partesNombre[partesNombre.length - 1] : '—'
  const osNombre = partesNombre.length > 2 ? partesNombre.slice(1, -1).join(' ') : null

  const tipoUsuario = data.rol === 'ADMIN' ? 'DIRECTIVO' : data.rol
  const campoPorTipo = {
    DIRECTIVO: 'Directivo/a',
    DOCENTE: data.especialidad || 'General',
    APODERADO: data.parentesco || 'Apoderado/a',
    ESTUDIANTE: 'Pupilo/a',
    INSPECTOR: 'General',
    FUNCIONARIO: 'Funcionario/a',
  }

  const res = await http.post('/api/usuarios', {
    runUsuario: run,
    dvrunUsuario: dv,
    pNombreUsuario: pNombre,
    osNombreUsuario: osNombre,
    pApellidoUsuario: pApellido,
    osApellidoUsuario: null,
    correoUsuario: data.email,
    telefonoUsuario: data.telefono || null,
    genero: data.genero || 'M',
    contrasena: data.password || 'sigedu123',
    tipoUsuario,
    campoEspecifico: campoPorTipo[tipoUsuario] || 'General',
    runApoderado: tipoUsuario === 'ESTUDIANTE' ? partirRun(data.runApoderado).run : null,
  })
  return { data: mapUsuario(res.data) }
}

export const updateUsuario = async (runConDv, data) => {
  const { run, dv } = partirRun(data.runCompleto || runConDv)
  const cuerpo = {}
  if (data.nombre) {
    const partes = String(data.nombre).trim().split(/\s+/)
    cuerpo.pNombreUsuario = partes[0]
    if (partes.length > 1) cuerpo.pApellidoUsuario = partes[partes.length - 1]
  }
  if (data.email) cuerpo.correoUsuario = data.email
  if (data.telefono) cuerpo.telefonoUsuario = data.telefono
  if (data.genero) cuerpo.genero = data.genero
  if (data.password) cuerpo.contrasena = data.password

  const res = await http.put(`/api/usuarios/${run}/${dv}`, cuerpo)
  return { data: mapUsuario(res.data) }
}

export const deleteUsuario = async (runConDv) => {
  const { run, dv } = partirRun(runConDv)
  await http.delete(`/api/usuarios/${run}/${dv}`)
  return { data: { ok: true } }
}
