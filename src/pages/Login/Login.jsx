// =============================================================
// PAGINA DE LOGIN - pages/Login/Login.jsx
// =============================================================
// Tras login exitoso, redirige segun el rol:
//   ESTUDIANTE / APODERADO / DOCENTE -> /notas
//   ADMIN                            -> /admin
// =============================================================
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login as loginService } from '../../services/authService'
import { useAuth } from '../../hooks/useAuth'
import { toast } from 'react-toastify'
import { RiBook2Line } from 'react-icons/ri'
import '../../styles/auth.scss'

const ROL_REDIRECT = {
  ESTUDIANTE: '/notas',
  APODERADO: '/notas',
  DOCENTE: '/notas',
  ADMIN: '/admin',
}

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname

  const onSubmit = async (data) => {
    try {
      const res = await loginService({ ...data, usuario: String(data.usuario || '').trim() })
      const { token, run, nombre, email, rol } = res.data
      login(token, { run, nombre, email, rol })
      toast.success('Bienvenido/a, ' + nombre)
      navigate(from || ROL_REDIRECT[rol] || '/', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || 'Credenciales incorrectas'
      toast.error(msg)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <div className="auth-page__logo">
          <RiBook2Line />
          <h1>SIGEDU</h1>
          <p>Colegio Bernardo O'Higgins - Coquimbo</p>
        </div>

        <h2 className="auth-page__title">Iniciar sesion</h2>
        <p className="auth-page__subtitle">Accede a tu portal academico</p>

        <form className="auth-page__form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>RUN</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="username"
              placeholder="12345678 (sin DV)"
              {...register('usuario', {
                required: 'El RUN es obligatorio',
                pattern: { value: /^\d+$/, message: 'Ingresa solo numeros, sin puntos ni DV' },
              })}
            />
            {errors.usuario && <span className="error-msg">{errors.usuario.message}</span>}
          </div>

          <div className="form-group">
            <label>Contrasena</label>
            <input
              type="password"
              placeholder="********"
              autoComplete="current-password"
              {...register('password', { required: 'La contrasena es obligatoria' })}
            />
            {errors.password && <span className="error-msg">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn-primary submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Iniciando sesion...' : 'Iniciar sesion'}
          </button>
        </form>

        <p className="auth-page__footer">
          <Link to="/">Volver al sitio del colegio</Link>
        </p>
      </div>
    </div>
  )
}
