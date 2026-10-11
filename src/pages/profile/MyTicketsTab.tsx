import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ApiError } from '../../api/client'
import { CheckIcon } from '../../components/icons'
import { Modal } from '../../components/Modal/Modal'
import { SectionError } from '../../components/SectionError/SectionError'
import { formatPrice } from '../../lib/format'
import { useRefundOrder, useTickets } from '../../profile/queries'
import { paths } from '../../routes/paths'
import type { Order } from '../../types/booking'
import { TicketCard } from './TicketCard'

type View = 'upcoming' | 'past'

const VIEW_PARAM = 'view'

interface RefundDialogProps {
  order: Order
  onClose: () => void
  onRefunded: (order: Order) => void
}

function RefundDialog({ order, onClose, onRefunded }: RefundDialogProps) {
  const refund = useRefundOrder()

  const confirm = () => {
    refund.mutate(order.reference, { onSuccess: onRefunded })
  }

  const errorMessage =
    refund.error instanceof ApiError ? refund.error.message : refund.error ? "Couldn't refund this order." : null

  return (
    <Modal title="Refund this order?" onClose={() => !refund.isPending && onClose()}>
      <div className="refund-dialog">
        <p>
          Order <strong>#{order.reference}</strong> for {order.session.movie?.title ?? 'this session'}{' '}
          will be cancelled, your seats will be released and{' '}
          <strong>{formatPrice(order.totalPrice)}</strong> will go back to the card ending in{' '}
          {order.cardLastFour}. This can't be undone.
        </p>
        {errorMessage && (
          <p className="refund-dialog__error" role="alert">
            {errorMessage}
          </p>
        )}
        <div className="refund-dialog__actions">
          <button
            type="button"
            className="button button--outline"
            disabled={refund.isPending}
            onClick={onClose}
          >
            Keep tickets
          </button>
          <button
            type="button"
            className="button button--primary"
            disabled={refund.isPending}
            onClick={confirm}
          >
            {refund.isPending ? 'Refunding…' : 'Refund'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function MyTicketsTab() {
  const tickets = useTickets()
  const [searchParams, setSearchParams] = useSearchParams()
  const [refunding, setRefunding] = useState<Order | null>(null)
  const [refunded, setRefunded] = useState<Order | null>(null)
  const view: View = searchParams.get(VIEW_PARAM) === 'past' ? 'past' : 'upcoming'

  const selectView = (next: View) => {
    setRefunded(null)
    setSearchParams(
      (params) => {
        if (next === 'past') params.set(VIEW_PARAM, next)
        else params.delete(VIEW_PARAM)
        return params
      },
      { replace: true, preventScrollReset: true },
    )
  }

  const views: { id: View; label: string; count?: number }[] = [
    { id: 'upcoming', label: 'Upcoming', count: tickets.data?.upcoming.length },
    { id: 'past', label: 'Past', count: tickets.data?.past.length },
  ]

  const orders = tickets.data?.[view] ?? []

  return (
    <div className="my-tickets">
      <div className="ticket-views" role="group" aria-label="Show tickets">
        {views.map((option) => (
          <button
            key={option.id}
            type="button"
            className="ticket-views__option"
            aria-pressed={view === option.id}
            onClick={() => selectView(option.id)}
          >
            {option.label}
            {option.count !== undefined && <span>{option.count}</span>}
          </button>
        ))}
      </div>

      {refunded && (
        <p className="tickets-notice" role="status">
          <CheckIcon size={16} />
          Order #{refunded.reference} was refunded. You'll find it under Past.
        </p>
      )}

      {tickets.isError ? (
        <SectionError message="Couldn't load your tickets." onRetry={tickets.refetch} />
      ) : tickets.isPending ? (
        <div className="ticket-list">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="skeleton ticket-card__skeleton" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="tickets-empty">
          {view === 'upcoming' ? (
            <>
              <p>You don't have any upcoming tickets.</p>
              <Link to={paths.sessions} className="button button--primary">
                Browse sessions
              </Link>
            </>
          ) : (
            <p>Past and refunded orders will show up here.</p>
          )}
        </div>
      ) : (
        <div className="ticket-list">
          {orders.map((order) => (
            <TicketCard
              key={order.id}
              order={order}
              onRefund={view === 'upcoming' ? setRefunding : undefined}
            />
          ))}
        </div>
      )}

      {refunding && (
        <RefundDialog
          order={refunding}
          onClose={() => setRefunding(null)}
          onRefunded={(order) => {
            setRefunding(null)
            setRefunded(order)
          }}
        />
      )}
    </div>
  )
}
