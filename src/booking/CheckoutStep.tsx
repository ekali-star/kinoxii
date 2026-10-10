import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { useFormFields } from '../auth/useFormFields'
import { mapApiErrors } from '../auth/validation'
import { TextField } from '../components/TextField/TextField'
import { formatPrice } from '../lib/format'
import type { SeatHold } from '../types/booking'
import type { Session } from '../types/session'
import type { User } from '../types/user'
import { seatCodes, sessionShortLine, ticketSummary } from './bookingFormat'
import {
  digitsOnly,
  formatCardNumber,
  formatCvv,
  formatExpiry,
  validateCheckout,
  type CheckoutValues,
} from './checkoutValidation'

interface CheckoutStepProps {
  user: User
  session: Session
  movieTitle: string
  hold: SeatHold
  onPay: (values: CheckoutValues) => Promise<void>
}

const FIELDS: Record<string, keyof CheckoutValues> = {
  fullName: 'fullName',
  email: 'email',
  mobileNumber: 'mobileNumber',
  cardNumber: 'cardNumber',
  expiry: 'expiry',
  cvv: 'cvv',
}

export function CheckoutStep({ user, session, movieTitle, hold, onPay }: CheckoutStepProps) {
  const form = useFormFields<keyof CheckoutValues>(
    {
      fullName: user.fullName ?? '',
      email: user.email,
      mobileNumber: user.mobileNumber ?? '',
      cardNumber: '',
      expiry: '',
      cvv: '',
    },
    validateCheckout,
    { cardNumber: formatCardNumber, expiry: formatExpiry, cvv: formatCvv },
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting || !form.validateAll()) return

    setIsSubmitting(true)
    try {
      await onPay({
        ...form.values,
        fullName: form.values.fullName.trim(),
        email: form.values.email.trim(),
        mobileNumber: digitsOnly(form.values.mobileNumber),
        cardNumber: digitsOnly(form.values.cardNumber),
      })
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        form.setServerErrors(mapApiErrors(error.errors, FIELDS))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="booking-body">
      <form id="checkout-form" className="checkout-form" noValidate onSubmit={handleSubmit}>
        <TextField label="Full name" autoComplete="name" placeholder="e.g. Jane Dolidze" {...form.inputProps('fullName')} />
        <div className="checkout-form__row">
          <TextField label="Email" type="email" autoComplete="email" placeholder="e.g. jane@example.com" {...form.inputProps('email')} />
          <TextField
            label="Mobile number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="e.g. 599 123 456"
            {...form.inputProps('mobileNumber')}
          />
        </div>
        <hr className="checkout-form__divider" />
        <TextField
          label="Card number"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="e.g. 1234 4567 8901 2345"
          {...form.inputProps('cardNumber')}
        />
        <div className="checkout-form__row">
          <TextField label="Expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="e.g. 12/34" {...form.inputProps('expiry')} />
          <TextField label="CVV" inputMode="numeric" autoComplete="cc-csc" placeholder="e.g. 123" {...form.inputProps('cvv')} />
        </div>
      </form>

      <div className="booking-side">
        <h3 className="booking-side__title">Summary</h3>
        <div className="booking-summary">
          <p className="booking-summary__title">{movieTitle}</p>
          <p className="booking-summary__meta">{sessionShortLine(session)}</p>
          <dl className="booking-summary__list">
            <div>
              <dt>Seats</dt>
              <dd>{seatCodes(hold.seats.map((seat) => seat.code))}</dd>
            </div>
            <div>
              <dt>Tickets</dt>
              <dd>{ticketSummary(hold.seats.map((seat) => seat.ticketType.name))}</dd>
            </div>
          </dl>
        </div>

        <div className="booking-side__footer">
          <div className="booking-total">
            <span>Subtotal</span>
            <strong>{formatPrice(hold.subtotal)}</strong>
          </div>
          <button
            type="submit"
            form="checkout-form"
            className="button button--primary button--block"
            disabled={!form.isFilled || isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Processing payment…' : 'Pay: Complete order'}
          </button>
        </div>
      </div>
    </div>
  )
}
