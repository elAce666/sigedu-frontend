import PropTypes from 'prop-types'
import { RiCloseLine } from 'react-icons/ri'
import './Modal.scss'

export default function Modal({ title, onClose, children, maxWidth }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={maxWidth ? { maxWidth } : undefined} onClick={(e) => e.stopPropagation()}>
        <div className="modal-box__header">
          <h3>{title}</h3>
          <button onClick={onClose} aria-label="Cerrar"><RiCloseLine /></button>
        </div>
        <div className="modal-box__body">{children}</div>
      </div>
    </div>
  )
}

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  maxWidth: PropTypes.string,
}
