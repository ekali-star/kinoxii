import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.css'
import { AuthModalProvider } from './auth/AuthModalProvider.tsx'
import { AuthProvider } from './auth/AuthProvider.tsx'
import { router } from './routes/router.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AuthModalProvider>
        <RouterProvider router={router} />
      </AuthModalProvider>
    </AuthProvider>
  </StrictMode>,
)
