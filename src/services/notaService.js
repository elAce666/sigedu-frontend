// =============================================================
// SERVICIO DE NOTAS — services/notaService.js
// =============================================================
// Refleja el "MICROSERVICIO Gestión de Notas" del diagrama de
// casos de uso: registrar/modificar calificaciones dispara el
// recálculo de promedio; estudiante/apoderado solo consultan.
// =============================================================
import { getDB, setDB, nextId } from '../mock/db'
import { resolveData, rejectError } from './apiClient'
import { crearAlertaPorEstudiante } from './alertaService'

const docentePuedeGestionarAsignatura = (db, docenteRun, asignaturaId) => {
  const asignatura = db.asignaturas.find((a) => a.id === Number(asignaturaId))
  return asignatura?.docenteRun === docenteRun
}

const docentePuedeGestionarEstudiante = (db, docenteRun, estudianteRun) => {
  const estudiante = db.usuarios.find((u) => u.run === estudianteRun)
  if (!estudiante?.curso) return false
  const curso = db.cursos.find((c) => c.nombre === estudiante.curso)
  if (!curso) return false
  return db.asignaturas.some((a) => a.docenteRun === docenteRun && a.cursoId === curso.id)
}

export const getNotasPorEstudiante = (estudianteRun) => {
  const db = getDB()
  const notas = db.notas
    .filter((n) => n.estudianteRun === estudianteRun)
    .map((n) => ({ ...n, asignatura: db.asignaturas.find((a) => a.id === n.asignaturaId) }))
  return resolveData(notas)
}

export const getPromediosPorAsignatura = (estudianteRun) => {
  const db = getDB()
  const notas = db.notas.filter((n) => n.estudianteRun === estudianteRun)
  const porAsignatura = {}
  notas.forEach((n) => {
    if (!porAsignatura[n.asignaturaId]) porAsignatura[n.asignaturaId] = []
    porAsignatura[n.asignaturaId].push(n.valor)
  })
  const resultado = Object.entries(porAsignatura).map(([asignaturaId, valores]) => {
    const asignatura = db.asignaturas.find((a) => a.id === Number(asignaturaId))
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length
    return { asignatura: asignatura?.nombre || 'Asignatura', promedio: Number(promedio.toFixed(1)) }
  })
  return resolveData(resultado)
}

export const registrarNota = (data) => {
  const db = getDB()
  if (data.docenteRun) {
    if (!docentePuedeGestionarAsignatura(db, data.docenteRun, data.asignaturaId)) {
      return rejectError('No autorizado para registrar esta asignatura', 403)
    }
    if (!docentePuedeGestionarEstudiante(db, data.docenteRun, data.estudianteRun)) {
      return rejectError('No autorizado para registrar notas de este estudiante', 403)
    }
  }

  const nueva = { id: nextId(db.notas), ...data }
  db.notas.push(nueva)
  setDB(db)

  if (Number(nueva.valor) < 4) {
    crearAlertaPorEstudiante({
      estudianteRun: nueva.estudianteRun,
      tipo: 'nota_baja',
      titulo: 'Nota inferior a 4.0',
      mensaje: `Se registró una nota de ${nueva.valor} en ${db.asignaturas.find((a) => a.id === nueva.asignaturaId)?.nombre || 'una asignatura'}.`,
      origen: 'nota',
      referenciaId: nueva.id,
    })
  }

  return resolveData(nueva)
}

export const actualizarNota = (id, data) => {
  const db = getDB()
  const idx = db.notas.findIndex((n) => n.id === id)
  if (idx === -1) return rejectError('Nota no encontrada', 404)
  if (data.docenteRun) {
    const asignaturaId = data.asignaturaId || db.notas[idx].asignaturaId
    const estudianteRun = data.estudianteRun || db.notas[idx].estudianteRun
    if (!docentePuedeGestionarAsignatura(db, data.docenteRun, asignaturaId)) {
      return rejectError('No autorizado para editar esta asignatura', 403)
    }
    if (!docentePuedeGestionarEstudiante(db, data.docenteRun, estudianteRun)) {
      return rejectError('No autorizado para editar notas de este estudiante', 403)
    }
  }
  db.notas[idx] = { ...db.notas[idx], ...data }
  setDB(db)
  return resolveData(db.notas[idx])
}

export const eliminarNota = (id) => {
  const db = getDB()
  db.notas = db.notas.filter((n) => n.id !== id)
  setDB(db)
  return resolveData({ ok: true })
}
