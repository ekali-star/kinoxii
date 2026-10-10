import { useAuth } from '../../auth/useAuth'
import { useAuthModal } from '../../auth/useAuthModal'
import { UserMenu } from './UserMenu'
import './Navbar.css'

export function Navbar() {
  const { user, status } = useAuth()
  const { openLogin, openRegister } = useAuthModal()

  return (
    <header className="navbar">
      <a href="/" className="navbar__logo" aria-label="Kino XII home">
        KINO <span>XII</span>
      </a>

      <nav aria-label="Main">
        <a href="/sessions" className="navbar__link">
          Sessions
        </a>
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
