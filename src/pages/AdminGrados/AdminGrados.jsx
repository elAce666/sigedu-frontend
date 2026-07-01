import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { RiAddLine, RiDeleteBinLine, RiPencilLine } from 'react-icons/ri'
import { crearNivel, actualizarNivel, eliminarNivel, getNiveles } from '../../services/nivelService'
import PageHeader from '../../components/UI/PageHeader'
import Modal from '../../components/Modal/Modal'
import './AdminGrados.scss'

export default function AdminGrados() {
  const [niveles, setNiveles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting, errors } } = useForm()

  const cargar = () => {
    getNiveles()
      .then(({ data }) => setNiveles(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const abrirNuevo = () => {
    setEditando(null)
    reset({ nombre: '', orden: niveles.length + 1 })
    setModalAbierto(true)
  }

  const abrirEditar = (nivel) => {
    setEditando(nivel)
    Object.entries(nivel).forEach(([key, value]) => setValue(key, value))
    setModalAbierto(true)
  }

  const onGuardar = async (data) => {
    const payload = { ...data, orden: Number(data.orden) }
    try {
      if (editando) {
        await actualizarNivel(editando.id, payload)
        toast.success('Nivel actualizado')
      } else {
        await crearNivel(payload)
        toast.success('Nivel creado')
      }
      setModalAbierto(false)
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo guardar el nivel')
    }
  }

  const onEliminar = async (id) => {
    if (!confirm('¿Eliminar este nivel?')) return
    try {
      await eliminarNivel(id)
      toast.success('Nivel eliminado')
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo eliminar el nivel')
    }
  }

  if (loading) return <div className="loading-state">Cargando grados...</div>

  return (
    <div className="page-content admin-grados">
      <PageHeader
        title="Grados y niveles"
        subtitle="Administración de niveles educativos desde 1° Básico a 4° Medio"
        action={<button className="btn-primary" onClick={abrirNuevo}><RiAddLine /> Nuevo nivel</button>}
      />

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Nivel</th><th>Orden</th><th></th></tr>
          </thead>
          <tbody>
            {niveles.map((nivel) => (
              <tr key={nivel.id}>
                <td>{nivel.nombre}</td>
                <td>{nivel.orden}</td>
                <td className="admin-acciones">
                  <button onClick={() => abrirEditar(nivel)} aria-label="Editar"><RiPencilLine /></button>
                  <button className="danger" onClick={() => onEliminar(nivel.id)} aria-label="Eliminar"><RiDeleteBinLine /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal title={editando ? 'Editar nivel' : 'Nuevo nivel'} onClose={() => setModalAbierto(false)}>
          <form className="admin-form" onSubmit={handleSubmit(onGuardar)}>
            <div className="form-group">
              <label>Nombre del nivel</label>
              <input type="text" placeholder="1° Básico" {...register('nombre', { required: 'Campo obligatorio' })} />
              {errors.nombre && <span className="error-msg">{errors.nombre.message}</span>}
            </div>
            <div className="form-group">
              <label>Orden</label>
              <input type="number" min="1" {...register('orden', { required: 'Campo obligatorio', valueAsNumber: true })} />
              {errors.orden && <span className="error-msg">{errors.orden.message}</span>}
            </div>
            <button type="submit" className="btn-primary admin-form__submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
