// =============================================================
// SERVICIO DE MENSAJERIA - services/mensajeriaService.js
// =============================================================
// Conectado al microservicio real de mensajeria (8089):
//   GET    /api/mensajeria/recibidos
//   GET    /api/mensajeria/enviados
//   POST   /api/mensajeria/enviar
//   POST   /api/mensajeria/masivo
//   POST   /api/mensajeria/responder/{id}
//   PUT    /api/mensajeria/leido/{id}
//   DELETE /api/mensajeria/{id}
// =============================================================
import http from './httpClient'
import { getAllUsuarios } from './usuarioService'

const soloRun = (valor) => String(valor || '').split('-')[0].replace(/D/g, '')

const mapMensaje = (dto) => ({
  id: dto.idMensaje,
  emisorRun: dto.runEmisorRef,
  receptorRun: dto.runReceptorRef,
  asunto: dto.asunto,
  contenido: dto.contenido,
  fecha: dto.fechaEnvio,
  leido: dto.leido === true,
})

const cargarDirectorio = async () => {
  try {
    const res = await getAllUsuarios()
    const porRun = {}
    res.data.forEach((u) => { porRun[u.run] = u })
    return porRun
  } catch {
    return {}
  }
}

export const getBandejaEntrada = async () => {
  const [res, directorio] = await Promise.all([http.get('/api/mensajeria/recibidos'), cargarDirectorio()])
  const mensajes = (res.data || [])
    .map(mapMensaje)
    .map((m) => ({ ...m, emisor: directorio[m.emisorRun] || { run: m.emisorRun, nombre: m.emisorRun } }))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return { data: mensajes }
}

export const getBandejaEnviados = async () => {
  const [res, directorio] = await Promise.all([http.get('/api/mensajeria/enviados'), cargarDirectorio()])
  const mensajes = (res.data || [])
    .map(mapMensaje)
    .map((m) => ({ ...m, receptor: directorio[m.receptorRun] || { run: m.receptorRun, nombre: m.receptorRun || 'Comunidad SIGEDU' } }))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return { data: mensajes }
}

export const enviarMensaje = async ({ emisorRun, receptorRun, asunto, contenido }) => {
  const res = await http.post('/api/mensajeria/enviar', {
    runEmisor: soloRun(emisorRun),
    runReceptor: soloRun(receptorRun),
    asunto,
    contenido,
  })
  return { data: mapMensaje(res.data) }
}

export const enviarMensajeMasivo = async ({ emisorRun, receptoresRun = [], asunto, contenido }) => {
  await http.post('/api/mensajeria/masivo', {
    runEmisor: soloRun(emisorRun),
    runReceptores: [...new Set(receptoresRun.map(soloRun).filter(Boolean))],
    asunto,
    contenido,
  })
  return { data: { enviados: receptoresRun?.length ?? 0 } }
}

export const responderMensaje = async ({ id, emisorRun, asunto, contenido }) => {
  const res = await http.post('/api/mensajeria/responder/' + id, {
    runEmisor: soloRun(emisorRun),
    asunto,
    contenido,
  })
  return { data: mapMensaje(res.data) }
}

export const marcarLeido = async (id) => {
  const res = await http.put('/api/mensajeria/leido/' + id)
  return { data: mapMensaje(res.data) }
}

export const eliminarMensaje = async (id) => {
  await http.delete('/api/mensajeria/' + id)
  return { data: { ok: true } }
}
