import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { RiAddLine, RiDeleteBinLine, RiPencilLine } from 'react-icons/ri'
import { getAllUsuarios, getCursos } from '../../services/usuarioService'
import {
  actualizarMatricula,
  crearMatricula,
  eliminarMatricula,
  getMatriculas,
  getPeriodos,
} from '../../services/matriculaService'
import PageHeader from '../../components/UI/PageHeader'
import Modal from '../../components/Modal/Modal'
import './AdminAsignacion.scss'

export default function AdminAsignacion() {
  const [usuarios, setUsuarios] = useState([])
  const [cursos, setCursos] = useState([])
  const [matriculas, setMatriculas] = useState([])
  const [periodos, setPeriodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting, errors } } = useForm()

  const matriculaPorRun = useMemo(() => {
    const mapa = {}
    matriculas.forEach((matricula) => {
      if (!mapa[matricula.estudianteRun] || matricula.estado === 'ACTIVA') {
        mapa[matricula.estudianteRun] = matricula
      }
    })
    return mapa
  }, [matriculas])

  const cargar = () => {
    setLoading(true)
    Promise.all([getAllUsuarios(), getCursos(), getMatriculas(), getPeriodos()])
      .then(([resUsuarios, resCursos, resMatriculas, resPeriodos]) => {
        setUsuarios(resUsuarios.data)
        setCursos(resCursos.data)
        setMatriculas(resMatriculas.data)
        setPeriodos(resPeriodos.data)
      })
      .catch(() => toast.error('No se pudieron cargar las asignaciones'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const estudiantes = useMemo(() => usuarios.filter((usuario) => usuario.rol === 'ESTUDIANTE'), [usuarios])

  const cursoDeEstudiante = (estudiante) => {
    const matricula = matriculaPorRun[estudiante.run]
    return cursos.find((curso) => curso.id === matricula?.cursoId)
  }

  const abrirNuevo = () => {
    setEditando(null)
    reset({ run: '', cursoId: '' })
    setModalAbierto(true)
  }

  const abrirEditar = (estudiante) => {
    const matricula = matriculaPorRun[estudiante.run]
    setEditando(estudiante)
    setValue('run', estudiante.run)
    setValue('cursoId', String(matricula?.cursoId || ''))
    setModalAbierto(true)
  }

  const periodoActual = () => {
    const anio = new Date().getFullYear()
    return periodos.find((periodo) => String(periodo.nombre || '').includes(String(anio))) || periodos[0]
  }

  const onGuardar = async (data) => {
    const estudianteRun = data.run
    const curso = cursos.find((item) => item.id === Number(data.cursoId))
    const periodo = periodoActual()
    if (!curso) return toast.error('Debe seleccionar un curso')
    if (!periodo) return toast.error('No hay periodos academicos disponibles')

    const existente = matriculaPorRun[estudianteRun]
    const payload = {
      estudianteRun,
      cursoId: curso.id,
      periodoId: existente?.periodoId || periodo.id,
      anioAcademico: existente?.anioAcademico || new Date().getFullYear(),
      estado: existente?.estado || 'ACTIVA',
    }

    try {
      if (existente) {
        await actualizarMatricula(existente.id, payload)
      } else {
        await crearMatricula(payload)
      }
      toast.success('Asignacion actualizada')
      setModalAbierto(false)
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.mensaje || 'No se pudo guardar la asignacion')
    }
  }

  const onEliminar = async (estudiante) => {
    const matricula = matriculaPorRun[estudiante.run]
    if (!matricula) return toast.info('El estudiante no tiene una asignacion vigente')
    if (!confirm(`Quitar a ${estudiante.nombre} de su curso actual?`)) return
    try {
      await eliminarMatricula(matricula.id)
      toast.success('Asignacion eliminada')
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.mensaje || 'No se pudo eliminar la asignacion')
    }
  }

  if (loading) return <div className="loading-state">Cargando asignaciones...</div>

  return (
    <div className="page-content admin-asignacion">
      <PageHeader
        title="Asignacion de alumnos"
        subtitle="Relacion entre estudiantes y cursos/paralelos"
        action={<button className="btn-primary" onClick={abrirNuevo}><RiAddLine /> Nueva asignacion</button>}
      />

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Estudiante</th><th>RUN</th><th>Curso</th><th></th></tr>
          </thead>
          <tbody>
            {estudiantes.map((estudiante) => {
              const curso = cursoDeEstudiante(estudiante)
              return (
                <tr key={estudiante.run}>
                  <td>{estudiante.nombre}</td>
                  <td>{estudiante.run}</td>
                  <td>{curso?.nombre || 'Sin asignacion'}</td>
                  <td className="admin-acciones">
                    <button onClick={() => abrirEditar(estudiante)} aria-label="Editar"><RiPencilLine /></button>
                    <button className="danger" onClick={() => onEliminar(estudiante)} aria-label="Eliminar"><RiDeleteBinLine /></button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal title="Asignar estudiante a curso" onClose={() => setModalAbierto(false)}>
          <form className="admin-form" onSubmit={handleSubmit(onGuardar)}>
            <div className="form-group">
              <label>Estudiante</label>
              <select disabled={!!editando} {...register('run', { required: 'Campo obligatorio' })}>
                <option value="">Seleccione...</option>
                {estudiantes.map((estudiante) => <option key={estudiante.run} value={estudiante.run}>{estudiante.nombre}</option>)}
              </select>
              {errors.run && <span className="error-msg">{errors.run.message}</span>}
            </div>
            <div className="form-group">
              <label>Curso</label>
              <select {...register('cursoId', { required: 'Campo obligatorio' })}>
                <option value="">Seleccione...</option>
                {cursos.map((curso) => <option key={curso.id} value={curso.id}>{curso.nombre}</option>)}
              </select>
              {errors.cursoId && <span className="error-msg">{errors.cursoId.message}</span>}
            </div>
            <button type="submit" className="btn-primary admin-form__submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar asignacion'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
