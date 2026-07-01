// =============================================================
// PÁGINA DE NOTAS — pages/Notas/Notas.jsx
// =============================================================
// DOCENTE   -> registra calificaciones para sus estudiantes.
// APODERADO -> consulta las notas de su(s) pupilo(s).
// ESTUDIANTE-> consulta sus propias notas + promedio por asignatura.
// (Refleja el "MICROSERVICIO Gestión de Notas" del diagrama de
// casos de uso: Registrar/Modificar -> Actualiza Promedio).
// =============================================================
import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { RiAddLine, RiBarChartBoxLine, RiBook2Line } from 'react-icons/ri'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useAuth } from '../../hooks/useAuth'
import { getEstudiantesVinculados, getAsignaturas, getCursos } from '../../services/usuarioService'
import { getNotasPorEstudiante, getPromediosPorAsignatura, registrarNota } from '../../services/notaService'
import PageHeader from '../../components/UI/PageHeader'
import Modal from '../../components/Modal/Modal'
import '../../styles/notas.scss'

export default function Notas() {
  const { usuario, hasRole } = useAuth()
  const esDocente = hasRole('DOCENTE')

  const [estudiantes, setEstudiantes] = useState([])
  const [asignaturas, setAsignaturas] = useState([])
  const [seleccionado, setSeleccionado] = useState('')
  const [notas, setNotas] = useState([])
  const [promedios, setPromedios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    Promise.all([getEstudiantesVinculados(usuario), getAsignaturas(), getCursos()])
      .then(([resE, resA, resC]) => {
        let estudiantesData = resE.data
        let asignaturasData = resA.data

        if (esDocente) {
          const cursosDocenteIds = [...new Set(asignaturasData.filter((a) => a.docenteRun === usuario.run).map((a) => a.cursoId))]
          const cursosDocenteNombres = resC.data.filter((curso) => cursosDocenteIds.includes(curso.id)).map((curso) => curso.nombre)
          estudiantesData = estudiantesData.filter((estudiante) => cursosDocenteNombres.includes(estudiante.curso))
          asignaturasData = asignaturasData.filter((a) => a.docenteRun === usuario.run)
        }

        setEstudiantes(estudiantesData)
        setAsignaturas(asignaturasData)
        if (estudiantesData.length) setSeleccionado(estudiantesData[0].run)
        else setSeleccionado('')
      })
      .finally(() => setLoading(false))
  }, [usuario, esDocente])

  const cargarNotas = useCallback(() => {
    if (!seleccionado) return
    Promise.all([getNotasPorEstudiante(seleccionado), getPromediosPorAsignatura(seleccionado)])
      .then(([resN, resP]) => { setNotas(resN.data); setPromedios(resP.data) })
  }, [seleccionado])

  useEffect(() => { cargarNotas() }, [cargarNotas])

  const onRegistrar = async (data) => {
    try {
      await registrarNota({
        estudianteRun: seleccionado,
        asignaturaId: Number(data.asignaturaId),
        valor: Number(data.valor),
        descripcion: data.descripcion,
        fecha: data.fecha,
        docenteRun: usuario.run,
      })
      toast.success('Calificación registrada y promedio actualizado')
      setModalAbierto(false)
      reset()
      cargarNotas()
    } catch {
      toast.error('No se pudo registrar la calificación')
    }
  }

  const estudianteActual = estudiantes.find((e) => e.run === seleccionado)

  if (loading) return <div className="loading-state">Cargando notas...</div>

  return (
    <div className="page-content">
      <PageHeader
        title="Notas y Calificaciones"
        subtitle={esDocente ? 'Registra y consulta las calificaciones de tus estudiantes' : 'Consulta el rendimiento académico'}
        action={esDocente && (
          <button className="btn-primary" onClick={() => setModalAbierto(true)}>
            <RiAddLine /> Registrar nota
          </button>
        )}
      />

      {estudiantes.length > 1 && (
        <div className="selector-pupilo">
          <label>{esDocente ? 'Estudiante:' : 'Pupilo/a:'}</label>
          <select value={seleccionado} onChange={(e) => setSeleccionado(e.target.value)}>
            {estudiantes.map((e) => (
              <option key={e.run} value={e.run}>{e.nombre} — {e.curso}</option>
            ))}
          </select>
        </div>
      )}

      {estudianteActual && (
        <p className="notas__curso text-suave">
          <RiBook2Line /> {estudianteActual.nombre} · {estudianteActual.curso}
        </p>
      )}

      <div className="notas__chart card">
        <h3><RiBarChartBoxLine /> Promedio por asignatura</h3>
        {promedios.length === 0 ? (
          <p className="text-suave">Aún no hay calificaciones registradas.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={promedios}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9EDF5" />
              <XAxis dataKey="asignatura" tick={{ fontSize: 12 }} />
              <YAxis domain={[1, 7]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="promedio" fill="#1B3A6B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Asignatura</th>
              <th>Evaluación</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {notas.length === 0 ? (
              <tr><td colSpan={4} className="text-suave">Sin registros aún.</td></tr>
            ) : notas.map((n) => (
              <tr key={n.id}>
                <td>{n.fecha}</td>
                <td>{n.asignatura?.nombre || '—'}</td>
                <td>{n.descripcion}</td>
                <td>
                  <span className={`nota-pill ${n.valor < 4 ? 'nota-pill--baja' : 'nota-pill--ok'}`}>
                    {n.valor.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal title="Registrar calificación" onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit(onRegistrar)}>
            <div className="form-group">
              <label>Asignatura</label>
              <select {...register('asignaturaId', { required: true })}>
                {asignaturas.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Evaluación / descripción</label>
              <input type="text" placeholder="Ej: Prueba Unidad 2" {...register('descripcion', { required: 'Campo obligatorio' })} />
              {errors.descripcion && <span className="error-msg">{errors.descripcion.message}</span>}
            </div>
            <div className="form-group">
              <label>Nota (1.0 — 7.0)</label>
              <input type="number" step="0.1" min="1" max="7"
                {...register('valor', { required: 'Ingresa la nota', min: { value: 1, message: 'Mínimo 1.0' }, max: { value: 7, message: 'Máximo 7.0' } })} />
              {errors.valor && <span className="error-msg">{errors.valor.message}</span>}
            </div>
            <div className="form-group">
              <label>Fecha</label>
              <input type="date" {...register('fecha', { required: 'Selecciona una fecha' })} />
              {errors.fecha && <span className="error-msg">{errors.fecha.message}</span>}
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>
              {isSubmitting ? 'Guardando...' : 'Guardar calificación'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
