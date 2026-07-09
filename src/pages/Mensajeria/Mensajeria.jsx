// =============================================================
// PAGINA DE MENSAJERIA - pages/Mensajeria/Mensajeria.jsx
// =============================================================
// Usa el microservicio real de mensajeria para listar, enviar,
// responder, marcar como leido y eliminar mensajes.
// =============================================================
import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import {
  RiInboxLine, RiSendPlaneLine, RiMegaphoneLine, RiMailOpenLine, RiReplyLine, RiDeleteBinLine,
} from 'react-icons/ri'
import { useAuth } from '../../hooks/useAuth'
import { getAllUsuarios } from '../../services/usuarioService'
import {
  getBandejaEntrada,
  getBandejaEnviados,
  enviarMensaje,
  enviarMensajeMasivo,
  responderMensaje,
  marcarLeido,
  eliminarMensaje,
} from '../../services/mensajeriaService'
import PageHeader from '../../components/UI/PageHeader'
import Modal from '../../components/Modal/Modal'
import RoleBadge from '../../components/RoleBadge/RoleBadge'
import '../../styles/mensajeria.scss'

export default function Mensajeria() {
  const { usuario, hasRole } = useAuth()
  const [tab, setTab] = useState('recibidos')
  const [usuarios, setUsuarios] = useState([])
  const [recibidos, setRecibidos] = useState([])
  const [enviados, setEnviados] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalNuevo, setModalNuevo] = useState(false)
  const [modalMasivo, setModalMasivo] = useState(false)
  const [modalRespuesta, setModalRespuesta] = useState(null)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const { register: regM, handleSubmit: handleM, reset: resetM, formState: { isSubmitting: subM } } = useForm()
  const { register: regR, handleSubmit: handleR, reset: resetR, formState: { errors: errorsR, isSubmitting: subR } } = useForm()

  const cargar = useCallback(() => {
    setLoading(true)
    Promise.all([getBandejaEntrada(), getBandejaEnviados(), getAllUsuarios()])
      .then(([resR, resE, resU]) => {
        setRecibidos(resR.data)
        setEnviados(resE.data)
        setUsuarios(resU.data.filter((u) => u.run !== usuario.run))
      })
      .finally(() => setLoading(false))
  }, [usuario.run])

  useEffect(() => { cargar() }, [cargar])

  const abrirMensaje = async (m) => {
    if (!m.leido) {
      await marcarLeido(m.id)
      cargar()
    }
  }

  const abrirRespuesta = (mensaje, event) => {
    event.stopPropagation()
    setModalRespuesta(mensaje)
    resetR({
      asunto: mensaje.asunto?.toLowerCase().startsWith('re:') ? mensaje.asunto : 'RE: ' + mensaje.asunto,
      contenido: '',
    })
  }

  const onEnviar = async (data) => {
    try {
      await enviarMensaje({ emisorRun: usuario.run, receptorRun: data.receptorRun, asunto: data.asunto, contenido: data.contenido })
      toast.success('Mensaje enviado')
      setModalNuevo(false)
      reset()
      cargar()
    } catch {
      toast.error('No se pudo enviar el mensaje')
    }
  }

  const onEnviarMasivo = async (data) => {
    try {
      const receptoresRun = usuarios
        .filter((u) => data.destino === 'todos' || u.rol === data.destino)
        .map((u) => u.run)

      if (receptoresRun.length === 0) {
        toast.warning('No hay destinatarios para ese filtro')
        return
      }

      const res = await enviarMensajeMasivo({ emisorRun: usuario.run, receptoresRun, asunto: data.asunto, contenido: data.contenido })
      toast.success('Comunicado enviado a ' + res.data.enviados + ' destinatarios')
      setModalMasivo(false)
      resetM()
      cargar()
    } catch {
      toast.error('No se pudo enviar el comunicado')
    }
  }

  const onResponder = async (data) => {
    try {
      await responderMensaje({ id: modalRespuesta.id, emisorRun: usuario.run, asunto: data.asunto, contenido: data.contenido })
      toast.success('Respuesta enviada')
      setModalRespuesta(null)
      resetR()
      cargar()
    } catch {
      toast.error('No se pudo responder el mensaje')
    }
  }

  const onEliminar = async (mensaje, event) => {
    event.stopPropagation()
    if (!confirm('Confirma eliminar este mensaje')) return

    try {
      await eliminarMensaje(mensaje.id)
      toast.success('Mensaje eliminado')
      cargar()
    } catch {
      toast.error('No se pudo eliminar el mensaje')
    }
  }

  if (loading) return <div className="loading-state">Cargando mensajeria...</div>

  const lista = tab === 'recibidos' ? recibidos : enviados
  const noLeidos = recibidos.filter((m) => !m.leido).length

  return (
    <div className="page-content">
      <PageHeader
        title="Mensajeria"
        subtitle="Comunicacion directa entre la comunidad SIGEDU"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            {hasRole('ADMIN') && (
              <button className="btn-gold" onClick={() => setModalMasivo(true)}>
                <RiMegaphoneLine /> Comunicado masivo
              </button>
            )}
            <button className="btn-primary" onClick={() => setModalNuevo(true)}>
              <RiSendPlaneLine /> Nuevo mensaje
            </button>
          </div>
        }
      />

      <div className="msg-tabs">
        <button className={tab === 'recibidos' ? 'active' : ''} onClick={() => setTab('recibidos')}>
          <RiInboxLine /> Recibidos {noLeidos > 0 && <span className="msg-tabs__badge">{noLeidos}</span>}
        </button>
        <button className={tab === 'enviados' ? 'active' : ''} onClick={() => setTab('enviados')}>
          <RiSendPlaneLine /> Enviados
        </button>
      </div>

      <div className="msg-list">
        {lista.length === 0 ? (
          <p className="text-suave empty-state">No hay mensajes en esta bandeja.</p>
        ) : lista.map((m) => (
          <div
            key={m.id}
            className={
              'msg-item ' + (tab === 'recibidos' && !m.leido ? 'msg-item--no-leido' : '')
            }
            onClick={() => tab === 'recibidos' && abrirMensaje(m)}
          >
            <div className="msg-item__icon"><RiMailOpenLine /></div>
            <div className="msg-item__body">
              <div className="msg-item__top">
                <strong>{tab === 'recibidos' ? m.emisor?.nombre : m.receptor?.nombre}</strong>
                {(tab === 'recibidos' ? m.emisor?.rol : m.receptor?.rol) && (
                  <RoleBadge rol={tab === 'recibidos' ? m.emisor.rol : m.receptor.rol} />
                )}
                <span className="msg-item__fecha text-suave">{new Date(m.fecha).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
              <p className="msg-item__asunto">{m.asunto}</p>
              <p className="msg-item__contenido text-suave">{m.contenido}</p>
            </div>
            <div className="msg-item__actions">
              {tab === 'recibidos' && m.receptorRun && m.emisorRun && (
                <button type="button" title="Responder" aria-label="Responder" onClick={(event) => abrirRespuesta(m, event)}>
                  <RiReplyLine />
                </button>
              )}
              {(tab === 'enviados' || m.receptorRun) && (
                <button type="button" title="Eliminar" aria-label="Eliminar" className="danger" onClick={(event) => onEliminar(m, event)}>
                  <RiDeleteBinLine />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalNuevo && (
        <Modal title="Nuevo mensaje" onClose={() => setModalNuevo(false)}>
          <form onSubmit={handleSubmit(onEnviar)}>
            <div className="form-group">
              <label>Para</label>
              <select {...register('receptorRun', { required: true })}>
                {usuarios.map((u) => (
                  <option key={u.run} value={u.run}>{u.nombre} ({u.rol.toLowerCase()})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Asunto</label>
              <input type="text" {...register('asunto', { required: 'El asunto es obligatorio' })} />
              {errors.asunto && <span className="error-msg">{errors.asunto.message}</span>}
            </div>
            <div className="form-group">
              <label>Mensaje</label>
              <textarea rows={4} {...register('contenido', { required: 'Escribe un mensaje' })} />
              {errors.contenido && <span className="error-msg">{errors.contenido.message}</span>}
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>
              {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        </Modal>
      )}

      {modalMasivo && (
        <Modal title="Comunicado masivo" onClose={() => setModalMasivo(false)}>
          <form onSubmit={handleM(onEnviarMasivo)}>
            <div className="form-group">
              <label>Destinatarios</label>
              <select {...regM('destino', { required: true })}>
                <option value="todos">Toda la comunidad</option>
                <option value="APODERADO">Apoderados</option>
                <option value="DOCENTE">Docentes</option>
                <option value="ESTUDIANTE">Estudiantes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Asunto</label>
              <input type="text" {...regM('asunto', { required: true })} />
            </div>
            <div className="form-group">
              <label>Mensaje</label>
              <textarea rows={4} {...regM('contenido', { required: true })} />
            </div>
            <button type="submit" className="btn-gold" disabled={subM} style={{ width: '100%', justifyContent: 'center' }}>
              {subM ? 'Enviando...' : 'Enviar comunicado'}
            </button>
          </form>
        </Modal>
      )}

      {modalRespuesta && (
        <Modal title="Responder mensaje" onClose={() => setModalRespuesta(null)}>
          <form onSubmit={handleR(onResponder)}>
            <div className="form-group">
              <label>Para</label>
              <input type="text" value={modalRespuesta.emisor?.nombre || modalRespuesta.emisorRun} disabled />
            </div>
            <div className="form-group">
              <label>Asunto</label>
              <input type="text" {...regR('asunto', { required: 'El asunto es obligatorio' })} />
              {errorsR.asunto && <span className="error-msg">{errorsR.asunto.message}</span>}
            </div>
            <div className="form-group">
              <label>Mensaje</label>
              <textarea rows={4} {...regR('contenido', { required: 'Escribe una respuesta' })} />
              {errorsR.contenido && <span className="error-msg">{errorsR.contenido.message}</span>}
            </div>
            <button type="submit" className="btn-primary" disabled={subR} style={{ width: '100%', justifyContent: 'center' }}>
              {subR ? 'Enviando...' : 'Enviar respuesta'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
