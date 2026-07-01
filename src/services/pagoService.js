// =============================================================
// SERVICIO DE PAGOS — services/pagoService.js
// =============================================================
import { getDB, setDB, nextId } from '../mock/db'
import { resolveData, rejectError } from './apiClient'

export const getPagos = (filtros = {}) => {
  const db = getDB()
  const pagos = db.pagos
    .filter((p) => {
      if (filtros.estudianteRun && p.estudianteRun !== filtros.estudianteRun) return false
      if (filtros.estado && p.estado !== filtros.estado) return false
      if (filtros.anoAcademico && p.anoAcademico !== Number(filtros.anoAcademico)) return false
      return true
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return resolveData(pagos)
}

export const registrarPago = (data) => {
  const db = getDB()
  const nuevo = { id: nextId(db.pagos), ...data }
  db.pagos.push(nuevo)
  setDB(db)
  return resolveData(nuevo)
}

export const actualizarPago = (id, data) => {
  const db = getDB()
  const idx = db.pagos.findIndex((p) => p.id === id)
  if (idx === -1) return rejectError('Pago no encontrado', 404)
  db.pagos[idx] = { ...db.pagos[idx], ...data }
  setDB(db)
  return resolveData(db.pagos[idx])
}

export const eliminarPago = (id) => {
  const db = getDB()
  const idx = db.pagos.findIndex((p) => p.id === id)
  if (idx === -1) return rejectError('Pago no encontrado', 404)
  db.pagos.splice(idx, 1)
  setDB(db)
  return resolveData({ ok: true })
}
