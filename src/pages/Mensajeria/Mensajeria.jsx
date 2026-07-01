// =============================================================
// PÁGINA DE MENSAJERÍA — pages/Mensajeria/Mensajeria.jsx
// =============================================================
// Refleja el "MICROSERVICIO Mensajería Integrada": cualquier
// usuario envía mensajes individuales y lee los recibidos;
// ADMIN/Directivo además puede enviar mensajes masivos.
// =============================================================
import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { RiInboxLine, RiSendPlaneLine, RiMegaphoneLine, RiMailOpenLine } from 'react-icons/ri'
import { useAuth } from '../../hooks/useAuth'
import { getAllUsuarios } from '../../services/usuarioService'
import {
  getBandejaEntrada, getBandejaEnviados, enviarMensaje, enviarMensajeMasivo, marcarLeido,
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
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const { register: regM, handleSubmit: handleM, reset: resetM, formState: { isSubmitting: subM } } = useForm()

  const cargar = useCallback(() => {
    Promise.all([getBandejaEntrada(usuario.run), getBandejaEnviados(usuario.run), getAllUsuarios()])
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
      const receptoresRun = usuarios.filter((u) => data.destino === 'todos' || u.rol === data.destino).map((u) => u.run)
      const res = await enviarMensajeMasivo({ emisorRun: usuario.run, receptoresRun, asunto: data.asunto, contenido: data.contenido })
      toast.success(`Comunicado enviado a ${res.data.enviados} destinatarios`)
      setModalMasivo(false)
      resetM()
      cargar()
    } catch {
      toast.error('No se pudo enviar el comunicado')
    }
  }

  if (loading) return <div className="loading-state">Cargando mensajería...</div>

  const lista = tab === 'recibidos' ? recibidos : enviados
  const noLeidos = recibidos.filter((m) => !m.leido).length

  return (
    <div className="page-content">
      <PageHeader
        title="Mensajería"
        subtitle="Comunicación directa entre la comunidad SIGEDU"
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
            className={`msg-item ${tab === 'recibidos' && !m.leido ? 'msg-item--no-leido' : ''}`}
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
    </div>
  )
}
