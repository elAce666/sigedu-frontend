// =============================================================
// REUNIONES Y CALENDARIO (ADMIN/DIRECTIVO) - pages/Reuniones
// =============================================================
// Conectada a los microservicios reales de reuniones (8082) y
// calendario (8084): reuniones generales, citaciones a apoderados
// y eventos del calendario escolar.
// =============================================================
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import {
  RiAddLine, RiDeleteBinLine, RiTeamLine, RiParentLine, RiCalendarEventLine,
} from 'react-icons/ri'
import {
  getReunionesGenerales, crearReunionGeneral, eliminarReunionGeneral,
  getReunionesApoderados, crearReunionApoderado, eliminarReunionApoderado,
  getEventos, crearEvento, eliminarEvento,
} from '../../services/reunionService'
import { getAllUsuarios } from '../../services/usuarioService'
import PageHeader from '../../components/UI/PageHeader'
import Modal from '../../components/Modal/Modal'
import '../../styles/admin.scss'

const TABS = [
  { id: 'generales', label: 'Generales', icon: <RiTeamLine /> },
  { id: 'apoderados', label: 'Apoderados', icon: <RiParentLine /> },
  { id: 'eventos', label: 'Calendario', icon: <RiCalendarEventLine /> },
]

export default function Reuniones() {
  const [tab, setTab] = useState('generales')
  const [generales, setGenerales] = useState([])
  const [apoderadosReuniones, setApoderadosReuniones] = useState([])
  const [eventos, setEventos] = useState([])
  const [apoderados, setApoderados] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  const cargar = () => {
    Promise.all([getReunionesGenerales(), getReunionesApoderados(), getEventos(), getAllUsuarios()])
      .then(([resG, resA, resE, resU]) => {
        setGenerales(resG.data)
        setApoderadosReuniones(resA.data)
        setEventos(resE.data)
        setApoderados(resU.data.filter((u) => u.rol === 'APODERADO'))
      })
      .catch(() => toast.error('No se pudieron cargar las reuniones'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const abrirNuevo = () => {
    reset()
    setModalAbierto(true)
  }

  const onGuardar = async (data) => {
    try {
      if (tab === 'generales') await crearReunionGeneral(data)
      else if (tab === 'apoderados') await crearReunionApoderado(data)
      else await crearEvento(data)
      toast.success(tab === 'eventos' ? 'Evento creado' : 'Reunion agendada')
      setModalAbierto(false)
      reset()
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.error || 'No se pudo guardar')
    }
  }

  const onEliminar = async (id) => {
    if (!confirm('Eliminar este registro?')) return
    try {
      if (tab === 'generales') await eliminarReunionGeneral(id)
      else if (tab === 'apoderados') await eliminarReunionApoderado(id)
      else await eliminarEvento(id)
      toast.success('Registro eliminado')
      cargar()
    } catch {
      toast.error('No se pudo eliminar')
    }
  }

  if (loading) return <div className="loading-state">Cargando reuniones...</div>

  const nombreApoderado = (run) => apoderados.find((a) => a.run === run)?.nombre || run

  return (
    <div className="page-content">
      <PageHeader
        title="Reuniones y Calendario"
        subtitle="Agenda institucional: reuniones generales, citaciones a apoderados y eventos"
        action={
          <button className="btn-primary" onClick={abrirNuevo}>
            <RiAddLine /> {tab === 'eventos' ? 'Nuevo evento' : 'Nueva reunion'}
          </button>
        }
      />

      <div className="admin-filtros">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="data-table-wrap">
        {tab === 'generales' && (
          <table className="data-table">
            <thead><tr><th>Fecha</th><th>Hora</th><th>Tema</th><th>Lugar</th><th>Observaciones</th><th></th></tr></thead>
            <tbody>
              {generales.length === 0 ? (
                <tr><td colSpan={6} className="text-suave">Sin reuniones generales agendadas.</td></tr>
              ) : generales.map((r) => (
                <tr key={r.id}>
                  <td>{r.fecha}</td><td>{r.hora}</td><td>{r.tema}</td><td>{r.lugar}</td><td>{r.observaciones}</td>
                  <td className="admin-acciones">
                    <button className="danger" onClick={() => onEliminar(r.id)} aria-label="Eliminar"><RiDeleteBinLine /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'apoderados' && (
          <table className="data-table">
            <thead><tr><th>Fecha</th><th>Hora</th><th>Apoderado</th><th>Tema</th><th>Lugar</th><th></th></tr></thead>
            <tbody>
              {apoderadosReuniones.length === 0 ? (
                <tr><td colSpan={6} className="text-suave">Sin citaciones a apoderados.</td></tr>
              ) : apoderadosReuniones.map((r) => (
                <tr key={r.id}>
                  <td>{r.fecha}</td><td>{r.hora}</td><td>{nombreApoderado(r.apoderadoRun)}</td><td>{r.tema}</td><td>{r.lugar}</td>
                  <td className="admin-acciones">
                    <button className="danger" onClick={() => onEliminar(r.id)} aria-label="Eliminar"><RiDeleteBinLine /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'eventos' && (
          <table className="data-table">
            <thead><tr><th>Fecha</th><th>Horario</th><th>Evento</th><th>Tipo</th><th>Ubicacion</th><th></th></tr></thead>
            <tbody>
              {eventos.length === 0 ? (
                <tr><td colSpan={6} className="text-suave">Sin eventos en el calendario.</td></tr>
              ) : eventos.map((e) => (
                <tr key={e.id}>
                  <td>{e.fechaInicio}</td>
                  <td>{e.horaInicio} - {e.horaFin}</td>
                  <td>{e.nombre}</td>
                  <td><span className="nota-pill nota-pill--ok">{e.tipo}</span></td>
                  <td>{e.ubicacion}</td>
                  <td className="admin-acciones">
                    <button className="danger" onClick={() => onEliminar(e.id)} aria-label="Eliminar"><RiDeleteBinLine /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && (
        <Modal
          title={tab === 'generales' ? 'Nueva reunion general' : tab === 'apoderados' ? 'Nueva citacion a apoderado' : 'Nuevo evento'}
          onClose={() => setModalAbierto(false)}
        >
          <form onSubmit={handleSubmit(onGuardar)}>
            {tab !== 'eventos' ? (
              <>
                <div className="form-group">
                  <label>Fecha</label>
                  <input type="date" {...register('fecha', { required: 'Campo obligatorio' })} />
                  {errors.fecha && <span className="error-msg">{errors.fecha.message}</span>}
                </div>
                <div className="form-group">
                  <label>Hora</label>
                  <input type="time" {...register('hora', { required: 'Campo obligatorio' })} />
                </div>
                {tab === 'apoderados' && (
                  <div className="form-group">
                    <label>Apoderado</label>
                    <select {...register('apoderadoRun', { required: 'Selecciona un apoderado' })}>
                      {apoderados.map((a) => (
                        <option key={a.run} value={a.run}>{a.nombre} - {a.runCompleto || a.run}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Tema</label>
                  <input type="text" {...register('tema', { required: 'Campo obligatorio' })} />
                </div>
                <div className="form-group">
                  <label>Lugar</label>
                  <input type="text" {...register('lugar', { required: 'Campo obligatorio' })} />
                </div>
                <div className="form-group">
                  <label>Observaciones</label>
                  <input type="text" {...register('observaciones')} />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Nombre del evento</label>
                  <input type="text" {...register('nombre', { required: 'Campo obligatorio' })} />
                  {errors.nombre && <span className="error-msg">{errors.nombre.message}</span>}
                </div>
                <div className="form-group">
                  <label>Fecha</label>
                  <input type="date" {...register('fechaInicio', { required: 'Campo obligatorio' })} />
                </div>
                <div className="form-group">
                  <label>Hora inicio</label>
                  <input type="time" {...register('horaInicio', { required: 'Campo obligatorio' })} />
                </div>
                <div className="form-group">
                  <label>Hora termino</label>
                  <input type="time" {...register('horaFin', { required: 'Campo obligatorio' })} />
                </div>
                <div className="form-group">
                  <label>Tipo</label>
                  <select {...register('tipo', { required: true })}>
                    <option value="ACADEMICO">Academico</option>
                    <option value="ACTO">Acto</option>
                    <option value="REUNION">Reunion</option>
                    <option value="CELEBRACION">Celebracion</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ubicacion</label>
                  <input type="text" {...register('ubicacion')} />
                </div>
                <div className="form-group">
                  <label>Descripcion</label>
                  <input type="text" {...register('descripcion')} />
                </div>
              </>
            )}
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
