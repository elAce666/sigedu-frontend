import { useEffect, useState } from 'react'
import { RiNotification3Line } from 'react-icons/ri'
import { useAuth } from '../../hooks/useAuth'
import { getAlertasPorApoderado, marcarAlertaLeida } from '../../services/alertaService'
import './Notificaciones.scss'

export default function Notificaciones() {
  const { usuario, hasRole } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const [alertas, setAlertas] = useState([])
  const [cargando, setCargando] = useState(false)

  const cargarAlertas = async () => {
    if (!usuario?.run || !hasRole('APODERADO')) return
    setCargando(true)
    try {
      const { data } = await getAlertasPorApoderado(usuario.run)
      setAlertas(data)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarAlertas()
  }, [usuario?.run])

  useEffect(() => {
    const refrescar = () => cargarAlertas()
    window.addEventListener('sigedu:alertas-changed', refrescar)
    return () => window.removeEventListener('sigedu:alertas-changed', refrescar)
  }, [usuario?.run])

  useEffect(() => {
    if (abierto) cargarAlertas()
  }, [abierto])

  const alertasNoLeidas = alertas.filter((alerta) => !alerta.leida)

  const toggle = () => {
    if (!hasRole('APODERADO')) return
    setAbierto((value) => !value)
  }

  const leerAlerta = async (alertaId) => {
    await marcarAlertaLeida(alertaId)
    setAlertas((actuales) => actuales.map((alerta) => (
      alerta.id === alertaId ? { ...alerta, leida: true } : alerta
    )))
  }

  if (!hasRole('APODERADO')) return null

  return (
    <div className="notificaciones">
      <button type="button" className="notificaciones__boton" onClick={toggle} aria-label="Notificaciones">
        <RiNotification3Line />
        {alertasNoLeidas.length > 0 && <span className="notificaciones__badge">{alertasNoLeidas.length}</span>}
      </button>

      {abierto && (
        <div className="notificaciones__dropdown">
          <div className="notificaciones__header">
            <strong>Alertas</strong>
            <span>{alertasNoLeidas.length} sin leer</span>
          </div>

          <div className="notificaciones__lista">
            {cargando && <p className="notificaciones__estado">Cargando alertas...</p>}
            {!cargando && alertasNoLeidas.length === 0 && <p className="notificaciones__estado">No hay alertas sin leer.</p>}
            {!cargando && alertasNoLeidas.map((alerta) => (
              <button
                key={alerta.id}
                type="button"
                className="notificaciones__item"
                onClick={() => leerAlerta(alerta.id)}
              >
                <span className="notificaciones__item-titulo">{alerta.titulo}</span>
                <span className="notificaciones__item-mensaje">{alerta.mensaje}</span>
                <span className="notificaciones__item-fecha">{new Date(alerta.fecha).toLocaleString('es-CL')}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
