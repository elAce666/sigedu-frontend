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
    titulo: 'El colegio obtiene el primer lugar en Olimpiada Regional de Matematica',
    texto: 'Un grupo de estudiantes destaco en la competencia regional con excelentes resultados y reconocimiento de la comunidad educativa.',
    tono: 'logro',
  },
  {
    categoria: 'Comunicado',
    fecha: '29 junio 2026',
    titulo: 'Inicio del proceso de matricula 2027',
    texto: 'La direccion informa las fechas, requisitos y horarios para acompanar a las familias en el proceso de matricula.',
    tono: 'comunicado',
  },
  {
    categoria: 'Evento',
    fecha: '27 junio 2026',
    titulo: 'Aniversario del colegio: actividades para toda la familia',
    texto: 'Durante la semana aniversario se preparan actos, presentaciones artisticas y espacios de encuentro para la comunidad escolar.',
    tono: 'evento',
  },
  {
    categoria: 'Academico',
    fecha: '25 junio 2026',
    titulo: 'Estudiantes de 8o basico destacan en feria cientifica',
    texto: 'Proyectos de ciencias, creatividad y trabajo colaborativo fueron parte de la muestra realizada por los cursos de ensenanza basica.',
    tono: 'academico',
  },
]

const AGENDA = [
  {
    fecha: '02 JUL',
    dia: 'Miercoles',
    titulo: 'Reunion de apoderados 7o basico',
    detalle: '18:30 hrs - Sala multiproposito',
    tipo: 'administrativo',
    icono: <RiCalendarCheckLine />,
  },
  {
    fecha: '07 JUL',
    dia: 'Lunes',
    titulo: 'Acto civico y saludo de aniversario',
    detalle: '08:30 hrs - Patio central',
    tipo: 'social',
    icono: <RiTeamLine />,
  },
  {
    fecha: '11 JUL',
    dia: 'Viernes',
    titulo: 'Cierre del primer semestre',
    detalle: 'Finaliza el periodo academico regular',
    tipo: 'academico',
    icono: <RiBookOpenLine />,
  },
  {
    fecha: '14 JUL',
    dia: 'Lunes',
    titulo: 'Entrega de notas y cierre de periodo',
    detalle: 'Disponibles en el portal para apoderados y estudiantes',
    tipo: 'administrativo',
    icono: <RiFileUserLine />,
  },
  {
    fecha: '21 JUL',
    dia: 'Lunes',
    titulo: 'Inicio vacaciones de invierno',
    detalle: 'Suspension de clases hasta nuevo aviso del calendario escolar',
    tipo: 'social',
    icono: <RiCalendarEventLine />,
  },
]

const MODULOS = [
  { icon: <RiBookOpenLine />, titulo: 'Notas', texto: 'Consulta de calificaciones y seguimiento academico.' },
  { icon: <RiCalendarCheckLine />, titulo: 'Asistencia', texto: 'Registro diario y control de inasistencias.' },
  { icon: <RiChat3Line />, titulo: 'Mensajeria', texto: 'Comunicacion directa entre el colegio y las familias.' },
  { icon: <RiFileUserLine />, titulo: 'Hoja de vida', texto: 'Anotaciones y observaciones del proceso escolar.' },
]

const badgeClass = (tono) => `home__news-badge home__news-badge--${tono}`

export default function Home() {
  return (
    <div className="home">
      <section className="home__hero">
        <div className="home__container home__hero-grid">
          <div className="home__hero-content">
            <span className="home__hero-tag">Colegio Bernardo O'Higgins - Coquimbo</span>
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
              con acceso rapido para estudiantes, apoderados, docentes y equipo directivo.
            </p>
            <div className="home__hero-actions">
              <Link to="/login" className="home__btn home__btn--primary">Ingresar al portal</Link>
              <Link to="/nosotros" className="home__btn home__btn--secondary">Conocer el colegio</Link>
            </div>
          </div>

          <aside className="home__hero-card" aria-label="Aviso destacado">
            <span className="home__hero-card-label">Proximo hito</span>
            <h2>Reuniones de apoderados en julio</h2>
            <p>
              Revisar fechas y horarios publicados por cada curso para organizar la participacion
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
              <h2>Ultimas noticias</h2>
            </div>
            <p>
              Un resumen breve de lo que esta ocurriendo en el colegio, con informacion util para
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
              Proximas fechas relevantes del semestre para orientar la participacion de estudiantes
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
              <h2>Modulos del sistema</h2>
            </div>
            <p>Accesos internos para revisar informacion academica y de convivencia escolar.</p>
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