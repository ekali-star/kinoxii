import type { User } from './user'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  password_confirmation: string
  avatar?: File | null
}

export interface AuthResponse {
  user: User
  token: string
}
