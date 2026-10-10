import { Link } from 'react-router'
import { AgeBadge } from '../../components/AgeBadge/AgeBadge'
import { TicketIcon } from '../../components/icons'
import { formatPrice, formatRuntime } from '../../lib/format'
import { paths } from '../../routes/paths'
import type { Session, SessionGroup } from '../../types/session'

const LOW_SEATS = 10

interface SessionCardProps {
  session: Session
  onSelect: (session: Session) => void
}

function SessionCard({ session, onSelect }: SessionCardProps) {
  const seatsLabel = session.isSoldOut ? 'Sold out' : `${session.seatsLeft} left`
  const place = `${session.venue.name} · Hall ${session.hall.name}`

  return (
    <li>
      <button
        type="button"
        className="session-card"
        disabled={session.isSoldOut}
        data-low={!session.isSoldOut && session.seatsLeft <= LOW_SEATS}
        aria-label={`${session.time}, ${place}, ${session.format.name}, ${session.language.name}, from ${formatPrice(session.price)}, ${seatsLabel}`}
        onClick={() => onSelect(session)}
      >
        <span className="session-card__row">
          <span className="session-card__time">{session.time}</span>
          <span className="session-card__format">{session.format.name}</span>
        </span>
        <span className="session-card__row">
          <span className="session-card__language">{session.language.name}</span>
          <span className="session-card__seats">
            {!session.isSoldOut && <TicketIcon size={14} />}
            {seatsLabel}
          </span>
        </span>
        <span className="session-card__row">
          <span className="session-card__place">{place}</span>
          <span className="session-card__price">
            <small>from</small> {formatPrice(session.price)}
          </span>
        </span>
      </button>
    </li>
  )
}

interface SessionGroupListProps {
  groups: SessionGroup[]
  onSelect: (session: Session) => void
}

export function SessionGroupList({ groups, onSelect }: SessionGroupListProps) {
  return (
    <ol className="session-groups">
      {groups.map(({ movie, sessions }) => (
        <li key={movie.id} className="session-group">
          <div className="session-group__movie">
            <Link to={paths.movie(movie.slug)} className="session-group__poster" tabIndex={-1}>
              {movie.posterUrl && <img src={movie.posterUrl} alt="" loading="lazy" />}
            </Link>
            <div>
              <h2 className="session-group__title">
                <Link to={paths.movie(movie.slug)}>{movie.title}</Link>
                <AgeBadge rating={movie.ageRating} />
              </h2>
              <p className="session-group__runtime">{formatRuntime(movie.runtimeMinutes)}</p>
            </div>
          </div>
          <ul className="session-group__sessions" aria-label={`${movie.title} sessions`}>
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} onSelect={onSelect} />
            ))}
          </ul>
        </li>
      ))}
    </ol>
  )
}
