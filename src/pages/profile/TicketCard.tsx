import { Link } from 'react-router'
import { AgeBadge } from '../../components/AgeBadge/AgeBadge'
import { formatPrice, formatRuntime, formatTime, formatWeekdayDate, sessionStart } from '../../lib/format'
import { paths } from '../../routes/paths'
import type { Order } from '../../types/booking'

export const REFUND_CUTOFF_HOURS = 2

function refundDeadline(order: Order) {
  const deadline = sessionStart(order.session.date, order.session.time)
  deadline.setHours(deadline.getHours() - REFUND_CUTOFF_HOURS)
  return `${formatTime(deadline)}, ${formatWeekdayDate(deadline)}`
}

function OrderStatus({ order }: { order: Order }) {
  if (order.status === 'refunded') {
    return <p className="ticket-card__note ticket-card__note--refunded">Refunded</p>
  }
  if (!order.isUpcoming) return <p className="ticket-card__note">Session ended</p>
  return null
}

interface TicketCardProps {
  order: Order
  onRefund?: (order: Order) => void
}

export function TicketCard({ order, onRefund }: TicketCardProps) {
  const { session, tickets } = order
  const movie = session.movie
  const canAct = order.isUpcoming && onRefund

  return (
    <article className="ticket-card" aria-label={`Order ${order.reference}`}>
      <div className="ticket-card__main">
        <div className="ticket-card__poster">
          {movie?.posterUrl && <img src={movie.posterUrl} alt="" loading="lazy" />}
        </div>

        <div className="ticket-card__details">
          <h3 className="ticket-card__title">
            {movie ? <Link to={paths.movie(movie.slug)}>{movie.title}</Link> : 'Session'}
            {movie && <AgeBadge rating={movie.ageRating} />}
            {movie && (
              <span className="ticket-card__runtime">{formatRuntime(movie.runtimeMinutes)}</span>
            )}
          </h3>

          <dl className="ticket-card__facts">
            <div>
              <dt>Date</dt>
              <dd>
                {formatWeekdayDate(session.date)} · {session.time}
              </dd>
            </div>
            <div>
              <dt>Venue</dt>
              <dd>
                {session.venue.name} · Hall {session.hall.name}
              </dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>
                {session.format.name} · {session.language.name}
              </dd>
            </div>
          </dl>

          <div className="ticket-card__seats">
            <span className="ticket-card__label">Seats</span>
            <ul>
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  {ticket.seatCode} · {ticket.ticketType.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="ticket-card__stub">
        <div>
          <span className="ticket-card__label">Order</span>
          <p className="ticket-card__reference">#{order.reference}</p>
        </div>
        <p className="ticket-card__total">
          <span>Total paid</span>
          <strong>{formatPrice(order.totalPrice)}</strong>
        </p>
        {canAct ? (
          <>
            <button
              type="button"
              className="button ticket-card__refund"
              disabled={!order.isRefundable}
              title={
                order.isRefundable
                  ? undefined
                  : `Refunds close ${REFUND_CUTOFF_HOURS} hours before the session starts`
              }
              onClick={() => onRefund(order)}
            >
              Refund
            </button>
            <p className="ticket-card__note">
              {order.isRefundable
                ? `Refundable until ${refundDeadline(order)}`
                : `Refunds closed at ${refundDeadline(order)}, ${REFUND_CUTOFF_HOURS} hours before the session`}
            </p>
          </>
        ) : (
          <OrderStatus order={order} />
        )}
      </div>
    </article>
  )
}
