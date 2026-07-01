import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { RiAddLine, RiDeleteBinLine, RiPencilLine } from 'react-icons/ri'
import { getAllUsuarios, getCursos, updateUsuario } from '../../services/usuarioService'
import PageHeader from '../../components/UI/PageHeader'
import Modal from '../../components/Modal/Modal'
import './AdminAsignacion.scss'

export default function AdminAsignacion() {
  const [usuarios, setUsuarios] = useState([])
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting, errors } } = useForm()

  const cargar = () => {
    Promise.all([getAllUsuarios(), getCursos()])
      .then(([resUsuarios, resCursos]) => {
        setUsuarios(resUsuarios.data)
        setCursos(resCursos.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const estudiantes = useMemo(() => usuarios.filter((usuario) => usuario.rol === 'ESTUDIANTE'), [usuarios])

  const abrirNuevo = () => {
    setEditando(null)
    reset({ run: '', cursoId: '' })
    setModalAbierto(true)
  }

  const abrirEditar = (estudiante) => {
    setEditando(estudiante)
    setValue('run', estudiante.run)
    setValue('cursoId', String(cursos.find((curso) => curso.nombre === estudiante.curso)?.id || ''))
    setModalAbierto(true)
  }

  const onGuardar = async (data) => {
    const curso = cursos.find((item) => item.id === Number(data.cursoId))
    if (!curso) return toast.error('Debe seleccionar un curso')

    try {
      await updateUsuario(data.run, { curso: curso.nombre, cursoId: curso.id })
      toast.success('Asignación actualizada')
      setModalAbierto(false)
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo guardar la asignación')
    }
  }

  const onEliminar = async (estudiante) => {
    if (!confirm(`¿Quitar a ${estudiante.nombre} de su curso actual?`)) return
    try {
      await updateUsuario(estudiante.run, { curso: '', cursoId: null })
      toast.success('Asignación eliminada')
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo eliminar la asignación')
    }
  }

  if (loading) return <div className="loading-state">Cargando asignaciones...</div>

  return (
    <div className="page-content admin-asignacion">
      <PageHeader
        title="Asignación de alumnos"
        subtitle="Relación entre estudiantes y cursos/paralelos"
        action={<button className="btn-primary" onClick={abrirNuevo}><RiAddLine /> Nueva asignación</button>}
      />

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Estudiante</th><th>RUN</th><th>Curso</th><th></th></tr>
          </thead>
          <tbody>
            {estudiantes.map((estudiante) => (
              <tr key={estudiante.run}>
                <td>{estudiante.nombre}</td>
                <td>{estudiante.run}</td>
                <td>{estudiante.curso || 'Sin asignación'}</td>
                <td className="admin-acciones">
                  <button onClick={() => abrirEditar(estudiante)} aria-label="Editar"><RiPencilLine /></button>
                  <button className="danger" onClick={() => onEliminar(estudiante)} aria-label="Eliminar"><RiDeleteBinLine /></button>
                </td>
              </tr>
            ))}
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
              {isSubmitting ? 'Guardando...' : 'Guardar asignación'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
