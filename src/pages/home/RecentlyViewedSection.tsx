import { Link } from 'react-router'
import { AgeBadge } from '../../components/AgeBadge/AgeBadge'
import { Section } from '../../components/Section/Section'
import { movieMeta } from '../../lib/format'
import { useRecentlyViewed } from '../../movies/recentlyViewed'
import { paths } from '../../routes/paths'
import './MovieCards.css'

export function RecentlyViewedSection() {
  const movies = useRecentlyViewed()

  if (movies.length === 0) return null

  return (
    <Section title="Recently viewed" variant="plain">
      <div className="scroll-row">
        {movies.map((movie) => (
          <Link key={movie.slug} to={paths.movie(movie.slug)} className="recent-card">
            <span className="recent-card__image">
              {(movie.backdropUrl ?? movie.posterUrl) && (
                <img src={movie.backdropUrl ?? movie.posterUrl ?? ''} alt="" loading="lazy" />
              )}
            </span>
            <span className="recent-card__body">
              <span className="recent-card__title">{movie.title}</span>
              <span className="movie-card__meta">
                {movieMeta(movie.genre ? [{ name: movie.genre }] : [], movie.runtimeMinutes)}
              </span>
              <AgeBadge rating={movie.ageRating} />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  )
}
