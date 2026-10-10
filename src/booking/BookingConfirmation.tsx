import { Link } from 'react-router'
import { CheckIcon } from '../components/icons'
import { formatPrice } from '../lib/format'
import { paths } from '../routes/paths'
import type { Order } from '../types/booking'
import { seatCodes, sessionShortLine, ticketSummary } from './bookingFormat'

interface BookingConfirmationProps {
  order: Order
  movieTitle: string
  posterUrl: string | null
  onClose: () => void
}

export function BookingConfirmation({ order, movieTitle, posterUrl, onClose }: BookingConfirmationProps) {
  return (
    <div className="confirmation">
      <span className="confirmation__icon" aria-hidden="true">
        <CheckIcon size={30} />
      </span>
      <h3 className="confirmation__title">Booking confirmed!</h3>
      <p className="confirmation__text">
        Your tickets are ready. We've sent the confirmation to {order.contact.email}.
      </p>
      <p className="confirmation__reference">Order #{order.reference}</p>

      <div className="confirmation__card">
        <div className="confirmation__film">
          {posterUrl && <img src={posterUrl} alt="" />}
          <div>
            <p className="booking-summary__title">{movieTitle}</p>
            <p className="booking-summary__meta">{sessionShortLine(order.session, true)}</p>
          </div>
        </div>
        <dl className="booking-summary__list">
          <div>
            <dt>Seats</dt>
            <dd>{seatCodes(order.tickets.map((ticket) => ticket.seatCode))}</dd>
          </div>
          <div>
            <dt>Tickets</dt>
            <dd>{ticketSummary(order.tickets.map((ticket) => ticket.ticketType.name))}</dd>
          </div>
          <div className="confirmation__total">
            <dt>Total paid</dt>
            <dd>{formatPrice(order.totalPrice)}</dd>
          </div>
        </dl>
      </div>

      <div className="confirmation__actions">
        <Link to={paths.profileTickets} className="button button--primary">
          My Tickets
        </Link>
        <button type="button" className="button button--glass" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
