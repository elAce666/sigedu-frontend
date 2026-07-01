import PropTypes from 'prop-types'

const LABELS = {
  ESTUDIANTE: 'Estudiante',
  APODERADO: 'Apoderado',
  DOCENTE: 'Docente',
  ADMIN: 'Directivo',
}

const CLASSES = {
  ESTUDIANTE: 'badge-estudiante',
  APODERADO: 'badge-apoderado',
  DOCENTE: 'badge-docente',
  ADMIN: 'badge-admin',
}

export default function RoleBadge({ rol }) {
  return <span className={CLASSES[rol] || 'badge-estudiante'}>{LABELS[rol] || rol}</span>
}

RoleBadge.propTypes = {
  rol: PropTypes.string.isRequired,
}
