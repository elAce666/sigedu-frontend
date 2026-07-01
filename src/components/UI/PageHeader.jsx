import PropTypes from 'prop-types'
import './UI.scss'

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="text-suave">{subtitle}</p>}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </div>
  )
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  action: PropTypes.node,
}
