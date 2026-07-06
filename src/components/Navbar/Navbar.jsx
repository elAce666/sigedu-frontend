// =============================================================
// BARRA DE NAVEGACIÓN — components/Navbar/Navbar.jsx
// =============================================================
// Pública: Inicio | Nosotros (ancla informativa del colegio).
// Sin sesión: botón Ingresar.
// Con sesión, según rol (ESTUDIANTE/APODERADO/DOCENTE comparten
// los módulos académicos; ADMIN ve el Panel de Gestión):
//   Notas | Asistencia | Hoja de Vida | Mensajería | Mi perfil
//   ADMIN: Panel de Gestión
// =============================================================
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { RiMenuLine, RiCloseLine, RiBook2Line } from 'react-icons/ri'
import RoleBadge from '../RoleBadge/RoleBadge'
import Notificaciones from '../Notificaciones/Notificaciones'
import './Navbar.scss'

export default function Navbar() {
  const { isAuthenticated, usuario, logout, hasRole } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
          <RiBook2Line className="navbar__logo-icon" />
          <span>SIGEDU</span>
        </Link>

        <button className="navbar__burger" onClick={() => setMenuOpen((v) => !v)} aria-label="Menú">
          {menuOpen ? <RiCloseLine /> : <RiMenuLine />}
        </button>

        <div className={`navbar__menu ${menuOpen ? 'navbar__menu--open' : ''}`}>
          <ul className="navbar__links">
            <li><NavLink to="/" end onClick={closeMenu}>Inicio</NavLink></li>
            {!hasRole('ADMIN') && (
              <li><NavLink to="/nosotros" onClick={closeMenu}>El Colegio</NavLink></li>
            )}
          </ul>

          <div className="navbar__auth">
            {!isAuthenticated ? (
              <Link to="/login" className="navbar__btn navbar__btn--primary" onClick={closeMenu}>
                Ingresar
              </Link>
            ) : (
              <>
                {hasRole('APODERADO') && <Notificaciones />}
                {!hasRole('ADMIN') && (
                  <>
                    <NavLink to="/notas" className="navbar__user-link" onClick={closeMenu}>Notas</NavLink>
                    <NavLink to="/asistencia" className="navbar__user-link" onClick={closeMenu}>Asistencia</NavLink>
                    <NavLink to="/hoja-de-vida" className="navbar__user-link" onClick={closeMenu}>Hoja de Vida</NavLink>
                    <NavLink to="/mensajeria" className="navbar__user-link" onClick={closeMenu}>Mensajería</NavLink>
                  </>
                )}
                {hasRole('ADMIN') && (
                  <>
                    <NavLink to="/admin" className="navbar__user-link" onClick={closeMenu}>Panel de Gestión</NavLink>
                    <NavLink to="/admin/configuracion" className="navbar__user-link" onClick={closeMenu}>Configuración</NavLink>
                    <NavLink to="/admin/grados" className="navbar__user-link" onClick={closeMenu}>Grados</NavLink>
                    <NavLink to="/admin/asignacion" className="navbar__user-link" onClick={closeMenu}>Asignación</NavLink>
                    <NavLink to="/admin/matriculas" className="navbar__user-link" onClick={closeMenu}>Matrículas</NavLink>
                    <NavLink to="/admin/reuniones" className="navbar__user-link" onClick={closeMenu}>Reuniones</NavLink>
                    <NavLink to="/admin/pagos" className="navbar__user-link" onClick={closeMenu}>Pagos</NavLink>
                    <NavLink to="/reportes" className="navbar__user-link" onClick={closeMenu}>Reportes</NavLink>
                    <NavLink to="/mensajeria" className="navbar__user-link" onClick={closeMenu}>Mensajería</NavLink>
                  </>
                )}
                <NavLink to="/mi-perfil" className="navbar__user-link navbar__user-link--name" onClick={closeMenu}>
                  <span>{usuario?.nombre}</span>
                  <RoleBadge rol={usuario?.rol} />
                </NavLink>
                <button className="navbar__btn navbar__btn--outline navbar__btn--sm" onClick={handleLogout}>
                  Salir
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
