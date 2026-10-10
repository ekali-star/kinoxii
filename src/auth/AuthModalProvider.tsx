import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ApiError, onUnauthenticated } from '../api/client'
import { AuthModalContext, type ProtectedAction } from './AuthModalContext'
import { LoginModal } from './LoginModal'
import { RegisterModal } from './RegisterModal'
import { useAuth } from './useAuth'

type AuthView = 'login' | 'register' | null

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const [view, setView] = useState<AuthView>(null)
  const pendingAction = useRef<ProtectedAction | null>(null)

  const openLogin = useCallback(() => setView('login'), [])
  const openRegister = useCallback(() => setView('register'), [])

  const close = useCallback(() => {
    pendingAction.current = null
    setView(null)
  }, [])

  const runProtected = useCallback(async (action: ProtectedAction) => {
    try {
      await action()
    } catch (error) {
      if (!(error instanceof ApiError && error.isUnauthenticated)) throw error
      pendingAction.current = action
      setView('login')
    }
  }, [])

  const requireAuth = useCallback(
    async (action: ProtectedAction) => {
      if (status === 'guest') {
        pendingAction.current = action
        setView('login')
        return
      }
      await runProtected(action)
    },
    [status, runProtected],
  )

  const handleAuthenticated = useCallback(() => {
    const action = pendingAction.current
    pendingAction.current = null
    setView(null)
    if (action) runProtected(action).catch(console.error)
  }, [runProtected])

  useEffect(() => onUnauthenticated(() => setView('login')), [])

  const value = useMemo(
    () => ({ openLogin, openRegister, requireAuth }),
    [openLogin, openRegister, requireAuth],
  )

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {view === 'login' && (
        <LoginModal
          onClose={close}
          onSuccess={handleAuthenticated}
          onSwitchToRegister={openRegister}
        />
      )}
      {view === 'register' && (
        <RegisterModal
          onClose={close}
          onSuccess={handleAuthenticated}
          onSwitchToLogin={openLogin}
        />
      )}
    </AuthModalContext.Provider>
  )
}
