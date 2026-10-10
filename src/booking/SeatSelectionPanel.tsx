import { CloseIcon } from '../components/icons'
import { formatPrice } from '../lib/format'
import type { TicketTypeSlug } from '../types/booking'
import type { TicketType } from '../types/filters'
import { isTicketTypeBlocked, ticketPrice, type SelectedSeat } from './bookingFormat'

interface SeatSelectionPanelProps {
  selection: SelectedSeat[]
  ticketTypes: TicketType[]
  sessionPrice: number
  minAge: number
  ratingCode: string
  maxSeats: number
  subtotal: number
  canContinue: boolean
  isPending: boolean
  onChangeType: (seatId: number, ticketType: TicketTypeSlug) => void
  onRemove: (seatId: number) => void
  onNext: () => void
}

const ORDER: TicketTypeSlug[] = ['child', 'student', 'adult']

export function SeatSelectionPanel({
  selection,
  ticketTypes,
  sessionPrice,
  minAge,
  ratingCode,
  maxSeats,
  subtotal,
  canContinue,
  isPending,
  onChangeType,
  onRemove,
  onNext,
}: SeatSelectionPanelProps) {
  const types = [...ticketTypes].sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug))

  return (
    <div className="booking-side">
      <h3 className="booking-side__title">Your seats · Max {maxSeats}</h3>

      {selection.length === 0 ? (
        <p className="booking-side__hint">
          Pick up to {maxSeats} seats from the map. Each seat can carry its own ticket type.
        </p>
      ) : (
        <ul className="seat-cards">
          {selection.map((seat) => {
            const type = types.find((item) => item.slug === seat.ticketType)
            const blocked = isTicketTypeBlocked(type, minAge)
            return (
              <li key={seat.seatId} className="seat-card" data-invalid={blocked}>
                <div className="seat-card__top">
                  <span className="seat-card__seat">
                    Seat <strong>{seat.code}</strong>
                  </span>
                  <span className="seat-card__price">
                    {formatPrice(ticketPrice(sessionPrice, type))}
                  </span>
                  <button
                    type="button"
                    className="seat-card__remove"
                    aria-label={`Remove seat ${seat.code}`}
                    onClick={() => onRemove(seat.seatId)}
                  >
                    <CloseIcon size={14} />
                  </button>
                </div>
                <div className="ticket-types" role="group" aria-label={`Ticket type for ${seat.code}`}>
                  {types.map((option) => {
                    const optionBlocked = isTicketTypeBlocked(option, minAge)
                    return (
                      <button
                        key={option.slug}
                        type="button"
                        className="ticket-types__option"
                        aria-pressed={option.slug === seat.ticketType}
                        disabled={optionBlocked}
                        title={option.note ?? undefined}
                        onClick={() => onChangeType(seat.seatId, option.slug)}
                      >
                        {option.name} {Math.round(option.priceRatio * 100)}%
                      </button>
                    )
                  })}
                </div>
                {blocked && (
                  <p className="field__error">
                    {type?.name} tickets aren't available for {ratingCode} films.
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <div className="booking-side__footer">
        <div className="booking-total">
          <span>Subtotal</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
        <button
          type="button"
          className="button button--primary button--block"
          disabled={!canContinue || isPending}
          onClick={onNext}
        >
          {isPending ? 'Holding seats…' : 'Next: Checkout'}
        </button>
      </div>
    </div>
  )
}
