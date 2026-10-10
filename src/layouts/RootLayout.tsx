import { Outlet, ScrollRestoration, useMatch } from 'react-router'
import { Footer } from '../components/Footer/Footer'
import { Navbar } from '../components/Navbar/Navbar'
import { paths } from '../routes/paths'
import './RootLayout.css'

export function RootLayout() {
  const isHome = useMatch(paths.home) !== null
  const isMovie = useMatch(paths.movie(':slug')) !== null

  return (
    <div className="layout">
      <Navbar overlay={isHome || isMovie} />
      <main className="layout__main">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
