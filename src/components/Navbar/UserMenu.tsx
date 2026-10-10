import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { paths } from '../../routes/paths'
import type { User } from '../../types/user'
import { CheckIcon, ChevronDownIcon, LogoutIcon, TicketIcon, UserIcon } from '../icons'

function displayName(user: User) {
  return user.fullName?.trim() || user.username
}

function initials(user: User) {
  return displayName(user)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function Avatar({ user, size }: { user: User; size: 'sm' | 'md' }) {
  return (
    <span className={`user-avatar user-avatar--${size}`}>
      {user.avatar ? <img src={user.avatar} alt="" /> : initials(user)}
      <span
        className="user-avatar__status"
        data-complete={user.profileComplete}
        aria-hidden="true"
      />
    </span>
  )
}

export function UserMenu({ user }: { user: User }) {
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleLogout = () => {
    setIsOpen(false)
    logout().catch(() => {})
  }

  return (
    <div className="user-menu" ref={containerRef}>
      <button
        type="button"
        className="user-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Avatar user={user} size="sm" />
        <span className="user-menu__first-name">{displayName(user).split(/\s+/)[0]}</span>
        <ChevronDownIcon className="user-menu__chevron" size={18} />
      </button>

      {isOpen && (
        <div id={menuId} className="user-menu__dropdown" role="menu">
          <div className="user-menu__identity">
            <Avatar user={user} size="md" />
            <div className="user-menu__identity-text">
              <span className="user-menu__name">{displayName(user)}</span>
              <span className="user-menu__email">{user.email}</span>
            </div>
          </div>

          {user.profileComplete ? (
            <div className="user-menu__status user-menu__status--complete">
              Profile Complete <CheckIcon size={18} />
            </div>
          ) : (
            <div className="user-menu__status user-menu__status--incomplete">
              <strong>Profile incomplete</strong>
              <span>Please complete your profile to enable booking</span>
            </div>
          )}

          <div className="user-menu__items">
            <Link
              to={paths.profile}
              className="user-menu__item"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <UserIcon />
              My Profile
            </Link>
            <Link
              to={paths.profileTickets}
              className="user-menu__item"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <TicketIcon />
              My Tickets
            </Link>
          </div>

          <div className="user-menu__footer">
            <button
              type="button"
              className="user-menu__item user-menu__item--danger"
              role="menuitem"
              onClick={handleLogout}
            >
              <LogoutIcon />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
