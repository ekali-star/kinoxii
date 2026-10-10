const key = (sessionId: number) => `kinoxii_hold_${sessionId}`

export const holdStorage = {
  get(sessionId: number) {
    try {
      return sessionStorage.getItem(key(sessionId))
    } catch {
      return null
    }
  },
  set(sessionId: number, holdId: string) {
    try {
      sessionStorage.setItem(key(sessionId), holdId)
    } catch {
      return
    }
  },
  clear(sessionId: number) {
    try {
      sessionStorage.removeItem(key(sessionId))
    } catch {
      return
    }
  },
}
