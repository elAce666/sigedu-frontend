import { RiMapPinLine, RiMailLine, RiPhoneLine } from 'react-icons/ri'
import './Footer.scss'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">
          <h3>Colegio Bernardo O'Higgins</h3>
          <p>Comunidad educativa de Coquimbo comprometida con la formacion integral de sus estudiantes.</p>
          <p className="footer__colegio">SIGEDU - Diario mural y portal escolar</p>
        </div>

        <div className="footer__contacto">
          <p><RiMapPinLine /> Coquimbo, Region de Coquimbo</p>
          <p><RiMailLine /> contacto@bernardoohiggins.cl</p>
          <p><RiPhoneLine /> +56 51 234 5678</p>
        </div>
      </div>

      <div className="footer__bottom">
        <p>(c) {new Date().getFullYear()} Colegio Bernardo O'Higgins. Informacion institucional para la comunidad escolar.</p>
      </div>
    </footer>
  )
}
