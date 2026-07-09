// =============================================================
// PAGINA DE ASISTENCIA - pages/Asistencia/Asistencia.jsx
// =============================================================
import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { RiAddLine, RiCheckLine, RiCloseLine, RiTimeLine } from 'react-icons/ri'
import { useAuth } from '../../hooks/useAuth'
import { getEstudiantesVinculados, getEstudiantesPorDocente } from '../../services/usuarioService'
import { getAsistenciaPorEstudiante, getResumenAsistencia, registrarAsistencia } from '../../services/asistenciaService'
import PageHeader from '../../components/UI/PageHeader'
import StatCard from '../../components/UI/StatCard'
import Modal from '../../components/Modal/Modal'
import '../../styles/asistencia.scss'

const ESTADO_LABEL = {
  presente: { texto: 'Presente', icon: <RiCheckLine />, clase: 'estado--presente' },
  ausente: { texto: 'Ausente', icon: <RiCloseLine />, clase: 'estado--ausente' },
  atrasado: { texto: 'Atrasado', icon: <RiTimeLine />, clase: 'estado--atrasado' },
}

export default function Asistencia() {
  const { usuario, hasRole } = useAuth()
  const esDocente = hasRole('DOCENTE')

  const [estudiantes, setEstudiantes] = useState([])
  const [seleccionado, setSeleccionado] = useState('')
  const [registros, setRegistros] = useState([])
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => {
    const cargarEstudiantes = esDocente ? getEstudiantesPorDocente(usuario.run) : getEstudiantesVinculados(usuario)
    cargarEstudiantes
      .then((res) => {
        const estudiantesData = res.data
        setEstudiantes(estudiantesData)
        setSeleccionado(estudiantesData[0]?.run || '')
      })
      .finally(() => setLoading(false))
  }, [usuario, esDocente])

  const cargar = useCallback(() => {
    if (!seleccionado) {
      setRegistros([])
      setResumen(null)
      return
    }
    Promise.all([getAsistenciaPorEstudiante(seleccionado), getResumenAsistencia(seleccionado)])
      .then(([resR, resS]) => { setRegistros(resR.data); setResumen(resS.data) })
  }, [seleccionado])

  useEffect(() => { cargar() }, [cargar])

  const onRegistrar = async (data) => {
    try {
      await registrarAsistencia({ estudianteRun: seleccionado, fecha: data.fecha, estado: data.estado, docenteRun: usuario.run })
      toast.success('Asistencia registrada')
      setModalAbierto(false)
      reset()
      cargar()
    } catch {
      toast.error('No se pudo registrar la asistencia')
    }
  }

  if (loading) return <div className="loading-state">Cargando asistencia...</div>

  return (
    <div className="page-content">
      <PageHeader
        title="Asistencia"
        subtitle={esDocente ? 'Registra la asistencia diaria del curso' : 'Seguimiento de asistencia escolar'}
        action={esDocente && seleccionado && <button className="btn-primary" onClick={() => setModalAbierto(true)}><RiAddLine /> Registrar asistencia</button>}
      />

      {estudiantes.length > 1 && (
        <div className="selector-pupilo">
          <label>{esDocente ? 'Estudiante:' : 'Pupilo/a:'}</label>
          <select value={seleccionado} onChange={(e) => setSeleccionado(e.target.value)}>
            {estudiantes.map((e) => <option key={e.run} value={e.run}>{e.nombre} - {e.curso}</option>)}
          </select>
        </div>
      )}

      {estudiantes.length === 0 && <p className="text-suave empty-state">No hay estudiantes disponibles para este usuario.</p>}

      {resumen && (
        <div className="stats-grid">
          <StatCard icon={<RiCheckLine />} label="% Asistencia" value={String(resumen.porcentaje) + '%'} tone="exito" />
          <StatCard icon={<RiCheckLine />} label="Dias presente" value={resumen.presentes} tone="primario" />
          <StatCard icon={<RiCloseLine />} label="Ausencias" value={resumen.ausentes} tone="error" />
          <StatCard icon={<RiTimeLine />} label="Atrasos" value={resumen.atrasos} tone="advertencia" />
        </div>
      )}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Fecha</th><th>Estado</th></tr></thead>
          <tbody>
            {registros.length === 0 ? (
              <tr><td colSpan={2} className="text-suave">Sin registros aun.</td></tr>
            ) : registros.map((r) => {
              const e = ESTADO_LABEL[r.estado] || ESTADO_LABEL.presente
              return <tr key={r.id}><td>{r.fecha}</td><td><span className={'estado-pill ' + e.clase}>{e.icon} {e.texto}</span></td></tr>
            })}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal title="Registrar asistencia" onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit(onRegistrar)}>
            <div className="form-group"><label>Fecha</label><input type="date" {...register('fecha', { required: true })} /></div>
            <div className="form-group"><label>Estado</label><select {...register('estado', { required: true })}><option value="presente">Presente</option><option value="atrasado">Atrasado</option><option value="ausente">Ausente</option></select></div>
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>{isSubmitting ? 'Guardando...' : 'Guardar registro'}</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
