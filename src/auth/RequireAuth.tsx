import { useEffect, useRef, type ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { paths } from '../routes/paths'
import { useAuth } from './useAuth'
import { useAuthModal } from './useAuthModal'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const { requireAuth } = useAuthModal()
  const navigate = useNavigate()
  const location = useLocation()
  const wasAuthenticated = useRef(false)

  useEffect(() => {
    if (status === 'authenticated') wasAuthenticated.current = true
  }, [status])

  useEffect(() => {
    if (status !== 'guest' || wasAuthenticated.current) return
    const target = location.pathname + location.search
    requireAuth(() => navigate(target))
  }, [status, requireAuth, navigate, location.pathname, location.search])

  if (status === 'loading') return null
  if (status === 'guest') return <Navigate to={paths.home} replace />
  return children
}
