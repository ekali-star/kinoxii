import { Outlet, ScrollRestoration } from 'react-router'
import { Navbar } from '../components/Navbar/Navbar'

export function RootLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <ScrollRestoration />
    </>
  )
}
