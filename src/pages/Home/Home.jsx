import { Link } from 'react-router-dom'
import {
  RiBookOpenLine,
  RiCalendarCheckLine,
  RiCalendarEventLine,
  RiChat3Line,
  RiFileUserLine,
  RiNewspaperLine,
  RiSchoolLine,
  RiTeamLine,
} from 'react-icons/ri'
import './Home.scss'

const NOTICIAS = [
  {
    categoria: 'Logro',
    fecha: '30 junio 2026',
    titulo: 'El colegio obtiene el primer lugar en Olimpiada Regional de Matemática',
    texto: 'Un grupo de estudiantes destacó en la competencia regional con excelentes resultados y reconocimiento de la comunidad educativa.',
    tono: 'logro',
  },
  {
    categoria: 'Comunicado',
    fecha: '29 junio 2026',
    titulo: 'Inicio del proceso de matrícula 2027',
    texto: 'La dirección informa las fechas, requisitos y horarios para acompañar a las familias en el proceso de matrícula.',
    tono: 'comunicado',
  },
  {
    categoria: 'Evento',
    fecha: '27 junio 2026',
    titulo: 'Aniversario del colegio: actividades para toda la familia',
    texto: 'Durante la semana aniversario se preparan actos, presentaciones artísticas y espacios de encuentro para la comunidad escolar.',
    tono: 'evento',
  },
  {
    categoria: 'Académico',
    fecha: '25 junio 2026',
    titulo: 'Estudiantes de 8° básico destacan en feria científica',
    texto: 'Proyectos de ciencias, creatividad y trabajo colaborativo fueron parte de la muestra realizada por los cursos de enseñanza básica.',
    tono: 'academico',
  },
]

const AGENDA = [
  {
    fecha: '02 JUL',
    dia: 'Miércoles',
    titulo: 'Reunión de apoderados 7° básico',
    detalle: '18:30 hrs · Sala multipropósito',
    tipo: 'administrativo',
    icono: <RiCalendarCheckLine />,
  },
  {
    fecha: '07 JUL',
    dia: 'Lunes',
    titulo: 'Acto cívico y saludo de aniversario',
    detalle: '08:30 hrs · Patio central',
    tipo: 'social',
    icono: <RiTeamLine />,
  },
  {
    fecha: '11 JUL',
    dia: 'Viernes',
    titulo: 'Cierre del primer semestre',
    detalle: 'Finaliza el período académico regular',
    tipo: 'academico',
    icono: <RiBookOpenLine />,
  },
  {
    fecha: '14 JUL',
    dia: 'Lunes',
    titulo: 'Entrega de notas y cierre de período',
    detalle: 'Disponibles en el portal para apoderados y estudiantes',
    tipo: 'administrativo',
    icono: <RiFileUserLine />,
  },
  {
    fecha: '21 JUL',
    dia: 'Lunes',
    titulo: 'Inicio vacaciones de invierno',
    detalle: 'Suspensión de clases hasta nuevo aviso del calendario escolar',
    tipo: 'social',
    icono: <RiCalendarEventLine />,
  },
]

const MODULOS = [
  { icon: <RiBookOpenLine />, titulo: 'Notas', texto: 'Consulta de calificaciones y seguimiento académico.' },
  { icon: <RiCalendarCheckLine />, titulo: 'Asistencia', texto: 'Registro diario y control de inasistencias.' },
  { icon: <RiChat3Line />, titulo: 'Mensajería', texto: 'Comunicación directa entre el colegio y las familias.' },
  { icon: <RiFileUserLine />, titulo: 'Hoja de vida', texto: 'Anotaciones y observaciones del proceso escolar.' },
]

const badgeClass = (tono) => `home__news-badge home__news-badge--${tono}`

export default function Home() {
  return (
    <div className="home">
      <section className="home__hero">
        <div className="home__container home__hero-grid">
          <div className="home__hero-content">
            <span className="home__hero-tag">Colegio Bernardo O'Higgins · Coquimbo</span>
            <div className="home__hero-brand">
              <div className="home__hero-logo" aria-hidden="true">
                <RiSchoolLine />
              </div>
              <div>
                <h1>Comunidad educativa Bernardo O'Higgins</h1>
                <p className="home__hero-sub">Diario mural digital del colegio</p>
              </div>
            </div>
            <p className="home__hero-desc">
              Noticias, comunicados y actividades de nuestra comunidad escolar en un solo lugar,
              con acceso rápido para estudiantes, apoderados, docentes y equipo directivo.
            </p>
            <div className="home__hero-actions">
              <Link to="/login" className="home__btn home__btn--primary">Ingresar al portal</Link>
              <Link to="/nosotros" className="home__btn home__btn--secondary">Conocer el colegio</Link>
            </div>
          </div>

          <aside className="home__hero-card" aria-label="Aviso destacado">
            <span className="home__hero-card-label">Próximo hito</span>
            <h2>Reuniones de apoderados en julio</h2>
            <p>
              Revisar fechas y horarios publicados por cada curso para organizar la participación
              de las familias.
            </p>
            <div className="home__hero-card-footer">
              <span>Informaciones actualizadas por el colegio</span>
              <RiNewspaperLine />
            </div>
          </aside>
        </div>
      </section>

      <section className="home__section home__section--news">
        <div className="home__container">
          <div className="home__section-head">
            <div>
              <span className="home__section-kicker">Comunicados</span>
              <h2>Últimas noticias</h2>
            </div>
            <p>
              Un resumen breve de lo que está ocurriendo en el colegio, con información útil para
              la comunidad escolar.
            </p>
          </div>

          <div className="home__news-grid">
            {NOTICIAS.map((noticia) => (
              <article className="home__news-card" key={noticia.titulo}>
                <div className="home__news-image" aria-hidden="true">
                  <span>Imagen referencial</span>
                </div>
                <div className="home__news-body">
                  <div className="home__news-meta">
                    <span className={badgeClass(noticia.tono)}>{noticia.categoria}</span>
                    <span className="home__news-date">{noticia.fecha}</span>
                  </div>
                  <h3>{noticia.titulo}</h3>
                  <p>{noticia.texto}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home__section home__section--agenda">
        <div className="home__container">
          <div className="home__section-head">
            <div>
              <span className="home__section-kicker">Agenda escolar</span>
              <h2>Calendario de actividades</h2>
            </div>
            <p>
              Próximas fechas relevantes del semestre para orientar la participación de estudiantes
              y familias.
            </p>
          </div>

          <div className="home__agenda-list">
            {AGENDA.map((evento) => (
              <article className="home__agenda-item" key={evento.titulo}>
                <div className="home__agenda-date">
                  <strong>{evento.fecha}</strong>
                  <span>{evento.dia}</span>
                </div>
                <div className={`home__agenda-icon home__agenda-icon--${evento.tipo}`}>
                  {evento.icono}
                </div>
                <div className="home__agenda-content">
                  <h3>{evento.titulo}</h3>
                  <p>{evento.detalle}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home__section home__section--modules">
        <div className="home__container">
          <div className="home__section-head home__section-head--compact">
            <div>
              <span className="home__section-kicker">Portal SIGEDU</span>
              <h2>Módulos del sistema</h2>
            </div>
            <p>Accesos internos para revisar información académica y de convivencia escolar.</p>
          </div>

          <div className="home__modulos-grid">
            {MODULOS.map((modulo) => (
              <article className="home__modulo-card" key={modulo.titulo}>
                <div className="home__modulo-icon">{modulo.icon}</div>
                <h3>{modulo.titulo}</h3>
                <p>{modulo.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}