import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getSessions } from '../api/sessions'
import type { SessionFilters } from '../types/session'

export const sessionKeys = {
  all: ['sessions'] as const,
  list: (filters: SessionFilters) => [...sessionKeys.all, 'list', filters] as const,
}

export function useSessions(filters: SessionFilters, enabled = true) {
  return useQuery({
    queryKey: sessionKeys.list(filters),
    queryFn: ({ signal }) => getSessions(filters, signal),
    placeholderData: keepPreviousData,
    enabled,
  })
}
