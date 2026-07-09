// =============================================================
// SERVICIO DE NOTAS - services/notaService.js
// =============================================================
// Conectado al microservicio real de notas (8090):
//   GET  /api/notas/estudiante/{run}
//   POST /api/notas   PUT /api/notas/{id}   DELETE /api/notas/{id}
// El backend guarda { idNota, runEstudiante, codigoAsignatura,
// periodo, tipoEvaluacion, ponderacion, calificacion, observaciones };
// aqui se adapta a la forma { id, valor, fecha, descripcion,
// asignatura } que consumen las paginas. Los promedios se calculan
// en el cliente a partir de las notas reales.
// =============================================================
import http from './httpClient'
import { getAsignaturas } from './usuarioService'

const soloRun = (valor) => String(valor || '').split('-')[0].replace(/\D/g, '')

const mapNota = (dto, asignaturas = []) => {
  const asignaturaId = Number(dto.codigoAsignatura)
  const asignatura = asignaturas.find((a) => a.id === asignaturaId)
  return {
    id: dto.idNota,
    estudianteRun: dto.runEstudiante,
    asignaturaId,
    valor: Number(dto.calificacion),
    // Notas antiguas (sin fecha_evaluacion) muestran el periodo.
    fecha: dto.fechaEvaluacion || dto.periodo || '',
    descripcion: dto.observaciones || dto.tipoEvaluacion || '',
    ponderacion: dto.ponderacion,
    asignatura: asignatura ? { id: asignatura.id, nombre: asignatura.nombre } : null,
  }
}

const cargarNotas = async (estudianteRun) => {
  let asignaturas = []
  try {
    asignaturas = (await getAsignaturas()).data
  } catch { /* sin catalogo, la nota se muestra sin nombre de asignatura */ }
  const res = await http.get(`/api/notas/estudiante/${soloRun(estudianteRun)}`)
  return (res.data || []).map((n) => mapNota(n, asignaturas))
}

export const getNotasPorEstudiante = async (estudianteRun) => {
  return { data: await cargarNotas(estudianteRun) }
}

export const getPromediosPorAsignatura = async (estudianteRun) => {
  const notas = await cargarNotas(estudianteRun)
  const porAsignatura = {}
  notas.forEach((n) => {
    const clave = n.asignatura?.nombre || `Asignatura ${n.asignaturaId}`
    if (!porAsignatura[clave]) porAsignatura[clave] = []
    porAsignatura[clave].push(n.valor)
  })
  const resultado = Object.entries(porAsignatura).map(([asignatura, valores]) => ({
    asignatura,
    promedio: Number((valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1)),
  }))
  return { data: resultado }
}

// data: { estudianteRun, asignaturaId, valor, descripcion, fecha, docenteRun }
export const registrarNota = async (data) => {
  const anio = (data.fecha || new Date().toISOString()).slice(0, 4)
  const res = await http.post('/api/notas', {
    runEstudiante: soloRun(data.estudianteRun),
    codigoAsignatura: String(data.asignaturaId),
    periodo: `${anio}-1`,
    fechaEvaluacion: data.fecha || new Date().toISOString().slice(0, 10),
    tipoEvaluacion: 'EVALUACION',
    ponderacion: Number(data.ponderacion) || 100.0,
    calificacion: Number(data.valor),
    observaciones: data.descripcion || '',
  })
  return { data: mapNota(res.data) }
}

export const actualizarNota = async (id, data) => {
  const res = await http.put(`/api/notas/${id}`, {
    runEstudiante: soloRun(data.estudianteRun),
    codigoAsignatura: String(data.asignaturaId),
    periodo: data.periodo || `${new Date().getFullYear()}-1`,
    fechaEvaluacion: data.fecha || undefined,
    tipoEvaluacion: data.tipoEvaluacion || 'EVALUACION',
    ponderacion: Number(data.ponderacion) || 100.0,
    calificacion: Number(data.valor),
    observaciones: data.descripcion || '',
  })
  return { data: mapNota(res.data) }
}

export const eliminarNota = async (id) => {
  await http.delete(`/api/notas/${id}`)
  return { data: { ok: true } }
}
