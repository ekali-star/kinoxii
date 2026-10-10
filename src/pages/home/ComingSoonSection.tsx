import { AgeBadge } from '../../components/AgeBadge/AgeBadge'
import { Section } from '../../components/Section/Section'
import { BellIcon, CheckIcon } from '../../components/icons'
import { useAuthModal } from '../../auth/useAuthModal'
import { formatDayMonthLong, movieMeta } from '../../lib/format'
import { useComingSoonMovies, useNotifyMe } from '../../movies/queries'
import { paths } from '../../routes/paths'
import type { Movie } from '../../types/movie'
import { SectionError } from '../../components/SectionError/SectionError'
import './MovieCards.css'

function ComingSoonCard({ movie }: { movie: Movie }) {
  const { requireAuth } = useAuthModal()
  const notify = useNotifyMe()
  const isPending = notify.isPending && notify.variables === movie.slug

  const handleNotify = () => {
    requireAuth(() => notify.mutateAsync(movie.slug)).catch(() => {})
  }

  return (
    <article className="soon-card">
      <div className="soon-card__image">
        {(movie.backdropUrl ?? movie.posterUrl) && (
          <img src={movie.backdropUrl ?? movie.posterUrl ?? ''} alt="" loading="lazy" />
        )}
      </div>
      <div className="soon-card__body">
        <p className="soon-card__release">In cinemas {formatDayMonthLong(movie.releaseDate)}</p>
        <h3 className="soon-card__title">{movie.title}</h3>
        <p className="movie-card__meta">{movieMeta(movie.genres, movie.runtimeMinutes)}</p>
        <AgeBadge rating={movie.ageRating} />
        {movie.isNotified ? (
          <span className="notify-button notify-button--done">
            <CheckIcon size={16} />
            We'll notify you
          </span>
        ) : (
          <button
            type="button"
            className="notify-button"
            disabled={isPending}
            onClick={handleNotify}
            aria-label={`Notify me when ${movie.title} opens`}
          >
            <BellIcon size={16} />
            Notify Me
          </button>
        )}
        {notify.isError && notify.variables === movie.slug && (
          <p className="field__error" role="alert">
            Couldn't subscribe. Please try again.
          </p>
        )}
      </div>
    </article>
  )
}

export function ComingSoonSection() {
  const { data: movies, isPending, isError, refetch } = useComingSoonMovies()

  if (!isPending && !isError && movies.length === 0) return null

  return (
    <Section title="Coming Soon" seeAllTo={paths.sessions}>
      {isError ? (
        <SectionError message="Couldn't load the upcoming films." onRetry={refetch} />
      ) : (
        <div className="scroll-row">
          {isPending
            ? Array.from({ length: 4 }, (_, i) => <div key={i} className="soon-card skeleton" />)
            : movies.map((movie) => <ComingSoonCard key={movie.id} movie={movie} />)}
        </div>
      )}
    </Section>
  )
}
