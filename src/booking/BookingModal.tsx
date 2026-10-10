import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { useAuthModal } from '../auth/useAuthModal'
import { BookingDialog } from './BookingDialog'

export const SESSION_PARAM = 'session'

export function BookingModal() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, status } = useAuth()
  const { requireAuth } = useAuthModal()
  const sessionId = Number(searchParams.get(SESSION_PARAM)) || null

  const close = useCallback(() => {
    setSearchParams(
      (params) => {
        params.delete(SESSION_PARAM)
        return params
      },
      { replace: true, preventScrollReset: true },
    )
  }, [setSearchParams])

  useEffect(() => {
    if (sessionId === null || status !== 'guest') return
    close()
    requireAuth(() =>
      setSearchParams(
        (params) => {
          params.set(SESSION_PARAM, String(sessionId))
          return params
        },
        { preventScrollReset: true },
      ),
    )
  }, [sessionId, status, close, requireAuth, setSearchParams])

  if (sessionId === null || !user) return null

  return <BookingDialog key={sessionId} sessionId={sessionId} user={user} onClose={close} />
}
