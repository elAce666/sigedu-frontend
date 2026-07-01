// =============================================================
// SERVICIO DE ALERTAS — services/alertaService.js
// =============================================================
import { getDB, setDB, nextId } from '../mock/db'
import { resolveData, rejectError } from './apiClient'

const emitAlertasChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sigedu:alertas-changed'))
  }
}

export const getAlertasPorApoderado = (apoderadoRun) => {
  const db = getDB()
  const alertas = db.alertas
    .filter((a) => a.apoderadoRun === apoderadoRun)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return resolveData(alertas)
}

export const getAlertasNoLeidas = (apoderadoRun) => {
  const db = getDB()
  const alertas = db.alertas
    .filter((a) => a.apoderadoRun === apoderadoRun && !a.leida)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return resolveData(alertas)
}

export const crearAlerta = (data) => {
  const db = getDB()
  const nueva = { id: nextId(db.alertas), ...data }
  db.alertas.push(nueva)
  setDB(db)
  emitAlertasChanged()
  return resolveData(nueva)
}

export const crearAlertaPorEstudiante = ({ estudianteRun, tipo, titulo, mensaje, origen, referenciaId }) => {
  const db = getDB()
  const estudiante = db.usuarios.find((u) => u.run === estudianteRun)
  if (!estudiante) return rejectError('Estudiante no encontrado', 404)

  const apoderadoRun = estudiante.apoderadoRun
  if (!apoderadoRun) return rejectError('El estudiante no tiene apoderado asociado', 400)

  const nueva = {
    id: nextId(db.alertas),
    apoderadoRun,
    estudianteRun,
    tipo,
    titulo,
    mensaje,
    leida: false,
    fecha: new Date().toISOString(),
    origen,
    referenciaId,
  }

  db.alertas.push(nueva)
  setDB(db)
  emitAlertasChanged()
  return resolveData(nueva)
}

export const marcarAlertaLeida = (id) => {
  const db = getDB()
  const idx = db.alertas.findIndex((a) => a.id === id)
  if (idx === -1) return rejectError('Alerta no encontrada', 404)
  db.alertas[idx] = { ...db.alertas[idx], leida: true }
  setDB(db)
  emitAlertasChanged()
  return resolveData(db.alertas[idx])
}
