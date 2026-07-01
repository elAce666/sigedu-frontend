// =============================================================
// SERVICIO DE NIVELES — services/nivelService.js
// =============================================================
import { getDB, setDB, nextId } from '../mock/db'
import { resolveData, rejectError } from './apiClient'

export const getNiveles = () => {
  const db = getDB()
  const niveles = [...db.niveles].sort((a, b) => a.orden - b.orden)
  return resolveData(niveles)
}

export const crearNivel = (data) => {
  const db = getDB()
  const nueva = { id: nextId(db.niveles), ...data }
  db.niveles.push(nueva)
  setDB(db)
  return resolveData(nueva)
}

export const actualizarNivel = (id, data) => {
  const db = getDB()
  const idx = db.niveles.findIndex((n) => n.id === id)
  if (idx === -1) return rejectError('Nivel no encontrado', 404)
  db.niveles[idx] = { ...db.niveles[idx], ...data }
  setDB(db)
  return resolveData(db.niveles[idx])
}

export const eliminarNivel = (id) => {
  const db = getDB()
  const idx = db.niveles.findIndex((n) => n.id === id)
  if (idx === -1) return rejectError('Nivel no encontrado', 404)
  db.niveles.splice(idx, 1)
  setDB(db)
  return resolveData({ ok: true })
}
