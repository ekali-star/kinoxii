import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { useAuthModal } from '../../auth/useAuthModal'
import { DayPicker } from '../../components/DayPicker/DayPicker'
import { BellIcon, CheckIcon, TicketIcon } from '../../components/icons'
import { formatLongDate, formatPrice, nextDays, toISODate } from '../../lib/format'
import { useMovieSessions, useNotifyMe } from '../../movies/queries'
import type { MovieDetail } from '../../types/movie'
import type { Session } from '../../types/session'
import { SectionError } from '../../components/SectionError/SectionError'

const DAYS_SHOWN = 7
const LOW_SEATS = 10

function groupByHall(sessions: Session[]) {
  const halls = new Map<number, { name: string; sessions: Session[] }>()
  for (const session of [...sessions].sort((a, b) => a.startsAt.localeCompare(b.startsAt))) {
    const hall = halls.get(session.hall.id) ?? { name: session.hall.name, sessions: [] }
    hall.sessions.push(session)
    halls.set(session.hall.id, hall)
  }
  return [...halls.entries()]
    .sort(([, a], [, b]) => a.name.localeCompare(b.name))
    .map(([id, hall]) => ({ id, ...hall }))
}

interface SessionTicketProps {
  session: Session
  disabled: boolean
  onSelect: (session: Session) => void
}

function SessionTicket({ session, disabled, onSelect }: SessionTicketProps) {
  const seatsLabel = session.isSoldOut ? 'Sold out' : `${session.seatsLeft} left`

  return (
    <button
      type="button"
      className="session-ticket"
      disabled={disabled || session.isSoldOut}
      data-low={!session.isSoldOut && session.seatsLeft <= LOW_SEATS}
      aria-label={`${session.time}, hall ${session.hall.name}, ${session.format.name}, ${session.language.name}, ${formatPrice(session.price)}, ${seatsLabel}`}
      onClick={() => onSelect(session)}
    >
      <span className="session-ticket__main">
        <span className="session-ticket__time">{session.time}</span>
        <span className="session-ticket__tags">
          <span title={session.language.name}>{session.language.code}</span>
          <span className="session-ticket__format">{session.format.name}</span>
        </span>
      </span>
      <span className="session-ticket__stub">
        <span className="session-ticket__price">{formatPrice(session.price)}</span>
        <span className="session-ticket__seats">
          <TicketIcon size={12} />
          {seatsLabel}
        </span>
      </span>
    </button>
  )
}

function ComingSoonNotice({ movie }: { movie: MovieDetail }) {
  const { requireAuth } = useAuthModal()
  const notify = useNotifyMe()

  const isUpcoming = movie.releaseDate >= toISODate(new Date())

  return (
    <div className="movie-notice">
      <p>
        {isUpcoming
          ? `Sessions open when ${movie.title} arrives in cinemas on ${formatLongDate(movie.releaseDate)}.`
          : `Sessions for ${movie.title} haven't been scheduled yet.`}
      </p>
      {movie.isNotified ? (
        <span className="notify-button notify-button--done">
          <CheckIcon size={16} />
          We'll notify you
        </span>
      ) : (
        <button
          type="button"
          className="notify-button"
          disabled={notify.isPending}
          onClick={() => requireAuth(() => notify.mutateAsync(movie.slug)).catch(() => {})}
        >
          <BellIcon size={16} />
          Notify Me
        </button>
      )}
    </div>
  )
}

export function MovieSessions({ movie }: { movie: MovieDetail }) {
  const { user } = useAuth()
  const { requireAuth } = useAuthModal()
  const [searchParams, setSearchParams] = useSearchParams()
  const days = useMemo(() => nextDays(DAYS_SHOWN), [])
  const available = useMemo(() => new Set(movie.availableDates), [movie.availableDates])

  const requested = searchParams.get('date')
  const fallback = days.find((day) => available.has(day.iso))?.iso ?? null
  const selectedDate =
    requested && days.some((day) => day.iso === requested) && available.has(requested)
      ? requested
      : fallback

  const { data: venues, isPending, isError, refetch } = useMovieSessions(movie.slug, selectedDate)

  const isRestricted = user?.age != null && user.age < movie.ageRating.minAge

  const selectDate = (iso: string) => {
    setSearchParams(
      (params) => {
        params.set('date', iso)
        params.delete('session')
        return params
      },
      { replace: true, preventScrollReset: true },
    )
  }

  const selectSession = (session: Session) => {
    requireAuth(() =>
      setSearchParams(
        (params) => {
          params.set('date', session.date)
          params.set('session', String(session.id))
          return params
        },
        { preventScrollReset: true },
      ),
    )
  }

  return (
    <section className="movie-sessions" aria-labelledby="movie-sessions-heading">
      <h2 id="movie-sessions-heading" className="movie-section-title">
        Sessions
      </h2>

      {movie.isComingSoon ? (
        <ComingSoonNotice movie={movie} />
      ) : (
        <>
          <DayPicker
            days={days}
            selected={selectedDate}
            isAvailable={(iso) => available.has(iso)}
            onSelect={selectDate}
          />

          {isRestricted && (
            <p className="movie-restriction" role="note">
              This film is rated {movie.ageRating.code}. You cannot buy tickets for it with this
              account.
            </p>
          )}

          {selectedDate === null ? (
            <p className="movie-notice">There are no sessions for this film in the next 7 days.</p>
          ) : isError ? (
            <SectionError message="Couldn't load the sessions." onRetry={refetch} />
          ) : isPending ? (
            <div className="venue-group">
              <div className="hall-group skeleton movie-sessions__skeleton" />
            </div>
          ) : venues.length === 0 ? (
            <p className="movie-notice">
              No sessions on {formatLongDate(selectedDate)}. Try another date.
            </p>
          ) : (
            venues.map(({ venue, sessions }) => (
              <div key={venue.id} className="venue-group">
                <h3 className="venue-group__name">{venue.name}</h3>
                <div className="venue-group__halls">
                  {groupByHall(sessions).map((hall) => (
                    <div key={hall.id} className="hall-group">
                      <p className="hall-group__name">Hall {hall.name}</p>
                      <div className="hall-group__sessions">
                        {hall.sessions.map((session) => (
                          <SessionTicket
                            key={session.id}
                            session={session}
                            disabled={isRestricted}
                            onSelect={selectSession}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </section>
  )
}
