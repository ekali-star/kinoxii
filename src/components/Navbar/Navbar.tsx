import { Link } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { useAuthModal } from '../../auth/useAuthModal'
import { paths } from '../../routes/paths'
import { UserMenu } from './UserMenu'
import './Navbar.css'

export function Navbar() {
  const { user, status } = useAuth()
  const { openLogin, openRegister } = useAuthModal()

  return (
    <header className="navbar">
      <Link to={paths.home} className="navbar__logo" aria-label="Kino XII home">
        KINO <span>XII</span>
      </Link>

      <nav aria-label="Main">
        <Link to={paths.sessions} className="navbar__link">
          Sessions
        </Link>
      </nav>

      <div className="navbar__actions">
        {user ? (
          <UserMenu user={user} />
        ) : status === 'guest' ? (
          <>
            <button type="button" className="button button--primary" onClick={openRegister}>
              Sign up
            </button>
            <button type="button" className="button button--light" onClick={openLogin}>
              Log in
            </button>
          </>
        ) : null}
      </div>
    </header>
  )
}
