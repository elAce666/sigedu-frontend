// =============================================================
// SERVICIO DE MENSAJERÍA — services/mensajeriaService.js
// =============================================================
// Refleja el "MICROSERVICIO Mensajería Integrada": enviar mensaje
// individual, leer recibidos, responder en hilo y envío masivo
// (admin/directivo) que dispara notificación automática.
// =============================================================
import { getDB, setDB, nextId } from '../mock/db'
import { resolveData } from './apiClient'

export const getBandejaEntrada = (run) => {
  const db = getDB()
  const mensajes = db.mensajes
    .filter((m) => m.receptorRun === run)
    .map((m) => ({ ...m, emisor: db.usuarios.find((u) => u.run === m.emisorRun) }))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return resolveData(mensajes)
}

export const getBandejaEnviados = (run) => {
  const db = getDB()
  const mensajes = db.mensajes
    .filter((m) => m.emisorRun === run)
    .map((m) => ({ ...m, receptor: db.usuarios.find((u) => u.run === m.receptorRun) }))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return resolveData(mensajes)
}

export const enviarMensaje = ({ emisorRun, receptorRun, asunto, contenido }) => {
  const db = getDB()
  const nuevo = {
    id: nextId(db.mensajes),
    emisorRun,
    receptorRun,
    asunto,
    contenido,
    fecha: new Date().toISOString(),
    leido: false,
  }
  db.mensajes.push(nuevo)
  setDB(db)
  return resolveData(nuevo)
}

// Envío masivo (Admin/Directivo) a una lista de receptores.
export const enviarMensajeMasivo = ({ emisorRun, receptoresRun, asunto, contenido }) => {
  const db = getDB()
  const creados = receptoresRun.map((receptorRun) => ({
    id: nextId(db.mensajes) + Math.random(),
    emisorRun,
    receptorRun,
    asunto,
    contenido,
    fecha: new Date().toISOString(),
    leido: false,
  }))
  db.mensajes.push(...creados)
  setDB(db)
  return resolveData({ enviados: creados.length })
}

export const marcarLeido = (id) => {
  const db = getDB()
  const idx = db.mensajes.findIndex((m) => m.id === id)
  if (idx !== -1) {
    db.mensajes[idx].leido = true
    setDB(db)
  }
  return resolveData({ ok: true })
}
