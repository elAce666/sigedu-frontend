import { useEffect, useMemo, useState } from 'react'
import { getAllUsuarios, getCursos } from '../../services/usuarioService'
import { getNotasPorEstudiante } from '../../services/notaService'
import { getAsistenciaPorEstudiante } from '../../services/asistenciaService'
import { getPagos } from '../../services/pagoService'
import PageHeader from '../../components/UI/PageHeader'
import StatCard from '../../components/UI/StatCard'
import './Reportes.scss'

const money = (value) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(value || 0))

export default function Reportes() {
  const [cursos, setCursos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [pagos, setPagos] = useState([])
  const [notas, setNotas] = useState([])
  const [asistencias, setAsistencias] = useState([])
  const [cursoId, setCursoId] = useState('')
  const [loading, setLoading] = useState(true)
  const [cargandoReportes, setCargandoReportes] = useState(false)

  useEffect(() => {
    Promise.all([getCursos(), getAllUsuarios(), getPagos()])
      .then(([resCursos, resUsuarios, resPagos]) => {
        setCursos(resCursos.data)
        setUsuarios(resUsuarios.data)
        setPagos(resPagos.data)
        setCursoId(String(resCursos.data[0]?.id || ''))
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const curso = cursos.find((item) => String(item.id) === String(cursoId))
    if (!curso) return

    const estudiantesCurso = usuarios.filter((usuario) => usuario.rol === 'ESTUDIANTE' && usuario.curso === curso.nombre)
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
            curso: curso.nombre,
          }))
        ))
        const asistenciaPlana = resAsistencia.flatMap((res, index) => (
          res.data.map((registro) => ({
            ...registro,
            estudianteNombre: estudiantesCurso[index]?.nombre || registro.estudianteRun,
            curso: curso.nombre,
          }))
        ))

        setNotas(notasPlanas)
        setAsistencias(asistenciaPlana)
      })
      .finally(() => setCargandoReportes(false))
  }, [cursoId, cursos, usuarios])

  const cursoSeleccionado = cursos.find((item) => String(item.id) === String(cursoId))
  const estudiantesCurso = useMemo(
    () => usuarios.filter((usuario) => usuario.rol === 'ESTUDIANTE' && usuario.curso === cursoSeleccionado?.nombre),
    [usuarios, cursoSeleccionado]
  )
  const pagosCurso = pagos.filter((pago) => estudiantesCurso.some((estudiante) => estudiante.run === pago.estudianteRun))

  if (loading) return <div className="loading-state">Cargando reportes...</div>

  return (
    <div className="page-content reportes">
      <PageHeader
        title="Reportes"
        subtitle="Notas, asistencia y pagos por curso"
      />

      <div className="reportes__filtro">
        <label>Curso</label>
        <select value={cursoId} onChange={(e) => setCursoId(e.target.value)}>
          {cursos.map((curso) => <option key={curso.id} value={curso.id}>{curso.nombre}</option>)}
        </select>
      </div>

      <div className="stats-grid reportes__stats">
        <StatCard tone="primario" label="Estudiantes" value={estudiantesCurso.length} />
        <StatCard tone="dorado" label="Notas registradas" value={notas.length} />
        <StatCard tone="advertencia" label="Asistencias" value={asistencias.length} />
        <StatCard tone="exito" label="Pagos" value={pagosCurso.length} />
      </div>

      <section className="reportes__section">
        <h2>Notas</h2>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Estudiante</th><th>Asignatura</th><th>Valor</th><th>Fecha</th><th>Descripción</th></tr>
            </thead>
            <tbody>
              {cargandoReportes ? (
                <tr><td colSpan="5">Cargando...</td></tr>
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
              ) : asistencias.map((registro) => (
                <tr key={registro.id}>
                  <td>{registro.estudianteNombre}</td>
                  <td>{registro.fecha}</td>
                  <td>{registro.estado}</td>
                  <td>{registro.justificada ? 'Sí' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="reportes__section">
        <h2>Pagos</h2>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Estudiante</th><th>Tipo</th><th>Monto</th><th>Fecha</th><th>Estado</th><th>Año</th></tr>
            </thead>
            <tbody>
              {pagosCurso.map((pago) => (
                <tr key={pago.id}>
                  <td>{usuarios.find((usuario) => usuario.run === pago.estudianteRun)?.nombre || pago.estudianteRun}</td>
                  <td>{pago.tipo}</td>
                  <td>{money(pago.monto)}</td>
                  <td>{pago.fecha}</td>
                  <td>{pago.estado}</td>
                  <td>{pago.anoAcademico}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
