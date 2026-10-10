import { NavLink, Outlet } from 'react-router'
import { paths } from '../../routes/paths'
import './ProfilePage.css'

export function ProfilePage() {
  return (
    <section className="page">
      <h1 className="page__title">My Profile</h1>

      <nav className="profile-tabs" aria-label="Profile sections">
        <NavLink to={paths.profile} end className="profile-tabs__tab">
          Personal Information
        </NavLink>
        <NavLink to={paths.profileTickets} className="profile-tabs__tab">
          My Tickets
        </NavLink>
      </nav>

      <Outlet />
    </section>
  )
}
