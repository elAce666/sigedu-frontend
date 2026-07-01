import { Link } from 'react-router-dom'
import { RiBuilding2Line, RiGroupLine, RiAwardLine } from 'react-icons/ri'
import './Nosotros.scss'

export default function Nosotros() {
  return (
    <div className="nosotros">
      <div className="nosotros__container">
        <h1>Colegio Bernardo O'Higgins</h1>
        <p className="text-suave nosotros__intro">
          Establecimiento educacional de Coquimbo, comprometido con fortalecer la vida escolar,
          la comunicación con las familias y la gestión diaria de su comunidad educativa.
        </p>

        <div className="nosotros__grid">
          <div className="nosotros__card">
            <RiBuilding2Line />
            <h3>Contexto institucional</h3>
            <p>
              El colegio avanza hacia una gestión más ordenada y accesible, manteniendo siempre el
              foco en la formación integral de sus estudiantes.
            </p>
          </div>
          <div className="nosotros__card">
            <RiGroupLine />
            <h3>Comunidad educativa</h3>
            <p>
              Estudiantes, apoderados, docentes y equipo directivo conectados en un mismo espacio
              escolar, con acceso oportuno a la información relevante.
            </p>
          </div>
          <div className="nosotros__card">
            <RiAwardLine />
            <h3>Nuestro propósito</h3>
            <p>
              Acompañar el trabajo cotidiano del colegio con herramientas claras, confiables y
              pensadas para la comunidad escolar.
            </p>
          </div>
        </div>

        <div className="nosotros__cta">
          <h2>¿Ya eres parte de la comunidad escolar?</h2>
          <p>Ingresa con tu cuenta de estudiante, apoderado, docente o directivo.</p>
          <Link to="/login" className="btn-gold">Ingresar al portal</Link>
        </div>
      </div>
    </div>
  )
}
