// =============================================================
// APP - src/App.jsx
// =============================================================
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import PropTypes from 'prop-types'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute/PrivateRoute'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'

import Home from './pages/Home/Home'
import Nosotros from './pages/Nosotros/Nosotros'
import Login from './pages/Login/Login'
import Notas from './pages/Notas/Notas'
import Asistencia from './pages/Asistencia/Asistencia'
import HojaVida from './pages/HojaVida/HojaVida'
import Mensajeria from './pages/Mensajeria/Mensajeria'
import Admin from './pages/Admin/Admin'
import AdminConfiguracion from './pages/AdminConfiguracion/AdminConfiguracion'
import AdminGrados from './pages/AdminGrados/AdminGrados'
import AdminAsignacion from './pages/AdminAsignacion/AdminAsignacion'
import AdminMatriculas from './pages/AdminMatriculas/AdminMatriculas'
import Reuniones from './pages/Reuniones/Reuniones'
import Reportes from './pages/Reportes/Reportes'
import MiPerfil from './pages/MiPerfil/MiPerfil'

const ROLES_ACADEMICOS = ['ESTUDIANTE', 'APODERADO', 'DOCENTE']
const ROLES_TODOS = ['ESTUDIANTE', 'APODERADO', 'DOCENTE', 'ADMIN']

function Layout({ children, withFooter = true }) {
  return (
    <>
      <Navbar />
      {children}
      {withFooter && <Footer />}
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node,
  withFooter: PropTypes.bool,
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Publicas */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/nosotros" element={<Layout><Nosotros /></Layout>} />
          <Route path="/login" element={<Login />} />

          {/* Modulos academicos: Estudiante, Apoderado, Docente */}
          <Route path="/notas" element={
            <PrivateRoute roles={ROLES_ACADEMICOS}>
              <Layout withFooter={false}><div className="page-wrapper"><Notas /></div></Layout>
            </PrivateRoute>
          } />
          <Route path="/asistencia" element={
            <PrivateRoute roles={ROLES_ACADEMICOS}>
              <Layout withFooter={false}><div className="page-wrapper"><Asistencia /></div></Layout>
            </PrivateRoute>
          } />
          <Route path="/hoja-de-vida" element={
            <PrivateRoute roles={ROLES_ACADEMICOS}>
              <Layout withFooter={false}><div className="page-wrapper"><HojaVida /></div></Layout>
            </PrivateRoute>
          } />

          {/* Mensajeria: todos los roles autenticados */}
          <Route path="/mensajeria" element={
            <PrivateRoute roles={ROLES_TODOS}>
              <Layout withFooter={false}><div className="page-wrapper"><Mensajeria /></div></Layout>
            </PrivateRoute>
          } />

          {/* Mi perfil: todos los roles autenticados */}
          <Route path="/mi-perfil" element={
            <PrivateRoute roles={ROLES_TODOS}>
              <Layout withFooter={false}><div className="page-wrapper"><MiPerfil /></div></Layout>
            </PrivateRoute>
          } />

          {/* Panel de gestion: solo ADMIN/Directivo */}
          <Route path="/admin" element={
            <PrivateRoute roles={['ADMIN']}>
              <Layout withFooter={false}><div className="page-wrapper"><Admin /></div></Layout>
            </PrivateRoute>
          } />
          <Route path="/admin/configuracion" element={
            <PrivateRoute roles={['ADMIN']}>
              <Layout withFooter={false}><div className="page-wrapper"><AdminConfiguracion /></div></Layout>
            </PrivateRoute>
          } />
          <Route path="/admin/grados" element={
            <PrivateRoute roles={['ADMIN']}>
              <Layout withFooter={false}><div className="page-wrapper"><AdminGrados /></div></Layout>
            </PrivateRoute>
          } />
          <Route path="/admin/asignacion" element={
            <PrivateRoute roles={['ADMIN']}>
              <Layout withFooter={false}><div className="page-wrapper"><AdminAsignacion /></div></Layout>
            </PrivateRoute>
          } />
          <Route path="/admin/matriculas" element={
            <PrivateRoute roles={['ADMIN']}>
              <Layout withFooter={false}><div className="page-wrapper"><AdminMatriculas /></div></Layout>
            </PrivateRoute>
          } />
          <Route path="/admin/reuniones" element={
            <PrivateRoute roles={['ADMIN']}>
              <Layout withFooter={false}><div className="page-wrapper"><Reuniones /></div></Layout>
            </PrivateRoute>
          } />
          <Route path="/reportes" element={
            <PrivateRoute roles={['ADMIN']}>
              <Layout withFooter={false}><div className="page-wrapper"><Reportes /></div></Layout>
            </PrivateRoute>
          } />

          {/* 404 simple -> Home */}
          <Route path="*" element={<Layout><Home /></Layout>} />
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  )
}

