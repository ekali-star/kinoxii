import { NavLink, Outlet } from 'react-router'
import { useTickets } from '../../profile/queries'
import { paths } from '../../routes/paths'
import './ProfilePage.css'

export function ProfilePage() {
  const tickets = useTickets()
  const upcoming = tickets.data?.upcoming.length ?? 0

  return (
    <section className="page profile-page">
      <h1 className="page__title">My Profile</h1>

      <nav className="profile-tabs" aria-label="Profile sections">
        <NavLink to={paths.profile} end className="profile-tabs__tab">
          Personal Information
        </NavLink>
        <NavLink to={paths.profileTickets} className="profile-tabs__tab">
          My Tickets
          {upcoming > 0 && (
            <span className="profile-tabs__badge" aria-label={`${upcoming} upcoming`}>
              {upcoming}
            </span>
          )}
        </NavLink>
      </nav>

      <Outlet />
    </section>
  )
}
