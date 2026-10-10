import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.css'
import { AuthModalProvider } from './auth/AuthModalProvider.tsx'
import { AuthProvider } from './auth/AuthProvider.tsx'
import { router } from './routes/router.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthModalProvider>
          <RouterProvider router={router} />
        </AuthModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
