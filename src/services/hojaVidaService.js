// =============================================================
// SERVICIO HOJA DE VIDA - services/hojaVidaService.js
// =============================================================
// Conectado al microservicio real de convivencia (8085):
//   GET  /api/convivencia/anotaciones/estudiante/{run}
//   POST /api/convivencia/anotaciones
// El backend registra anotaciones con tipo OBSERVACION_POSITIVA /
// OBSERVACION_NEGATIVA y toma el autor del token JWT; aqui se
// adapta a la forma { tipo: 'positiva'|'negativa', detalle, autor }
// que consumen las paginas.
// =============================================================
import http from './httpClient'
import { getAllUsuarios } from './usuarioService'

const soloRun = (valor) => String(valor || '').split('-')[0].replace(/\D/g, '')

const mapAnotacion = (dto) => ({
  id: dto.id,
  estudianteRun: dto.runEstudianteRef,
  tipo: String(dto.tipo || '').includes('POSITIVA') ? 'positiva' : 'negativa',
  detalle: dto.descripcion,
  autorRun: dto.runAutorRef,
  fecha: dto.fecha,
})

export const getHojaVida = async (estudianteRun) => {
  const res = await http.get(`/api/convivencia/anotaciones/estudiante/${soloRun(estudianteRun)}`)
  let directorio = {}
  try {
    const resU = await getAllUsuarios()
    resU.data.forEach((u) => { directorio[u.run] = u })
  } catch { /* sin directorio se muestra el RUN del autor */ }
  const anotaciones = (res.data || [])
    .map(mapAnotacion)
    .map((a) => ({ ...a, autor: directorio[a.autorRun] || { run: a.autorRun, nombre: a.autorRun } }))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return { data: anotaciones }
}

// data: { estudianteRun, tipo: 'positiva'|'negativa', detalle, autorRun }
export const registrarAnotacion = async ({ estudianteRun, tipo, detalle }) => {
  const res = await http.post('/api/convivencia/anotaciones', {
    runEstudianteRef: soloRun(estudianteRun),
    fecha: new Date().toISOString().slice(0, 10),
    tipo: tipo === 'positiva' ? 'OBSERVACION_POSITIVA' : 'OBSERVACION_NEGATIVA',
    descripcion: detalle,
  })
  return { data: mapAnotacion(res.data) }
}
