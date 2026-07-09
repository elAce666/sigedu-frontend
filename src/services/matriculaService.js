// =============================================================
// SERVICIO DE MATRICULA - services/matriculaService.js
// =============================================================
// Conectado al microservicio real de matricula (8088):
//   GET/POST /api/matricula   PUT/DELETE /api/matricula/{id}
// y a academica (8083) para el catalogo de periodos.
// El backend usa snake_case (run_estudiante_ref, id_curso_ref...);
// aqui se adapta a camelCase para las paginas.
// =============================================================
import http from './httpClient'

const soloRun = (valor) => String(valor || '').split('-')[0].replace(/\D/g, '')

const mapMatricula = (dto) => ({
  id: dto.id_matricula,
  anioAcademico: dto.anio_academico,
  estado: dto.estado,
  estudianteRun: dto.run_estudiante_ref,
  cursoId: dto.id_curso_ref,
  periodoId: dto.id_periodo_ref,
})

export const getMatriculas = async () => {
  const res = await http.get('/api/matricula')
  return { data: (res.data || []).map(mapMatricula) }
}

export const getMatriculasPorEstudiante = async (estudianteRun) => {
  const res = await http.get(`/api/matricula/${soloRun(estudianteRun)}`)
  const lista = Array.isArray(res.data) ? res.data : [res.data].filter(Boolean)
  return { data: lista.map(mapMatricula) }
}

// data: { estudianteRun, cursoId, periodoId, anioAcademico, estado }
export const crearMatricula = async (data) => {
  const res = await http.post('/api/matricula', {
    anio_academico: Number(data.anioAcademico),
    estado: data.estado || 'ACTIVA',
    run_estudiante_ref: soloRun(data.estudianteRun),
    id_curso_ref: Number(data.cursoId),
    id_periodo_ref: Number(data.periodoId),
  })
  return { data: mapMatricula(res.data) }
}

export const actualizarMatricula = async (id, data) => {
  const res = await http.put(`/api/matricula/${id}`, {
    anio_academico: Number(data.anioAcademico),
    estado: data.estado,
    run_estudiante_ref: soloRun(data.estudianteRun),
    id_curso_ref: Number(data.cursoId),
    id_periodo_ref: Number(data.periodoId),
  })
  return { data: mapMatricula(res.data) }
}

export const eliminarMatricula = async (id) => {
  await http.delete(`/api/matricula/${id}`)
  return { data: { ok: true } }
}

export const getPeriodos = async () => {
  const res = await http.get('/api/academica/periodos')
  return { data: res.data || [] }
}
