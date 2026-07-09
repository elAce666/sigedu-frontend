import { useEffect, useMemo, useState } from 'react'
import { getAllUsuarios, getCursos } from '../../services/usuarioService'
import { getNotasPorEstudiante } from '../../services/notaService'
import { getAsistenciaPorEstudiante } from '../../services/asistenciaService'
import PageHeader from '../../components/UI/PageHeader'
import StatCard from '../../components/UI/StatCard'
import './Reportes.scss'

const promedio = (items) => {
  if (!items.length) return '0.0'
  const total = items.reduce((sum, item) => sum + Number(item.valor || 0), 0)
  return (total / items.length).toFixed(1)
}

const porcentajeAsistencia = (items) => {
  if (!items.length) return '0%'
  const presentes = items.filter((item) => ['presente', 'atrasado'].includes(String(item.estado || '').toLowerCase())).length
  return Math.round((presentes / items.length) * 100) + '%'
}

export default function Reportes() {
  const [cursos, setCursos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [notas, setNotas] = useState([])
  const [asistencias, setAsistencias] = useState([])
  const [cursoId, setCursoId] = useState('')
  const [loading, setLoading] = useState(true)
  const [cargandoReportes, setCargandoReportes] = useState(false)

  useEffect(() => {
    Promise.all([getCursos(), getAllUsuarios()])
      .then(([resCursos, resUsuarios]) => {
        setCursos(resCursos.data)
        setUsuarios(resUsuarios.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const cursosConEstudiantes = useMemo(() => {
    return cursos
      .map((curso) => {
        const estudiantes = usuarios.filter((usuario) => usuario.rol === 'ESTUDIANTE' && usuario.curso === curso.nombre)
        return { ...curso, estudiantes }
      })
      .filter((curso) => curso.estudiantes.length > 0)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [cursos, usuarios])

  useEffect(() => {
    if (cursoId && cursosConEstudiantes.some((curso) => String(curso.id) === String(cursoId))) return
    setCursoId(String(cursosConEstudiantes[0]?.id || ''))
  }, [cursoId, cursosConEstudiantes])

  const cursoSeleccionado = cursosConEstudiantes.find((item) => String(item.id) === String(cursoId))
  const estudiantesCurso = useMemo(() => cursoSeleccionado?.estudiantes || [], [cursoSeleccionado])

  useEffect(() => {
    if (!cursoSeleccionado) {
      setNotas([])
      setAsistencias([])
      return
    }

    setCargandoReportes(true)

    Promise.all([
      Promise.all(estudiantesCurso.map((estudiante) => getNotasPorEstudiante(estudiante.run))),
      Promise.all(estudiantesCurso.map((estudiante) => getAsistenciaPorEstudiante(estudiante.run))),
    ])
      .then(([resNotas, resAsistencia]) => {
        const notasPlanas = resNotas.flatMap((res, index) => (
          res.data.map((nota) => ({
            ...nota,
            estudianteNombre: estudiantesCurso[index]?.nombre || nota.estudianteRun,
            curso: cursoSeleccionado.nombre,
          }))
        ))
        const asistenciaPlana = resAsistencia.flatMap((res, index) => (
          res.data.map((registro) => ({
            ...registro,
            estudianteNombre: estudiantesCurso[index]?.nombre || registro.estudianteRun,
            curso: cursoSeleccionado.nombre,
          }))
        ))

        setNotas(notasPlanas)
        setAsistencias(asistenciaPlana)
      })
      .finally(() => setCargandoReportes(false))
  }, [cursoSeleccionado, estudiantesCurso])

  if (loading) return <div className="loading-state">Cargando reportes...</div>

  return (
    <div className="page-content reportes">
      <PageHeader
        title="Reportes"
        subtitle="Notas y asistencia por curso"
      />

      <div className="reportes__filtro">
        <label>Curso</label>
        <select value={cursoId} onChange={(e) => setCursoId(e.target.value)} disabled={!cursosConEstudiantes.length}>
          {cursosConEstudiantes.length === 0 ? (
            <option value="">Sin cursos con estudiantes</option>
          ) : cursosConEstudiantes.map((curso) => (
            <option key={curso.id} value={curso.id}>{curso.nombre} ({curso.estudiantes.length})</option>
          ))}
        </select>
      </div>

      <div className="stats-grid reportes__stats">
        <StatCard tone="primario" label="Estudiantes" value={estudiantesCurso.length} />
        <StatCard tone="dorado" label="Notas registradas" value={notas.length} />
        <StatCard tone="exito" label="Promedio general" value={promedio(notas)} />
        <StatCard tone="advertencia" label="Asistencia" value={porcentajeAsistencia(asistencias)} />
      </div>

      <section className="reportes__section">
        <h2>Notas</h2>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Estudiante</th><th>Asignatura</th><th>Valor</th><th>Fecha</th><th>Descripcion</th></tr>
            </thead>
            <tbody>
              {cargandoReportes ? (
                <tr><td colSpan="5">Cargando...</td></tr>
              ) : notas.length === 0 ? (
                <tr><td colSpan="5">No hay notas registradas para este curso.</td></tr>
              ) : notas.map((nota) => (
                <tr key={nota.id}>
                  <td>{nota.estudianteNombre}</td>
                  <td>{nota.asignatura?.nombre || nota.asignaturaId}</td>
                  <td>{nota.valor}</td>
                  <td>{nota.fecha}</td>
                  <td>{nota.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="reportes__section">
        <h2>Asistencia</h2>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Estudiante</th><th>Fecha</th><th>Estado</th><th>Justificada</th></tr>
            </thead>
            <tbody>
              {cargandoReportes ? (
                <tr><td colSpan="4">Cargando...</td></tr>
              ) : asistencias.length === 0 ? (
                <tr><td colSpan="4">No hay asistencias registradas para este curso.</td></tr>
              ) : asistencias.map((registro) => (
                <tr key={registro.id}>
                  <td>{registro.estudianteNombre}</td>
                  <td>{registro.fecha}</td>
                  <td>{registro.estado}</td>
                  <td>{registro.justificada ? 'Si' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
