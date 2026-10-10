import { useEffect, useEffectEvent, useState } from 'react'

export function useCountdown(expiresAt: string | null, onExpire?: () => void) {
  const [now, setNow] = useState(() => Date.now())
  const handleExpire = useEffectEvent(() => onExpire?.())

  useEffect(() => {
    if (!expiresAt) return
    const end = new Date(expiresAt).getTime()
    let fired = false
    const timer = window.setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (!fired && current >= end) {
        fired = true
        handleExpire()
      }
    }, 250)
    return () => window.clearInterval(timer)
  }, [expiresAt])

  if (!expiresAt) return null
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000))
}

export function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}
