// =============================================================
// SERVICIO DE USUARIOS - services/usuarioService.js
// =============================================================
// Conectado al backend real:
//  - identidad (8080): /api/usuarios (listar, crear, actualizar, eliminar)
//  - academica (8083): /api/academica/cursos
//  - gestionacademica (8087): /api/asignatura
//  - matricula (8088): /api/matricula (para derivar el curso de cada estudiante)
// Las respuestas del backend se adaptan a la forma que ya consumen
// las paginas (run, nombre, rol, email, curso, ...). El RUN se
// maneja SIN digito verificador (igual que el login); `runCompleto`
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
  id: dto.id ?? dto.idCurso ?? dto.id_curso,
  nombre: dto.nombre ?? dto.nombreCurso ?? dto.nombre_curso ?? 'Curso',
  descripcion: dto.descripcion,
  nivelId: dto.nivelId ?? dto.idNivel ?? dto.id_nivel_ref,
  periodoId: dto.periodoId ?? dto.idPeriodo ?? dto.id_periodo_ref,
  salaId: dto.salaId ?? dto.idSala ?? dto.id_sala_ref,
  activo: dto.activo ?? true,
  nivel: dto.nombre ?? dto.nombreCurso ?? dto.nombre_curso ?? 'Curso',
  sala: (dto.salaId ?? dto.idSala ?? dto.id_sala_ref) ? `Sala ${dto.salaId ?? dto.idSala ?? dto.id_sala_ref}` : '',
})

// El backend de asignaturas referencia un nivel; las paginas esperan
// cursoId, asi que se deriva buscando el curso de ese nivel.
const mapAsignatura = (dto, cursos = []) => ({
  id: dto.id_asignatura,
  nombre: dto.nombre_asignatura,
  docenteRun: dto.run_docente_ref,
  nivelId: dto.id_nivel_ref,
  cursoId: cursos.find((c) => c.nivelId === dto.id_nivel_ref)?.id ?? null,
})

// Mapa runEstudiante -> nombre de curso, derivado de las matriculas.
// Si el rol del token no puede listar matriculas, se degrada a vacio.
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

const enriquecerEstudiantesConCurso = async (estudiantes) => {
  if (!estudiantes.length) return estudiantes
  try {
    const cursos = (await getCursos()).data
    const enriquecidos = await Promise.all(estudiantes.map(async (estudiante) => {
      try {
        const res = await http.get('/api/matricula/' + partirRun(estudiante.run).run)
        const matricula = (res.data || []).find((item) => String(item.estado || '').toUpperCase() === 'ACTIVA') || (res.data || [])[0]
        const curso = cursos.find((item) => Number(item.id) === Number(matricula?.id_curso_ref))
        return { ...estudiante, curso: estudiante.curso || curso?.nombre || '' }
      } catch {
        return estudiante
      }
    }))
    return enriquecidos
  } catch {
    return estudiantes
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
    // se degrada a lista vacia para no romper las paginas que
    // solo usan el directorio como informacion complementaria.
    if (err.response?.status === 403) return { data: [] }
    throw err
  }
  const usuarios = (res.data || []).map(mapUsuario)
  try {
    const cursos = (await getCursos()).data
    const cursoPorRun = await cargarCursosPorEstudiante(cursos)
    usuarios.forEach((u) => { u.curso = cursoPorRun[u.run] || null })
  } catch { /* el curso es informativo; sin matricula queda vacio */ }
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


export const getEstudiantesPorDocente = async (docenteRun) => {
  const runDocente = partirRun(docenteRun).run
  const [usuariosRes, cursosRes, asignaturasRes, matriculasRes] = await Promise.allSettled([
    getAllUsuarios(),
    getCursos(),
    getAsignaturas(),
    http.get('/api/matricula'),
  ])

  const usuarios = usuariosRes.status === 'fulfilled' ? usuariosRes.value.data : []
  const cursos = cursosRes.status === 'fulfilled' ? cursosRes.value.data : []
  const asignaturas = asignaturasRes.status === 'fulfilled' ? asignaturasRes.value.data : []
  const matriculas = matriculasRes.status === 'fulfilled' ? (matriculasRes.value.data || []) : []
  const cursosPorId = new Map(cursos.map((curso) => [Number(curso.id), curso]))

  const cursosDocenteIds = new Set(
    asignaturas
      .filter((asignatura) => partirRun(asignatura.docenteRun).run === runDocente)
      .map((asignatura) => Number(asignatura.cursoId))
      .filter(Boolean)
  )

  let matriculasVisibles = matriculas.filter((matricula) => String(matricula.estado || '').toUpperCase() !== 'RETIRADA')
  if (cursosDocenteIds.size > 0) {
    const filtradas = matriculasVisibles.filter((matricula) => cursosDocenteIds.has(Number(matricula.id_curso_ref)))
    if (filtradas.length > 0) matriculasVisibles = filtradas
  }

  const runsEstudiantes = new Set(matriculasVisibles.map((matricula) => partirRun(matricula.run_estudiante_ref).run))
  const estudiantesBase = usuarios.filter((usuario) => usuario.rol === 'ESTUDIANTE')
  const estudiantesFiltrados = runsEstudiantes.size
    ? estudiantesBase.filter((usuario) => runsEstudiantes.has(partirRun(usuario.run).run))
    : estudiantesBase

  const estudiantes = estudiantesFiltrados
    .map((usuario) => {
      const matricula = matriculasVisibles.find((item) => partirRun(item.run_estudiante_ref).run === partirRun(usuario.run).run)
      const curso = cursosPorId.get(Number(matricula?.id_curso_ref))
      return { ...usuario, curso: usuario.curso || curso?.nombre || '' }
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

  return { data: estudiantes }
}
export const getEstudiantesVinculados = async (usuario) => {
  if (usuario?.rol === 'ESTUDIANTE') {
    const estudiantes = [{ run: usuario.run, nombre: usuario.nombre || usuario.run, rol: 'ESTUDIANTE', curso: usuario.curso || '' }]
    return { data: await enriquecerEstudiantesConCurso(estudiantes) }
  }

  if (usuario?.rol === 'APODERADO') {
    const res = await http.get('/api/usuarios/mis-estudiantes')
    return { data: await enriquecerEstudiantesConCurso((res.data || []).map(mapUsuario)) }
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
  const pApellido = partesNombre.length > 1 ? partesNombre[partesNombre.length - 1] : '-'
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
    contrasena: String(data.password || '').trim(),
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
