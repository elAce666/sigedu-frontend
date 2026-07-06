// =============================================================
// SERVICIO DE ASISTENCIA — services/asistenciaService.js
// =============================================================
// NOTA: sigue en mock — no existe un microservicio de asistencia
// en el backend (los 10 MS actuales no cubren este dominio).
import { getDB, setDB, nextId } from '../mock/db'
import { resolveData, rejectError } from './apiClient'

const docentePuedeGestionarEstudiante = (db, docenteRun, estudianteRun) => {
  const estudiante = db.usuarios.find((u) => u.run === estudianteRun)
  if (!estudiante?.curso) return false
  const curso = db.cursos.find((c) => c.nombre === estudiante.curso)
  if (!curso) return false
  return db.asignaturas.some((a) => a.docenteRun === docenteRun && a.cursoId === curso.id)
}

export const getAsistenciaPorEstudiante = (estudianteRun) => {
  const db = getDB()
  const registros = db.asistencia
    .filter((a) => a.estudianteRun === estudianteRun)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return resolveData(registros)
}

export const getResumenAsistencia = (estudianteRun) => {
  const db = getDB()
  const registros = db.asistencia.filter((a) => a.estudianteRun === estudianteRun)
  const total = registros.length || 1
  const presentes = registros.filter((a) => a.estado === 'presente').length
  const ausentes = registros.filter((a) => a.estado === 'ausente').length
  const atrasos = registros.filter((a) => a.estado === 'atrasado').length
  const porcentaje = Math.round((presentes / total) * 100)
  return resolveData({ total, presentes, ausentes, atrasos, porcentaje })
}

export const registrarAsistencia = (data) => {
  const db = getDB()
  if (data.docenteRun && !docentePuedeGestionarEstudiante(db, data.docenteRun, data.estudianteRun)) {
    return rejectError('No autorizado para registrar asistencia de este estudiante', 403)
  }
  const nueva = { id: nextId(db.asistencia), ...data }
  db.asistencia.push(nueva)
  setDB(db)
  return resolveData(nueva)
}

export const actualizarAsistencia = (id, data) => {
  const db = getDB()
  const idx = db.asistencia.findIndex((a) => a.id === id)
  if (idx === -1) return rejectError('Registro no encontrado', 404)
  if (data.docenteRun || db.asistencia[idx].docenteRun) {
    const docenteRun = data.docenteRun || db.asistencia[idx].docenteRun
    const estudianteRun = data.estudianteRun || db.asistencia[idx].estudianteRun
    if (!docentePuedeGestionarEstudiante(db, docenteRun, estudianteRun)) {
      return rejectError('No autorizado para editar asistencia de este estudiante', 403)
    }
  }
  db.asistencia[idx] = { ...db.asistencia[idx], ...data }
  setDB(db)
  return resolveData(db.asistencia[idx])
}
