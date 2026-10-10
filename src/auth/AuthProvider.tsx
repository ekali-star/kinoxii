import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import { ApiError, onUnauthenticated } from '../api/client'
import type { LoginRequest, RegisterRequest } from '../types/auth'
import type { User } from '../types/user'
import { AuthContext, type AuthStatus } from './AuthContext'
import { tokenStorage } from './tokenStorage'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() =>
    tokenStorage.get() ? 'loading' : 'guest',
  )

  useEffect(() => {
    if (!tokenStorage.get()) return

    const controller = new AbortController()
    authApi
      .getMe(controller.signal)
      .then((me) => {
        setUserState(me)
        setStatus('authenticated')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (error instanceof ApiError && error.isUnauthenticated) tokenStorage.clear()
        setStatus('guest')
      })

    return () => controller.abort()
  }, [])

  useEffect(
    () =>
      onUnauthenticated(() => {
        tokenStorage.clear()
        setUserState(null)
        setStatus('guest')
      }),
    [],
  )

  const setUser = useCallback((next: User) => {
    setUserState(next)
    setStatus('authenticated')
  }, [])

  const login = useCallback(
    async (request: LoginRequest) => {
      const { user, token } = await authApi.login(request)
      tokenStorage.set(token)
      setUser(user)
      return user
    },
    [setUser],
  )

  const register = useCallback(
    async (request: RegisterRequest) => {
      const { user, token } = await authApi.register(request)
      tokenStorage.set(token)
      setUser(user)
      return user
    },
    [setUser],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      tokenStorage.clear()
      setUserState(null)
      setStatus('guest')
    }
  }, [])

  const value = useMemo(
    () => ({ user, status, login, register, logout, setUser }),
    [user, status, login, register, logout, setUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
