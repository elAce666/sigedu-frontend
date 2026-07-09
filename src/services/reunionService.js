// =============================================================
// SERVICIO DE REUNIONES Y CALENDARIO - services/reunionService.js
// =============================================================
// Conectado a los microservicios reales:
//   reuniones  (8082): /api/reuniones/generales, /api/reuniones/apoderados
//   calendario (8084): /api/calendario/eventos
// =============================================================
import http from './httpClient'

const soloRun = (valor) => String(valor || '').split('-')[0].replace(/\D/g, '')

const mapReunionGeneral = (dto) => ({
  id: dto.idBitacoraReunionGeneral,
  fecha: dto.fechaReunion,
  hora: dto.horaReunion,
  lugar: dto.lugar,
  tema: dto.tema,
  observaciones: dto.observaciones,
})

const mapReunionApoderado = (dto) => ({
  id: dto.idBitacoraReunionApoderado,
  fecha: dto.fechaReunion,
  hora: dto.horaReunion,
  apoderadoRun: dto.runApoderado,
  lugar: dto.lugar,
  tema: dto.tema,
  observaciones: dto.observaciones,
})

export const getReunionesGenerales = async () => {
  const res = await http.get('/api/reuniones/generales')
  return { data: (res.data || []).map(mapReunionGeneral) }
}

export const crearReunionGeneral = async (data) => {
  const res = await http.post('/api/reuniones/generales', {
    fechaReunion: data.fecha,
    horaReunion: data.hora.length === 5 ? `${data.hora}:00` : data.hora,
    lugar: data.lugar,
    tema: data.tema,
    observaciones: data.observaciones || '',
  })
  return { data: mapReunionGeneral(res.data) }
}

export const eliminarReunionGeneral = async (id) => {
  await http.delete(`/api/reuniones/generales/${id}`)
  return { data: { ok: true } }
}

export const getReunionesApoderados = async () => {
  const res = await http.get('/api/reuniones/apoderados')
  return { data: (res.data || []).map(mapReunionApoderado) }
}

export const crearReunionApoderado = async (data) => {
  const res = await http.post('/api/reuniones/apoderados', {
    fechaReunion: data.fecha,
    horaReunion: data.hora.length === 5 ? `${data.hora}:00` : data.hora,
    runApoderado: soloRun(data.apoderadoRun),
    lugar: data.lugar,
    tema: data.tema,
    observaciones: data.observaciones || '',
  })
  return { data: mapReunionApoderado(res.data) }
}

export const eliminarReunionApoderado = async (id) => {
  await http.delete(`/api/reuniones/apoderados/${id}`)
  return { data: { ok: true } }
}

export const getEventos = async () => {
  const res = await http.get('/api/calendario/eventos')
  return { data: res.data || [] }
}

export const crearEvento = async (data) => {
  const res = await http.post('/api/calendario/eventos', {
    nombre: data.nombre,
    descripcion: data.descripcion || '',
    fechaInicio: data.fechaInicio,
    fechaFin: data.fechaFin || data.fechaInicio,
    horaInicio: data.horaInicio.length === 5 ? `${data.horaInicio}:00` : data.horaInicio,
    horaFin: data.horaFin.length === 5 ? `${data.horaFin}:00` : data.horaFin,
    tipo: data.tipo || 'ACADEMICO',
    ubicacion: data.ubicacion || '',
    activo: true,
  })
  return { data: res.data }
}

export const eliminarEvento = async (id) => {
  await http.delete(`/api/calendario/eventos/${id}`)
  return { data: { ok: true } }
}
