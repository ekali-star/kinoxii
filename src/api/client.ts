import type { ValidationErrorResponse } from '../types/api'
import { tokenStorage } from '../auth/tokenStorage'

const BASE_URL =
  import.meta.env.VITE_API_URL ?? 'https://api.kinoxii.redberryinternship.ge/api'

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>
  body: unknown

  constructor(status: number, message: string, errors?: Record<string, string[]>, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.body = body
  }

  get isUnauthenticated() {
    return this.status === 401
  }

  get isValidationError() {
    return this.status === 422 && this.errors !== undefined
  }

  get contested(): string[] {
    const contested = (this.body as { contested?: unknown } | null)?.contested
    return Array.isArray(contested) ? contested.filter((code) => typeof code === 'string') : []
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  notifyUnauthenticated?: boolean
}

type Listener = () => void
const unauthenticatedListeners = new Set<Listener>()

export function onUnauthenticated(listener: Listener) {
  unauthenticatedListeners.add(listener)
  return () => {
    unauthenticatedListeners.delete(listener)
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal, notifyUnauthenticated = true } = options
  const headers: Record<string, string> = { Accept: 'application/json' }

  const token = tokenStorage.get()
  if (token) headers.Authorization = `Bearer ${token}`

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${path}`, { method, headers, body: payload, signal })

  if (response.status === 204) return undefined as T

  const json = await response.json().catch(() => null)

  if (!response.ok) {
    const error = json as Partial<ValidationErrorResponse> | null
    if (response.status === 401 && token && notifyUnauthenticated) {
      unauthenticatedListeners.forEach((listener) => listener())
    }
    throw new ApiError(response.status, error?.message ?? response.statusText, error?.errors, json)
  }

  return json as T
}
