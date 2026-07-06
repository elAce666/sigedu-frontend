// =============================================================
// GESTIÓN DE MATRÍCULA (ADMIN/DIRECTIVO) — pages/AdminMatriculas
// =============================================================
// Conectada al microservicio real de matrícula (8088): listar,
// inscribir y anular matrículas de estudiantes en cursos reales
// de academica (8083).
// =============================================================
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { RiAddLine, RiDeleteBinLine, RiFileList3Line, RiUserLine } from 'react-icons/ri'
import { getMatriculas, crearMatricula, eliminarMatricula, getPeriodos } from '../../services/matriculaService'
import { getAllUsuarios, getCursos } from '../../services/usuarioService'
import PageHeader from '../../components/UI/PageHeader'
import StatCard from '../../components/UI/StatCard'
import Modal from '../../components/Modal/Modal'
import '../../styles/admin.scss'

export default function AdminMatriculas() {
  const [matriculas, setMatriculas] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [cursos, setCursos] = useState([])
  const [periodos, setPeriodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  const cargar = () => {
    Promise.all([getMatriculas(), getAllUsuarios(), getCursos(), getPeriodos()])
      .then(([resM, resU, resC, resP]) => {
        setMatriculas(resM.data)
        setEstudiantes(resU.data.filter((u) => u.rol === 'ESTUDIANTE'))
        setCursos(resC.data)
        setPeriodos(resP.data)
      })
      .catch(() => toast.error('No se pudieron cargar las matrículas'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const onGuardar = async (data) => {
    try {
      await crearMatricula(data)
      toast.success('Matrícula registrada')
      setModalAbierto(false)
      reset()
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.error || 'No se pudo registrar la matrícula')
    }
  }

  const onEliminar = async (id) => {
    if (!confirm('¿Anular esta matrícula?')) return
    try {
      await eliminarMatricula(id)
      toast.success('Matrícula anulada')
      cargar()
    } catch {
      toast.error('No se pudo anular la matrícula')
    }
  }

  if (loading) return <div className="loading-state">Cargando matrículas...</div>

  const nombreEstudiante = (run) => estudiantes.find((e) => e.run === run)?.nombre || run
  const nombreCurso = (id) => cursos.find((c) => c.id === id)?.nombre || `Curso ${id}`
  const nombrePeriodo = (id) => periodos.find((p) => p.id === id)?.nombre || `Periodo ${id}`

  return (
    <div className="page-content">
      <PageHeader
        title="Gestión de Matrícula"
        subtitle="Inscripción de estudiantes en cursos del año académico"
        action={<button className="btn-primary" onClick={() => setModalAbierto(true)}><RiAddLine /> Nueva matrícula</button>}
      />

      <div className="stats-grid">
        <StatCard icon={<RiFileList3Line />} label="Matrículas registradas" value={matriculas.length} tone="primario" />
        <StatCard icon={<RiUserLine />} label="Estudiantes en el sistema" value={estudiantes.length} tone="exito" />
        <StatCard icon={<RiFileList3Line />} label="Cursos disponibles" value={cursos.length} tone="dorado" />
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Estudiante</th><th>RUN</th><th>Curso</th><th>Periodo</th><th>Año</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {matriculas.length === 0 ? (
              <tr><td colSpan={7} className="text-suave">Aún no hay matrículas registradas.</td></tr>
            ) : matriculas.map((m) => (
              <tr key={m.id}>
                <td>{nombreEstudiante(m.estudianteRun)}</td>
                <td>{m.estudianteRun}</td>
                <td>{nombreCurso(m.cursoId)}</td>
                <td>{nombrePeriodo(m.periodoId)}</td>
                <td>{m.anioAcademico}</td>
                <td><span className={`nota-pill ${m.estado === 'ACTIVA' ? 'nota-pill--ok' : ''}`}>{m.estado}</span></td>
                <td className="admin-acciones">
                  <button className="danger" onClick={() => onEliminar(m.id)} aria-label="Anular"><RiDeleteBinLine /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal title="Nueva matrícula" onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit(onGuardar)}>
            <div className="form-group">
              <label>Estudiante</label>
              <select {...register('estudianteRun', { required: 'Selecciona un estudiante' })}>
                {estudiantes.map((e) => (
                  <option key={e.run} value={e.run}>{e.nombre} — {e.runCompleto || e.run}</option>
                ))}
              </select>
              {errors.estudianteRun && <span className="error-msg">{errors.estudianteRun.message}</span>}
            </div>
            <div className="form-group">
              <label>Curso</label>
              <select {...register('cursoId', { required: 'Selecciona un curso' })}>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Periodo</label>
              <select {...register('periodoId', { required: 'Selecciona un periodo' })}>
                {periodos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Año académico</label>
              <input type="number" defaultValue={new Date().getFullYear()}
                {...register('anioAcademico', { required: 'Campo obligatorio' })} />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select {...register('estado', { required: true })}>
                <option value="ACTIVA">Activa</option>
                <option value="REGULAR">Regular</option>
                <option value="RETIRADA">Retirada</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>
              {isSubmitting ? 'Guardando...' : 'Registrar matrícula'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
