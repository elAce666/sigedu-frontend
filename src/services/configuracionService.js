// =============================================================
// SERVICIO DE CONFIGURACIÓN — services/configuracionService.js
// =============================================================
// NOTA: sigue en mock — el backend no expone configuración
// institucional (clave/valor); candidato a futuro microservicio.
import { getDB, setDB, nextId } from '../mock/db'
import { resolveData, rejectError } from './apiClient'

export const getConfiguraciones = () => {
  const db = getDB()
  return resolveData(db.configuraciones)
}

export const crearConfiguracion = (data) => {
  const db = getDB()
  const nueva = { id: nextId(db.configuraciones), ...data }
  db.configuraciones.push(nueva)
  setDB(db)
  return resolveData(nueva)
}

export const actualizarConfiguracion = (id, data) => {
  const db = getDB()
  const idx = db.configuraciones.findIndex((item) => item.id === id)
  if (idx === -1) return rejectError('Configuración no encontrada', 404)
  db.configuraciones[idx] = { ...db.configuraciones[idx], ...data }
  setDB(db)
  return resolveData(db.configuraciones[idx])
}

export const eliminarConfiguracion = (id) => {
  const db = getDB()
  const idx = db.configuraciones.findIndex((item) => item.id === id)
  if (idx === -1) return rejectError('Configuración no encontrada', 404)
  db.configuraciones.splice(idx, 1)
  setDB(db)
  return resolveData({ ok: true })
}
