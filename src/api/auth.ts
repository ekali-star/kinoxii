import { apiRequest } from './client'
import type { ApiResponse } from '../types/api'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'
import type { User } from '../types/user'

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await apiRequest<ApiResponse<AuthResponse>>('/login', {
    method: 'POST',
    body: request,
    notifyUnauthenticated: false,
  })
  return response.data
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  const form = new FormData()
  form.append('username', request.username)
  form.append('email', request.email)
  form.append('password', request.password)
  form.append('password_confirmation', request.password_confirmation)
  if (request.avatar) form.append('avatar', request.avatar)

  const response = await apiRequest<ApiResponse<AuthResponse>>('/register', {
    method: 'POST',
    body: form,
  })
  return response.data
}

export function logout(): Promise<void> {
  return apiRequest<void>('/logout', { method: 'POST', notifyUnauthenticated: false })
}

export async function getMe(signal?: AbortSignal): Promise<User> {
  const response = await apiRequest<ApiResponse<User>>('/me', {
    signal,
    notifyUnauthenticated: false,
  })
  return response.data
}
