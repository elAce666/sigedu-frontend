// =============================================================
// SERVICIO HOJA DE VIDA — services/hojaVidaService.js
// =============================================================
// Refleja el "Microservicio: Hoja de Vida": docente/inspector
// registran anotaciones positivas o negativas, que se anexan al
// historial del estudiante; apoderado/estudiante solo consultan.
// =============================================================
import { getDB, setDB, nextId } from '../mock/db'
import { resolveData } from './apiClient'
import { crearAlertaPorEstudiante } from './alertaService'

export const getHojaVida = (estudianteRun) => {
  const db = getDB()
  const anotaciones = db.hojaVida
    .filter((h) => h.estudianteRun === estudianteRun)
    .map((h) => ({ ...h, autor: db.usuarios.find((u) => u.run === h.autorRun) }))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return resolveData(anotaciones)
}

export const registrarAnotacion = ({ estudianteRun, tipo, detalle, autorRun }) => {
  const db = getDB()
  const nueva = {
    id: nextId(db.hojaVida),
    estudianteRun,
    tipo, // 'positiva' | 'negativa'
    detalle,
    autorRun,
    fecha: new Date().toISOString().slice(0, 10),
  }
  db.hojaVida.push(nueva)
  setDB(db)

  if (tipo === 'negativa') {
    crearAlertaPorEstudiante({
      estudianteRun,
      tipo: 'anotacion_negativa',
      titulo: 'Nueva anotación negativa',
      mensaje: `Se registró una anotación negativa: ${detalle}`,
      origen: 'hojaVida',
      referenciaId: nueva.id,
    })
  }

  return resolveData(nueva)
}
