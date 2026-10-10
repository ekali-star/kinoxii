import { apiRequest } from './client'
import type { ApiResponse } from '../types/api'
import type { HoldRequest, Order, OrderRequest, SeatHold, SeatMap } from '../types/booking'
import type { FilterOptions } from '../types/filters'
import type { Session } from '../types/session'

export async function getFilterOptions(signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<FilterOptions>>('/filter-options', { signal })
  return response.data
}

export async function getSession(sessionId: number, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<Session>>(`/sessions/${sessionId}`, { signal })
  return response.data
}

export async function getSeatMap(sessionId: number, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<SeatMap>>(`/sessions/${sessionId}/seats`, {
    signal,
  })
  return response.data
}

export async function holdSeats(sessionId: number, request: HoldRequest) {
  const response = await apiRequest<ApiResponse<SeatHold>>(`/sessions/${sessionId}/holds`, {
    method: 'POST',
    body: request,
  })
  return response.data
}

export async function getHold(holdId: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<SeatHold>>(`/holds/${holdId}`, {
    signal,
    notifyUnauthenticated: false,
  })
  return response.data
}

export function releaseHold(holdId: string) {
  return apiRequest<void>(`/holds/${holdId}`, {
    method: 'DELETE',
    notifyUnauthenticated: false,
  })
}

export async function createOrder(request: OrderRequest) {
  const response = await apiRequest<ApiResponse<Order>>('/orders', {
    method: 'POST',
    body: request,
  })
  return response.data
}
