// =============================================================
// SERVICIO DE ASISTENCIA - services/asistenciaService.js
// =============================================================
// Conectado al microservicio real de matricula (8088):
//   GET  /api/matricula/asistencia/estudiante/{run}
//   GET  /api/matricula/asistencia/estudiante/{run}/resumen
//   POST /api/matricula/asistencia
// =============================================================
import http from './httpClient'

const soloRun = (valor) => String(valor || '').split('-')[0].replace(/\D/g, '')

const mapAsistencia = (dto) => ({
  id: dto.id,
  estudianteRun: dto.runEstudianteRef,
  fecha: dto.fecha,
  estado: String(dto.estado || '').toLowerCase(),
  docenteRun: dto.runDocenteRef,
  justificada: dto.justificada === true,
})

export const getAsistenciaPorEstudiante = async (estudianteRun) => {
  const res = await http.get(`/api/matricula/asistencia/estudiante/${soloRun(estudianteRun)}`)
  return { data: (res.data || []).map(mapAsistencia) }
}

export const getResumenAsistencia = async (estudianteRun) => {
  const res = await http.get(`/api/matricula/asistencia/estudiante/${soloRun(estudianteRun)}/resumen`)
  return { data: res.data }
}

export const registrarAsistencia = async (data) => {
  const res = await http.post('/api/matricula/asistencia', {
    runEstudianteRef: soloRun(data.estudianteRun),
    fecha: data.fecha,
    estado: data.estado,
    runDocenteRef: soloRun(data.docenteRun),
    justificada: data.justificada === true,
  })
  return { data: mapAsistencia(res.data) }
}

export const actualizarAsistencia = registrarAsistencia
