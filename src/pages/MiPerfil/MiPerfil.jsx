// =============================================================
// MI PERFIL - pages/MiPerfil/MiPerfil.jsx
// =============================================================
import { RiUserLine, RiMailLine, RiIdCardLine, RiShieldUserLine } from 'react-icons/ri'
import { useAuth } from '../../hooks/useAuth'
import PageHeader from '../../components/UI/PageHeader'
import RoleBadge from '../../components/RoleBadge/RoleBadge'
import '../../styles/perfil.scss'

export default function MiPerfil() {
  const { usuario } = useAuth()

  return (
    <div className="page-content">
      <PageHeader title="Mi perfil" subtitle="Informacion de tu cuenta en SIGEDU" />

      <div className="perfil-card card">
        <div className="perfil-card__avatar">
          <RiUserLine />
        </div>
        <div className="perfil-card__info">
          <h2>{usuario.nombre}</h2>
          <RoleBadge rol={usuario.rol} />

          <ul className="perfil-card__detalles">
            <li><RiMailLine /> {usuario.email}</li>
            <li><RiIdCardLine /> RUN: {usuario.run}</li>
            <li><RiShieldUserLine /> Acceso autenticado via SIGEDU (JWT)</li>
          </ul>
        </div>
      </div>

      <div className="card perfil-nota">
        <p className="text-suave">
          Para actualizar tus datos personales, contrasena o informacion de contacto, comunicate
          con el area administrativa del Colegio Bernardo O'Higgins a traves de Mensajeria.
        </p>
      </div>
    </div>
  )
}
