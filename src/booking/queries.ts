import { useQuery } from '@tanstack/react-query'
import { getFilterOptions, getSeatMap, getSession } from '../api/booking'

export const bookingKeys = {
  all: ['booking'] as const,
  session: (sessionId: number) => [...bookingKeys.all, 'session', sessionId] as const,
  seats: (sessionId: number) => [...bookingKeys.all, 'seats', sessionId] as const,
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ['filter-options'],
    queryFn: ({ signal }) => getFilterOptions(signal),
    staleTime: Infinity,
  })
}

export function useBookingSession(sessionId: number) {
  return useQuery({
    queryKey: bookingKeys.session(sessionId),
    queryFn: ({ signal }) => getSession(sessionId, signal),
  })
}

export function useSeatMap(sessionId: number) {
  return useQuery({
    queryKey: bookingKeys.seats(sessionId),
    queryFn: ({ signal }) => getSeatMap(sessionId, signal),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}
