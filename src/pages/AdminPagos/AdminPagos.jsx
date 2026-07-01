import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { RiAddLine, RiDeleteBinLine, RiPencilLine } from 'react-icons/ri'
import { getAllUsuarios } from '../../services/usuarioService'
import { registrarPago, actualizarPago, eliminarPago, getPagos } from '../../services/pagoService'
import PageHeader from '../../components/UI/PageHeader'
import Modal from '../../components/Modal/Modal'
import './AdminPagos.scss'

const ESTADOS = ['pagado', 'pendiente', 'atrasado']
const TIPOS = ['matricula', 'mensualidad']

const formatoMoneda = (valor) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Number(valor || 0))

export default function AdminPagos() {
  const [pagos, setPagos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const { register, handleSubmit, reset, setValue, formState: { isSubmitting, errors } } = useForm()

  const cargar = () => {
    Promise.all([getPagos(), getAllUsuarios()])
      .then(([resPagos, resUsuarios]) => {
        setPagos(resPagos.data)
        setUsuarios(resUsuarios.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const estudiantes = useMemo(() => usuarios.filter((usuario) => usuario.rol === 'ESTUDIANTE'), [usuarios])
  const pagosFiltrados = filtroEstado === 'TODOS' ? pagos : pagos.filter((pago) => pago.estado === filtroEstado)

  const abrirNuevo = () => {
    setEditando(null)
    reset({ tipo: 'mensualidad', estado: 'pendiente', anoAcademico: 2026 })
    setModalAbierto(true)
  }

  const abrirEditar = (pago) => {
    setEditando(pago)
    Object.entries(pago).forEach(([key, value]) => setValue(key, value))
    setModalAbierto(true)
  }

  const onGuardar = async (data) => {
    const payload = {
      ...data,
      monto: Number(data.monto),
      anoAcademico: Number(data.anoAcademico),
    }
    try {
      if (editando) {
        await actualizarPago(editando.id, payload)
        toast.success('Pago actualizado')
      } else {
        await registrarPago(payload)
        toast.success('Pago registrado')
      }
      setModalAbierto(false)
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo guardar el pago')
    }
  }

  const onEliminar = async (id) => {
    if (!confirm('¿Eliminar este registro de pago?')) return
    try {
      await eliminarPago(id)
      toast.success('Pago eliminado')
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo eliminar el pago')
    }
  }

  const getNombreEstudiante = (run) => usuarios.find((usuario) => usuario.run === run)?.nombre || run

  if (loading) return <div className="loading-state">Cargando pagos...</div>

  return (
    <div className="page-content admin-pagos">
      <PageHeader
        title="Pagos"
        subtitle="Registro de matrícula y mensualidades por estudiante"
        action={<button className="btn-primary" onClick={abrirNuevo}><RiAddLine /> Nuevo pago</button>}
      />

      <div className="admin-filtros admin-pagos__filtros">
        {['TODOS', ...ESTADOS].map((estado) => (
          <button key={estado} className={filtroEstado === estado ? 'active' : ''} onClick={() => setFiltroEstado(estado)}>
            {estado === 'TODOS' ? 'Todos' : estado.charAt(0).toUpperCase() + estado.slice(1)}
          </button>
        ))}
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Estudiante</th><th>Tipo</th><th>Monto</th><th>Fecha</th><th>Estado</th><th>Año</th><th></th></tr>
          </thead>
          <tbody>
            {pagosFiltrados.map((pago) => (
              <tr key={pago.id}>
                <td>{getNombreEstudiante(pago.estudianteRun)}</td>
                <td>{pago.tipo}</td>
                <td>{formatoMoneda(pago.monto)}</td>
                <td>{pago.fecha}</td>
                <td><span className={`pago-pill pago-pill--${pago.estado}`}>{pago.estado}</span></td>
                <td>{pago.anoAcademico}</td>
                <td className="admin-acciones">
                  <button onClick={() => abrirEditar(pago)} aria-label="Editar"><RiPencilLine /></button>
                  <button className="danger" onClick={() => onEliminar(pago.id)} aria-label="Eliminar"><RiDeleteBinLine /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal title={editando ? 'Editar pago' : 'Nuevo pago'} onClose={() => setModalAbierto(false)}>
          <form className="admin-form admin-pagos__form" onSubmit={handleSubmit(onGuardar)}>
            <div className="form-group">
              <label>Estudiante</label>
              <select {...register('estudianteRun', { required: 'Campo obligatorio' })}>
                <option value="">Seleccione...</option>
                {estudiantes.map((estudiante) => <option key={estudiante.run} value={estudiante.run}>{estudiante.nombre}</option>)}
              </select>
              {errors.estudianteRun && <span className="error-msg">{errors.estudianteRun.message}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Tipo</label>
                <select {...register('tipo', { required: 'Campo obligatorio' })}>
                  {TIPOS.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select {...register('estado', { required: 'Campo obligatorio' })}>
                  {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Monto</label>
                <input type="number" min="0" step="100" {...register('monto', { required: 'Campo obligatorio', valueAsNumber: true })} />
                {errors.monto && <span className="error-msg">{errors.monto.message}</span>}
              </div>
              <div className="form-group">
                <label>Año académico</label>
                <input type="number" min="2000" {...register('anoAcademico', { required: 'Campo obligatorio', valueAsNumber: true })} />
                {errors.anoAcademico && <span className="error-msg">{errors.anoAcademico.message}</span>}
              </div>
            </div>
            <div className="form-group">
              <label>Fecha</label>
              <input type="date" {...register('fecha', { required: 'Campo obligatorio' })} />
              {errors.fecha && <span className="error-msg">{errors.fecha.message}</span>}
            </div>
            <button type="submit" className="btn-primary admin-form__submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar pago'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
