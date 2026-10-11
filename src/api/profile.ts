import { apiRequest } from './client'
import type { ApiResponse } from '../types/api'
import type { Order } from '../types/booking'
import type { ProfileRequest, User } from '../types/user'

export async function updateProfile(request: ProfileRequest) {
  const form = new FormData()
  form.append('fullName', request.fullName)
  form.append('mobileNumber', request.mobileNumber)
  form.append('dateOfBirth', request.dateOfBirth)
  form.append('preferredVenueId', request.preferredVenueId === null ? '' : String(request.preferredVenueId))

  const response = await apiRequest<ApiResponse<User>>('/profile', { method: 'PUT', body: form })
  return response.data
}

export async function getTickets(signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<Order[]>>('/tickets', { signal })
  return response.data
}

export async function refundOrder(reference: string) {
  const response = await apiRequest<ApiResponse<Order>>(
    `/orders/${encodeURIComponent(reference)}/refund`,
    { method: 'POST' },
  )
  return response.data
}
