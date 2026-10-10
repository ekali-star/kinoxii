import { createContext } from 'react'
import type { LoginRequest, RegisterRequest } from '../types/auth'
import type { User } from '../types/user'

export type AuthStatus = 'loading' | 'authenticated' | 'guest'

export interface AuthContextValue {
  user: User | null
  status: AuthStatus
  login: (request: LoginRequest) => Promise<User>
  register: (request: RegisterRequest) => Promise<User>
  logout: () => Promise<void>
  setUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
