import { createBrowserRouter } from 'react-router'
import { RequireAuth } from '../auth/RequireAuth'
import { RootLayout } from '../layouts/RootLayout'
import { HomePage } from '../pages/home/HomePage'
import { MovieDetailsPage } from '../pages/movie/MovieDetailsPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { SessionsPage } from '../pages/SessionsPage'
import { MyTicketsTab } from '../pages/profile/MyTicketsTab'
import { PersonalInfoTab } from '../pages/profile/PersonalInfoTab'
import { ProfilePage } from '../pages/profile/ProfilePage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'movies/:slug', element: <MovieDetailsPage /> },
      {
        path: 'profile',
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <PersonalInfoTab /> },
          { path: 'tickets', element: <MyTicketsTab /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
