import { createContext } from 'react'

export type ProtectedAction = () => unknown

export interface AuthModalContextValue {
  openLogin: () => void
  openRegister: () => void
  requireAuth: (action: ProtectedAction) => Promise<void>
}

export const AuthModalContext = createContext<AuthModalContextValue | null>(null)
