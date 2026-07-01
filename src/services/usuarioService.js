// =============================================================
// SERVICIO DE USUARIOS — services/usuarioService.js
// =============================================================
import { getDB, setDB, nextId } from '../mock/db'
import { resolveData, rejectError } from './apiClient'

const sinPassword = (u) => {
  const { password, ...resto } = u
  return resto
}

export const getAllUsuarios = () => {
  const db = getDB()
  return resolveData(db.usuarios.map(sinPassword))
}

export const getUsuarioByRun = (run) => {
  const db = getDB()
  const u = db.usuarios.find((x) => x.run === run)
  return u ? resolveData(sinPassword(u)) : rejectError('Usuario no encontrado', 404)
}

export const getCursos = () => {
  const db = getDB()
  return resolveData(db.cursos)
}

export const getAsignaturas = () => {
  const db = getDB()
  return resolveData(db.asignaturas)
}

export const getEstudiantesDeCurso = (cursoNombre) => {
  const db = getDB()
  return resolveData(
    db.usuarios.filter((u) => u.rol === 'ESTUDIANTE' && u.curso === cursoNombre).map(sinPassword)
  )
}

// Devuelve los estudiantes "vinculados" a un usuario:
//  - APODERADO  -> sus pupilos
//  - ESTUDIANTE -> él mismo
//  - DOCENTE/ADMIN -> todos los estudiantes (para fines de gestión)
export const getEstudiantesVinculados = (usuario) => {
  const db = getDB()
  let lista = []
  if (usuario.rol === 'APODERADO') {
    const apoderado = db.usuarios.find((u) => u.run === usuario.run)
    lista = db.usuarios.filter((u) => apoderado?.pupilosRun?.includes(u.run))
  } else if (usuario.rol === 'ESTUDIANTE') {
    lista = db.usuarios.filter((u) => u.run === usuario.run)
  } else {
    lista = db.usuarios.filter((u) => u.rol === 'ESTUDIANTE')
  }
  return resolveData(lista.map(sinPassword))
}

export const updateUsuario = (run, data) => {
  const db = getDB()
  const idx = db.usuarios.findIndex((u) => u.run === run)
  if (idx === -1) return rejectError('Usuario no encontrado', 404)
  db.usuarios[idx] = { ...db.usuarios[idx], ...data }
  setDB(db)
  return resolveData(sinPassword(db.usuarios[idx]))
}

export const createUsuario = (data) => {
  const db = getDB()
  if (db.usuarios.some((u) => u.email === data.email)) {
    return rejectError('Ya existe un usuario con ese correo', 409)
  }
  const nuevo = { run: data.run || `RUN-${nextId(db.usuarios)}`, ...data }
  db.usuarios.push(nuevo)
  setDB(db)
  return resolveData(sinPassword(nuevo))
}

export const deleteUsuario = (run) => {
  const db = getDB()
  db.usuarios = db.usuarios.filter((u) => u.run !== run)
  setDB(db)
  return resolveData({ ok: true })
}
