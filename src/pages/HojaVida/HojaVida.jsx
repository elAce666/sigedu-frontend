// =============================================================
// PAGINA HOJA DE VIDA - pages/HojaVida/HojaVida.jsx
// =============================================================
// DOCENTE -> registra anotaciones positivas/negativas.
// APODERADO/ESTUDIANTE -> consultan el historial.
// (Refleja "Microservicios: Hoja de Vida" del diagrama de casos
// de uso: Registrar Anotacion -> Anexar a Historial).
// =============================================================
import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { RiAddLine, RiThumbUpLine, RiThumbDownLine } from 'react-icons/ri'
import { useAuth } from '../../hooks/useAuth'
import { getEstudiantesVinculados, getEstudiantesPorDocente } from '../../services/usuarioService'
import { getHojaVida, registrarAnotacion } from '../../services/hojaVidaService'
import PageHeader from '../../components/UI/PageHeader'
import Modal from '../../components/Modal/Modal'
import '../../styles/hoja-vida.scss'

export default function HojaVida() {
  const { usuario, hasRole } = useAuth()
  const esDocente = hasRole('DOCENTE')

  const [estudiantes, setEstudiantes] = useState([])
  const [seleccionado, setSeleccionado] = useState('')
  const [anotaciones, setAnotaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    setLoading(true)
    const cargarEstudiantes = esDocente ? getEstudiantesPorDocente(usuario.run) : getEstudiantesVinculados(usuario)
    cargarEstudiantes
      .then((res) => {
        setEstudiantes(res.data)
        setSeleccionado(res.data.length ? res.data[0].run : '')
      })
      .catch(() => {
        setEstudiantes([])
        setSeleccionado('')
        toast.error('No se pudieron cargar los estudiantes')
      })
      .finally(() => setLoading(false))
  }, [usuario, esDocente])

  const cargar = useCallback(() => {
    if (!seleccionado) {
      setAnotaciones([])
      return
    }
    getHojaVida(seleccionado)
      .then((res) => setAnotaciones(res.data))
      .catch(() => {
        setAnotaciones([])
        toast.error('No se pudo cargar la hoja de vida')
      })
  }, [seleccionado])

  useEffect(() => { cargar() }, [cargar])

  const onRegistrar = async (data) => {
    try {
      await registrarAnotacion({
        estudianteRun: seleccionado,
        tipo: data.tipo,
        detalle: data.detalle,
        autorRun: usuario.run,
      })
      toast.success('Anotacion registrada en la hoja de vida')
      setModalAbierto(false)
      reset()
      cargar()
    } catch {
      toast.error('No se pudo registrar la anotacion')
    }
  }

  if (loading) return <div className="loading-state">Cargando hoja de vida...</div>

  const positivas = anotaciones.filter((a) => a.tipo === 'positiva').length
  const negativas = anotaciones.filter((a) => a.tipo === 'negativa').length

  return (
    <div className="page-content">
      <PageHeader
        title="Hoja de Vida"
        subtitle={esDocente ? 'Registra anotaciones de comportamiento' : 'Historial de comportamiento escolar'}
        action={esDocente && (
          <button className="btn-primary" onClick={() => setModalAbierto(true)}>
            <RiAddLine /> Registrar anotacion
          </button>
        )}
      />

      {estudiantes.length > 1 && (
        <div className="selector-pupilo">
          <label>{esDocente ? 'Estudiante:' : 'Pupilo/a:'}</label>
          <select value={seleccionado} onChange={(e) => setSeleccionado(e.target.value)}>
            {estudiantes.map((e) => (
              <option key={e.run} value={e.run}>{e.nombre} - {e.curso}</option>
            ))}
          </select>
        </div>
      )}

      <div className="hv-resumen">
        <span className="hv-resumen__item hv-resumen__item--pos"><RiThumbUpLine /> {positivas} positivas</span>
        <span className="hv-resumen__item hv-resumen__item--neg"><RiThumbDownLine /> {negativas} negativas</span>
      </div>

      <div className="hv-timeline">
        {anotaciones.length === 0 ? (
          <p className="text-suave empty-state">Sin anotaciones registradas aun.</p>
        ) : anotaciones.map((a) => (
          <div key={a.id} className={`hv-item hv-item--${a.tipo}`}>
            <div className="hv-item__icon">
              {a.tipo === 'positiva' ? <RiThumbUpLine /> : <RiThumbDownLine />}
            </div>
            <div className="hv-item__body">
              <p className="hv-item__detalle">{a.detalle}</p>
              <p className="hv-item__meta text-suave">
                {a.fecha} - Registrado por {a.autor?.nombre || 'Docente'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <Modal title="Registrar anotacion" onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit(onRegistrar)}>
            <div className="form-group">
              <label>Tipo de anotacion</label>
              <select {...register('tipo', { required: true })}>
                <option value="positiva">Positiva</option>
                <option value="negativa">Negativa</option>
              </select>
            </div>
            <div className="form-group">
              <label>Detalle</label>
              <textarea rows={4} placeholder="Describe la situacion observada..."
                {...register('detalle', { required: 'Este campo es obligatorio' })} />
              {errors.detalle && <span className="error-msg">{errors.detalle.message}</span>}
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>
              {isSubmitting ? 'Guardando...' : 'Guardar anotacion'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
