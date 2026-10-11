import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getTickets, refundOrder } from '../api/profile'
import { bookingKeys } from '../booking/queries'
import { movieKeys } from '../movies/queries'
import { sessionKeys } from '../sessions/queries'
import type { Order } from '../types/booking'

export const ticketKeys = {
  all: ['tickets'] as const,
}

function byStart(a: Order, b: Order) {
  return a.session.startsAt.localeCompare(b.session.startsAt)
}

export function useTickets() {
  return useQuery({
    queryKey: ticketKeys.all,
    queryFn: ({ signal }) => getTickets(signal),
    select: (orders) => ({
      upcoming: orders.filter((order) => order.isUpcoming).sort(byStart),
      past: orders.filter((order) => !order.isUpcoming).sort((a, b) => byStart(b, a)),
    }),
  })
}

export function useRefundOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reference: string) => refundOrder(reference),
    onSuccess: (order) => {
      queryClient.setQueryData<Order[]>(ticketKeys.all, (orders) =>
        orders?.map((current) => (current.id === order.id ? order : current)),
      )
      queryClient.invalidateQueries({ queryKey: ticketKeys.all })
      queryClient.invalidateQueries({ queryKey: sessionKeys.all })
      queryClient.invalidateQueries({ queryKey: [...movieKeys.all, 'sessions'] })
      queryClient.invalidateQueries({ queryKey: bookingKeys.seats(order.session.id) })
    },
  })
}
