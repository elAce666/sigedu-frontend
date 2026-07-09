import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { RiAddLine, RiDeleteBinLine, RiPencilLine } from 'react-icons/ri'
import {
  crearConfiguracion,
  actualizarConfiguracion,
  eliminarConfiguracion,
  getConfiguraciones,
} from '../../services/configuracionService'
import PageHeader from '../../components/UI/PageHeader'
import Modal from '../../components/Modal/Modal'
import './AdminConfiguracion.scss'

const LABELS = {
  nombreColegio: 'Nombre colegio',
  anoAcademicoActivo: 'Anio academico activo',
  periodoEscolar: 'Periodo escolar',
}

export default function AdminConfiguracion() {
  const [configuraciones, setConfiguraciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting, errors } } = useForm()

  const cargar = () => {
    getConfiguraciones()
      .then(({ data }) => setConfiguraciones(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const abrirNuevo = () => {
    setEditando(null)
    reset({ clave: '', valor: '', descripcion: '' })
    setModalAbierto(true)
  }

  const abrirEditar = (item) => {
    setEditando(item)
    Object.entries(item).forEach(([key, value]) => setValue(key, value))
    setModalAbierto(true)
  }

  const onGuardar = async (data) => {
    try {
      if (editando) {
        await actualizarConfiguracion(editando.id, data)
        toast.success('Configuracion actualizada')
      } else {
        await crearConfiguracion(data)
        toast.success('Configuracion creada')
      }
      setModalAbierto(false)
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo guardar la configuracion')
    }
  }

  const onEliminar = async (id) => {
    if (!confirm('Eliminar esta configuracion?')) return
    try {
      await eliminarConfiguracion(id)
      toast.success('Configuracion eliminada')
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo eliminar la configuracion')
    }
  }

  if (loading) return <div className="loading-state">Cargando configuracion...</div>

  return (
    <div className="page-content admin-configuracion">
      <PageHeader
        title="Configuracion general"
        subtitle="Parametros institucionales basicos del sistema"
        action={<button className="btn-primary" onClick={abrirNuevo}><RiAddLine /> Nueva configuracion</button>}
      />

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Clave</th><th>Valor</th><th>Descripcion</th><th></th></tr>
          </thead>
          <tbody>
            {configuraciones.map((item) => (
              <tr key={item.id}>
                <td>{LABELS[item.clave] || item.clave}</td>
                <td>{item.valor}</td>
                <td>{item.descripcion}</td>
                <td className="admin-acciones">
                  <button onClick={() => abrirEditar(item)} aria-label="Editar"><RiPencilLine /></button>
                  <button className="danger" onClick={() => onEliminar(item.id)} aria-label="Eliminar"><RiDeleteBinLine /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal title={editando ? 'Editar configuracion' : 'Nueva configuracion'} onClose={() => setModalAbierto(false)}>
          <form className="admin-form" onSubmit={handleSubmit(onGuardar)}>
            <div className="form-group">
              <label>Clave</label>
              <input type="text" placeholder="nombreColegio" {...register('clave', { required: 'Campo obligatorio' })} />
              {errors.clave && <span className="error-msg">{errors.clave.message}</span>}
            </div>
            <div className="form-group">
              <label>Valor</label>
              <input type="text" {...register('valor', { required: 'Campo obligatorio' })} />
              {errors.valor && <span className="error-msg">{errors.valor.message}</span>}
            </div>
            <div className="form-group">
              <label>Descripcion</label>
              <textarea rows="3" {...register('descripcion', { required: 'Campo obligatorio' })} />
              {errors.descripcion && <span className="error-msg">{errors.descripcion.message}</span>}
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
