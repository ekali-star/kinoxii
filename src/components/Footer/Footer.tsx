import { Link } from 'react-router'
import { paths } from '../../routes/paths'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <Link to={paths.home} className="navbar__logo footer__logo" aria-label="Kino XII home">
        KINO <span>XII</span>
      </Link>
      <p className="footer__copyright">© {new Date().getFullYear()} Kino XII. All rights reserved.</p>
    </footer>
  )
}
