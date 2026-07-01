import PropTypes from 'prop-types'
import './UI.scss'

export default function StatCard({ icon, label, value, tone = 'primario' }) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__icon">{icon}</div>
      <div>
        <p className="stat-card__value">{value}</p>
        <p className="stat-card__label">{label}</p>
      </div>
    </div>
  )
}

StatCard.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tone: PropTypes.oneOf(['primario', 'dorado', 'exito', 'error', 'advertencia']),
}
