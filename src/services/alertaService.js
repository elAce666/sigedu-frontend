// =============================================================
// SERVICIO DE ALERTAS — services/alertaService.js
// =============================================================
// Coherente con los MS actuales: las notificaciones se representan
// como mensajes recibidos del microservicio mensajeria (8089).
// =============================================================
import http from './httpClient'

const soloRun = (valor) => String(valor || '').split('-')[0].replace(/\D/g, '')

const mapAlerta = (mensaje) => ({
  id: mensaje.idMensaje,
  apoderadoRun: mensaje.runReceptorRef,
  tipo: 'MENSAJE',
  titulo: mensaje.asunto,
  mensaje: mensaje.contenido,
  leida: mensaje.leido === true,
  fecha: mensaje.fechaEnvio,
  origen: 'MENSAJERIA',
  referenciaId: mensaje.idMensaje,
})

export const getAlertasPorApoderado = async () => {
  const res = await http.get('/api/mensajeria/recibidos')
  return { data: (res.data || []).map(mapAlerta).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) }
}

export const getAlertasNoLeidas = async () => {
  const res = await getAlertasPorApoderado()
  return { data: res.data.filter((alerta) => !alerta.leida) }
}

export const crearAlerta = async ({ apoderadoRun, titulo, mensaje }) => {
  const res = await http.post('/api/mensajeria/enviar', {
    runReceptor: soloRun(apoderadoRun),
    asunto: titulo,
    contenido: mensaje,
  })
  window.dispatchEvent(new Event('sigedu:alertas-changed'))
  return { data: mapAlerta(res.data) }
}

export const crearAlertaPorEstudiante = async ({ titulo, mensaje }) => {
  const res = await http.post('/api/mensajeria/masivo', {
    asunto: titulo,
    contenido: mensaje,
  })
  window.dispatchEvent(new Event('sigedu:alertas-changed'))
  return { data: mapAlerta(res.data) }
}

export const marcarAlertaLeida = async (id) => {
  const res = await http.put(`/api/mensajeria/leido/${id}`)
  window.dispatchEvent(new Event('sigedu:alertas-changed'))
  return { data: mapAlerta(res.data) }
}
