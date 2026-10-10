import { Link } from 'react-router'
import { AgeBadge } from '../../components/AgeBadge/AgeBadge'
import { Section } from '../../components/Section/Section'
import { formatPrice, movieMeta } from '../../lib/format'
import { useNowPlayingMovies } from '../../movies/queries'
import { paths } from '../../routes/paths'
import type { Movie } from '../../types/movie'
import { SectionError } from './SectionError'
import './MovieCards.css'

const LIMIT = 12

function NowPlayingCard({ movie }: { movie: Movie }) {
  const to = paths.movie(movie.slug)

  return (
    <article className="movie-card">
      <Link to={to} className="movie-card__poster" tabIndex={-1} aria-hidden="true">
        {movie.posterUrl && <img src={movie.posterUrl} alt="" loading="lazy" />}
      </Link>
      <h3 className="movie-card__title">
        <Link to={to}>{movie.title}</Link>
      </h3>
      <p className="movie-card__meta">{movieMeta(movie.genres, movie.runtimeMinutes)}</p>
      <AgeBadge rating={movie.ageRating} />
      <div className="movie-card__footer">
        <span className="movie-card__price">From {formatPrice(movie.fromPrice)}</span>
        <Link to={to} className="button button--primary button--sm" aria-label={`Buy ticket for ${movie.title}`}>
          Buy Ticket
        </Link>
      </div>
    </article>
  )
}

export function NowPlayingSection() {
  const { data: movies, isPending, isError, refetch } = useNowPlayingMovies(LIMIT)

  return (
    <Section title="Now Playing" seeAllTo={paths.sessions}>
      {isError ? (
        <SectionError message="Couldn't load the films now playing." onRetry={refetch} />
      ) : (
        <div className="scroll-row">
          {isPending
            ? Array.from({ length: 7 }, (_, i) => <div key={i} className="movie-card skeleton" />)
            : movies.map((movie) => <NowPlayingCard key={movie.id} movie={movie} />)}
        </div>
      )}
    </Section>
  )
}
