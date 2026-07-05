// =============================================================
// PÁGINA DE LOGIN — pages/Login/Login.jsx
// =============================================================
// Tras login exitoso, redirige según el rol:
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

// Cuentas reales del backend (RUN sin dígito verificador). El correo
// solo funciona contra el mock local si el backend está caído.
const CUENTAS_DEMO = [
  { rol: 'Admin', usuario: '12345678', password: 'admin123' },
  { rol: 'Docente', usuario: '11111111', password: 'docente123' },
  { rol: 'Apoderado', usuario: '33333333', password: 'apoderado123' },
  { rol: 'Estudiante', usuario: '22222222', password: 'estudiante123' },
]

export default function Login() {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname

  const onSubmit = async (data) => {
    try {
      const res = await loginService(data)
      const { token, run, nombre, email, rol } = res.data
      login(token, { run, nombre, email, rol })
      toast.success(`Bienvenido/a, ${nombre}`)
      navigate(from || ROL_REDIRECT[rol] || '/', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || 'Credenciales incorrectas'
      toast.error(msg)
    }
  }

  const rellenarDemo = (cuenta) => {
    setValue('usuario', cuenta.usuario)
    setValue('password', cuenta.password)
  }

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <div className="auth-page__logo">
          <RiBook2Line />
          <h1>SIGEDU</h1>
          <p>Colegio Bernardo O'Higgins — Coquimbo</p>
        </div>

        <h2 className="auth-page__title">Iniciar sesión</h2>
        <p className="auth-page__subtitle">Accede a tu portal académico</p>

        <form className="auth-page__form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>RUN o correo electrónico</label>
            <input
              type="text"
              placeholder="12345678 (sin DV) o nombre@sigedu.cl"
              {...register('usuario', { required: 'El RUN o correo es obligatorio' })}
            />
            {errors.usuario && <span className="error-msg">{errors.usuario.message}</span>}
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'La contraseña es obligatoria' })}
            />
            {errors.password && <span className="error-msg">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn-primary submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="auth-page__demo">
          <p>Cuentas de demostración (clic para autocompletar):</p>
          <div className="auth-page__demo-grid">
            {CUENTAS_DEMO.map((c) => (
              <button key={c.usuario} type="button" onClick={() => rellenarDemo(c)}>
                {c.rol}
              </button>
            ))}
          </div>
        </div>

        <p className="auth-page__footer">
          <Link to="/">← Volver al sitio del colegio</Link>
        </p>
      </div>
    </div>
  )
}
