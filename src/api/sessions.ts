import { apiRequest } from './client'
import type { SessionFilters, SessionsResponse } from '../types/session'

export function sessionsQueryString(filters: SessionFilters) {
  const params = new URLSearchParams({ date: filters.date, sort: filters.sort, page: String(filters.page) })
  for (const venue of filters.venues) params.append('venues[]', venue)
  for (const format of filters.formats) params.append('formats[]', format)
  for (const language of filters.languages) params.append('languages[]', language)
  for (const band of filters.bands) params.append('bands[]', band)
  if (filters.search) params.set('search', filters.search)
  return params.toString()
}

export function getSessions(filters: SessionFilters, signal?: AbortSignal) {
  return apiRequest<SessionsResponse>(`/sessions?${sessionsQueryString(filters)}`, { signal })
}
