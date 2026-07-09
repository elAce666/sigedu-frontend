// =============================================================
// PANEL DE GESTION (ADMIN/DIRECTIVO) - pages/Admin/Admin.jsx
// =============================================================
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import {
  RiUserLine, RiTeamLine, RiBookOpenLine, RiAddLine, RiDeleteBinLine, RiPencilLine,
} from 'react-icons/ri'
import {
  getAllUsuarios, getCursos, createUsuario, updateUsuario, deleteUsuario,
} from '../../services/usuarioService'
import PageHeader from '../../components/UI/PageHeader'
import StatCard from '../../components/UI/StatCard'
import Modal from '../../components/Modal/Modal'
import RoleBadge from '../../components/RoleBadge/RoleBadge'
import '../../styles/admin.scss'

export default function Admin() {
  const [usuarios, setUsuarios] = useState([])
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [filtroRol, setFiltroRol] = useState('TODOS')
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm()

  const cargar = () => {
    Promise.all([getAllUsuarios(), getCursos()])
      .then(([resU, resC]) => { setUsuarios(resU.data); setCursos(resC.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const abrirNuevo = () => {
    setEditando(null)
    reset({ rol: 'ESTUDIANTE', genero: 'F', password: '' })
    setModalAbierto(true)
  }

  const abrirEditar = (u) => {
    setEditando(u)
    Object.entries(u).forEach(([k, v]) => setValue(k, v))
    setValue('password', '')
    setModalAbierto(true)
  }

  const onGuardar = async (data) => {
    try {
      const payload = {
        ...data,
        password: data.password?.trim() || '',
      }

      if (editando) {
        if (!payload.password) delete payload.password
        await updateUsuario(editando.runCompleto || editando.run, payload)
        toast.success('Usuario actualizado')
      } else {
        await createUsuario(payload)
        toast.success('Usuario creado')
      }
      setModalAbierto(false)
      cargar()
    } catch (err) {
      toast.error(err.response?.data?.error || 'No se pudo guardar el usuario')
    }
  }

  const onEliminar = async (run) => {
    if (!confirm('Confirma eliminar este usuario del sistema')) return
    await deleteUsuario(run)
    toast.success('Usuario eliminado')
    cargar()
  }

  if (loading) return <div className="loading-state">Cargando panel de gestion...</div>

  const totalEstudiantes = usuarios.filter((u) => u.rol === 'ESTUDIANTE').length
  const totalDocentes = usuarios.filter((u) => u.rol === 'DOCENTE').length
  const totalApoderados = usuarios.filter((u) => u.rol === 'APODERADO').length

  const listaFiltrada = filtroRol === 'TODOS' ? usuarios : usuarios.filter((u) => u.rol === filtroRol)

  return (
    <div className="page-content">
      <PageHeader
        title="Panel de Gestion"
        subtitle="Administracion de usuarios, cursos y matriculas - SIGEDU"
        action={<button className="btn-primary" onClick={abrirNuevo}><RiAddLine /> Nuevo usuario</button>}
      />

      <div className="stats-grid">
        <StatCard icon={<RiUserLine />} label="Estudiantes" value={totalEstudiantes} tone="primario" />
        <StatCard icon={<RiTeamLine />} label="Apoderados" value={totalApoderados} tone="exito" />
        <StatCard icon={<RiBookOpenLine />} label="Docentes" value={totalDocentes} tone="dorado" />
        <StatCard icon={<RiTeamLine />} label="Cursos activos" value={cursos.length} tone="advertencia" />
      </div>

      <div className="admin-filtros">
        {['TODOS', 'ESTUDIANTE', 'APODERADO', 'DOCENTE', 'ADMIN'].map((r) => (
          <button key={r} className={filtroRol === r ? 'active' : ''} onClick={() => setFiltroRol(r)}>
            {r === 'TODOS' ? 'Todos' : r.charAt(0) + r.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Nombre</th><th>RUN</th><th>Rol</th><th>Correo</th><th>Curso</th><th></th></tr>
          </thead>
          <tbody>
            {listaFiltrada.map((u) => (
              <tr key={u.run}>
                <td>{u.nombre}</td>
                <td>{u.runCompleto || u.run}</td>
                <td><RoleBadge rol={u.rol} /></td>
                <td>{u.email}</td>
                <td>{u.curso || u.cursoJefatura || '-'}</td>
                <td className="admin-acciones">
                  <button onClick={() => abrirEditar(u)} aria-label="Editar"><RiPencilLine /></button>
                  <button onClick={() => onEliminar(u.runCompleto || u.run)} className="danger" aria-label="Eliminar"><RiDeleteBinLine /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal title={editando ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit(onGuardar)}>
            <div className="form-group">
              <label>Nombre completo</label>
              <input type="text" {...register('nombre', { required: 'Campo obligatorio' })} />
              {errors.nombre && <span className="error-msg">{errors.nombre.message}</span>}
            </div>
            <div className="form-group">
              <label>RUN</label>
              <input type="text" placeholder="11111111-1" disabled={!!editando} {...register('run', { required: 'Campo obligatorio' })} />
            </div>
            <div className="form-group">
              <label>Correo electronico</label>
              <input type="email" {...register('email', { required: 'Campo obligatorio' })} />
              {errors.email && <span className="error-msg">{errors.email.message}</span>}
            </div>
            <div className="form-group">
              <label>{editando ? 'Nueva contrasena (opcional)' : 'Contrasena inicial'}</label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder={editando ? 'Dejar en blanco para mantenerla' : 'Minimo 8 caracteres'}
                {...register('password', {
                  required: editando ? false : 'Campo obligatorio',
                  minLength: { value: 8, message: 'Minimo 8 caracteres' },
                })}
              />
              {errors.password && <span className="error-msg">{errors.password.message}</span>}
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select {...register('rol', { required: true })}>
                <option value="ESTUDIANTE">Estudiante</option>
                <option value="APODERADO">Apoderado</option>
                <option value="DOCENTE">Docente</option>
                <option value="ADMIN">Directivo / Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Genero</label>
              <select {...register('genero', { required: true })}>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
              </select>
            </div>
            <div className="form-group">
              <label>RUN del apoderado (solo estudiantes)</label>
              <input type="text" placeholder="33333333-3" {...register('runApoderado')} />
            </div>
            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>
              {isSubmitting ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
