import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { createOrder, getHold, holdSeats, releaseHold } from '../api/booking'
import { ApiError } from '../api/client'
import { Modal } from '../components/Modal/Modal'
import { SectionError } from '../components/SectionError/SectionError'
import { paths } from '../routes/paths'
import type { Order, Seat, SeatHold, TicketTypeSlug } from '../types/booking'
import type { User } from '../types/user'
import { BookingConfirmation } from './BookingConfirmation'
import {
  isTicketTypeBlocked,
  sessionHeadline,
  ticketPrice,
  type SelectedSeat,
} from './bookingFormat'
import { CheckoutStep } from './CheckoutStep'
import type { CheckoutValues } from './checkoutValidation'
import { holdStorage } from './holdStorage'
import { bookingKeys, useBookingSession, useFilterOptions, useSeatMap } from './queries'
import { SeatMapView, type SeatDisplayState } from './SeatMapView'
import { SeatSelectionPanel } from './SeatSelectionPanel'
import { formatCountdown, useCountdown } from './useCountdown'
import './Booking.css'

type Step = 'seats' | 'checkout' | 'done'

interface Notice {
  tone: 'error' | 'warning'
  text: string
}

const EXPIRED_MESSAGE = 'Your hold time expired. Please re-select your seats.'

function holdToSelection(hold: SeatHold): SelectedSeat[] {
  return hold.seats.map((seat) => ({
    seatId: seat.seatId,
    code: seat.code,
    ticketType: seat.ticketType.slug,
  }))
}

function matchesHold(hold: SeatHold | null, selection: SelectedSeat[]) {
  if (!hold || hold.seats.length !== selection.length) return false
  return selection.every((seat) =>
    hold.seats.some((held) => held.seatId === seat.seatId && held.ticketType.slug === seat.ticketType),
  )
}

function listCodes(codes: string[]) {
  if (codes.length <= 1) return codes.join('')
  return `${codes.slice(0, -1).join(', ')} and ${codes.at(-1)}`
}

interface BookingDialogProps {
  sessionId: number
  user: User
  onClose: () => void
}

export function BookingDialog({ sessionId, user, onClose }: BookingDialogProps) {
  const queryClient = useQueryClient()
  const sessionQuery = useBookingSession(sessionId)
  const mapQuery = useSeatMap(sessionId)
  const optionsQuery = useFilterOptions()

  const [step, setStep] = useState<Step>('seats')
  const [selection, setSelection] = useState<SelectedSeat[]>([])
  const [hold, setHold] = useState<SeatHold | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [lostCodes, setLostCodes] = useState<string[]>([])
  const [order, setOrder] = useState<Order | null>(null)
  const [isRestoring, setIsRestoring] = useState(() => holdStorage.get(sessionId) !== null)

  const holdMutation = useMutation({
    mutationFn: (seats: SelectedSeat[]) =>
      holdSeats(sessionId, {
        seats: seats.map(({ seatId, ticketType }) => ({ seatId, ticketType })),
      }),
  })
  const orderMutation = useMutation({ mutationFn: createOrder })

  const resetToSeats = (message: string) => {
    setHold(null)
    holdStorage.clear(sessionId)
    setSelection([])
    setStep('seats')
    setNotice({ tone: 'warning', text: message })
    mapQuery.refetch()
  }

  const secondsLeft = useCountdown(step === 'done' ? null : (hold?.expiresAt ?? null), () =>
    resetToSeats(EXPIRED_MESSAGE),
  )

  useEffect(() => {
    const holdId = holdStorage.get(sessionId)
    if (!holdId) return
    const controller = new AbortController()
    getHold(holdId, controller.signal)
      .then((restored) => {
        if (restored.isLive) {
          setHold(restored)
          setSelection(holdToSelection(restored))
          setStep('checkout')
        } else {
          holdStorage.clear(sessionId)
          setNotice({ tone: 'warning', text: EXPIRED_MESSAGE })
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) holdStorage.clear(sessionId)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsRestoring(false)
      })
    return () => controller.abort()
  }, [sessionId])

  const session = sessionQuery.data
  const movie = session?.movie
  const options = optionsQuery.data
  const map = mapQuery.data

  const recoverContested = (error: ApiError) => {
    const codes = error.contested
    setLostCodes((current) => [...new Set([...current, ...codes])])
    setSelection((current) => current.filter((seat) => !codes.includes(seat.code)))
    setHold(null)
    holdStorage.clear(sessionId)
    setStep('seats')
    setNotice({
      tone: 'error',
      text:
        codes.length > 0
          ? `Seat${codes.length > 1 ? 's' : ''} ${listCodes(codes)} ${codes.length > 1 ? 'were' : 'was'} just taken by someone else. We kept the rest of your selection.`
          : error.message,
    })
    mapQuery.refetch()
  }

  const showError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 409) {
      recoverContested(error)
    } else if (error instanceof ApiError && error.errors) {
      setNotice({ tone: 'error', text: Object.values(error.errors).flat().join(' ') })
    } else if (error instanceof ApiError && !error.isUnauthenticated) {
      setNotice({ tone: 'error', text: error.message })
    } else if (!(error instanceof ApiError)) {
      setNotice({ tone: 'error', text: 'Something went wrong. Please try again.' })
    }
  }

  if (sessionQuery.isError || mapQuery.isError || optionsQuery.isError) {
    const notFound = sessionQuery.error instanceof ApiError && sessionQuery.error.status === 404
    return (
      <Modal title="Book tickets" size="md" onClose={onClose} closeOnBackdropClick={false}>
        {notFound ? (
          <p className="booking-message">This session doesn't exist anymore.</p>
        ) : (
          <SectionError
            message="Couldn't load this session."
            onRetry={() => {
              sessionQuery.refetch()
              mapQuery.refetch()
              optionsQuery.refetch()
            }}
          />
        )}
      </Modal>
    )
  }

  if (!session || !map || !options || isRestoring) {
    return (
      <Modal title="Book tickets" size="lg" onClose={onClose} closeOnBackdropClick={false}>
        <div className="booking-loading" aria-busy="true">
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
      </Modal>
    )
  }

  const minAge = movie?.ageRating.minAge ?? 0
  const ratingCode = movie?.ageRating.code ?? ''
  const ticketTypes = options.ticketTypes
  const typeFor = (slug: TicketTypeSlug) => ticketTypes.find((type) => type.slug === slug)
  const isSelected = (seat: Seat) => selection.some((item) => item.seatId === seat.id)

  const isUnderage = user.age !== null && user.age < minAge
  const hasBlockedTicket = selection.some((seat) => isTicketTypeBlocked(typeFor(seat.ticketType), minAge))
  const subtotal = selection.reduce(
    (sum, seat) => sum + ticketPrice(session.price, typeFor(seat.ticketType)),
    0,
  )
  const canContinue =
    selection.length > 0 && user.profileComplete && !isUnderage && !hasBlockedTicket

  const displayState = (seat: Seat): SeatDisplayState => {
    if (seat.state === 'unavailable') return 'unavailable'
    if (lostCodes.includes(seat.code)) return 'sold'
    if (isSelected(seat)) return 'selected'
    if (seat.isMine) return 'available'
    return seat.state
  }

  const toggleSeat = (seat: Seat) => {
    if (isSelected(seat)) {
      setSelection((current) => current.filter((item) => item.seatId !== seat.id))
      return
    }
    if (selection.length >= options.maxSeatsPerOrder) {
      setNotice({
        tone: 'error',
        text: `You can select up to ${options.maxSeatsPerOrder} seats per order.`,
      })
      return
    }
    setNotice(null)
    setSelection((current) => [...current, { seatId: seat.id, code: seat.code, ticketType: 'adult' }])
  }

  const changeType = (seatId: number, ticketType: TicketTypeSlug) => {
    setSelection((current) =>
      current.map((seat) => (seat.seatId === seatId ? { ...seat, ticketType } : seat)),
    )
  }

  const goToCheckout = async () => {
    if (matchesHold(hold, selection)) {
      setStep('checkout')
      return
    }
    setNotice(null)
    try {
      const created = await holdMutation.mutateAsync(selection)
      setHold(created)
      holdStorage.set(sessionId, created.holdId)
      setStep('checkout')
    } catch (error) {
      showError(error)
    }
  }

  const pay = async (values: CheckoutValues) => {
    if (!hold) return
    setNotice(null)
    try {
      const paid = await orderMutation.mutateAsync({ holdId: hold.holdId, ...values })
      setOrder(paid)
      setHold(null)
      holdStorage.clear(sessionId)
      setStep('done')
      queryClient.invalidateQueries({ queryKey: bookingKeys.seats(sessionId) })
      queryClient.invalidateQueries({ queryKey: ['movies', 'sessions'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    } catch (error) {
      if (error instanceof ApiError && error.errors) throw error
      if (error instanceof ApiError && error.status === 422) {
        resetToSeats(error.message || EXPIRED_MESSAGE)
        return
      }
      showError(error)
    }
  }

  const close = () => {
    if (hold && step !== 'done') {
      releaseHold(hold.holdId).catch(() => {})
      holdStorage.clear(sessionId)
    }
    onClose()
  }

  const timer =
    hold && secondsLeft !== null && step !== 'done' ? (
      <div className="hold-timer" role="timer" data-urgent={secondsLeft <= 60}>
        <span>Seats held</span>
        <strong>{formatCountdown(secondsLeft)}</strong>
      </div>
    ) : null

  const title = movie?.title ?? 'Book tickets'

  if (step === 'done' && order) {
    return (
      <Modal title="Booking confirmed" size="md" hideHeader onClose={onClose} closeOnBackdropClick={false}>
        <BookingConfirmation
          order={order}
          movieTitle={order.session.movie?.title ?? title}
          posterUrl={order.session.movie?.posterUrl ?? movie?.posterUrl ?? null}
          onClose={onClose}
        />
      </Modal>
    )
  }

  const checkoutAvailable = matchesHold(hold, selection)

  return (
    <Modal
      title={title}
      subtitle={sessionHeadline(session)}
      size="lg"
      headerAside={timer}
      onClose={close}
      closeOnBackdropClick={false}
    >
      <div className="booking">
        <div className="booking-steps" role="group" aria-label="Booking steps">
          <button
            type="button"
            className="booking-steps__step"
            aria-current={step === 'seats' ? 'step' : undefined}
            onClick={() => setStep('seats')}
          >
            Seats
          </button>
          <button
            type="button"
            className="booking-steps__step"
            aria-current={step === 'checkout' ? 'step' : undefined}
            disabled={!checkoutAvailable}
            onClick={() => setStep('checkout')}
          >
            Checkout
          </button>
        </div>

        {notice && (
          <p className={`booking-notice booking-notice--${notice.tone}`} role="alert">
            {notice.text}
          </p>
        )}

        {step === 'seats' && !user.profileComplete && (
          <p className="booking-notice booking-notice--warning" role="note">
            Please complete your profile to enable booking. We need your full name, mobile
            number and date of birth.{' '}
            <Link to={paths.profile} className="link-button">
              Complete profile
            </Link>
          </p>
        )}

        {step === 'seats' && isUnderage && (
          <p className="booking-notice booking-notice--error" role="note">
            This film is rated {ratingCode}. You cannot buy tickets for it with this account.
          </p>
        )}

        {step === 'checkout' && hold ? (
          <CheckoutStep
            user={user}
            session={session}
            movieTitle={title}
            hold={hold}
            onPay={pay}
          />
        ) : (
          <div className="booking-body">
            <SeatMapView map={map} displayState={displayState} onToggle={toggleSeat} />
            <SeatSelectionPanel
              selection={selection}
              ticketTypes={ticketTypes}
              sessionPrice={session.price}
              minAge={minAge}
              ratingCode={ratingCode}
              maxSeats={options.maxSeatsPerOrder}
              subtotal={subtotal}
              canContinue={canContinue}
              isPending={holdMutation.isPending}
              onChangeType={changeType}
              onRemove={(seatId) =>
                setSelection((current) => current.filter((seat) => seat.seatId !== seatId))
              }
              onNext={goToCheckout}
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
