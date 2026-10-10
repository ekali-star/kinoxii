import { AgeBadge } from '../../components/AgeBadge/AgeBadge'
import { ClockIcon } from '../../components/icons'
import type { MovieDetail } from '../../types/movie'

export function MovieHero({ movie }: { movie: MovieDetail }) {
  return (
    <section className="movie-hero">
      {movie.backdropUrl && (
        <img src={movie.backdropUrl} alt="" className="movie-hero__backdrop" fetchPriority="high" />
      )}
      <div className="movie-hero__inner">
        {movie.posterUrl && (
          <img src={movie.posterUrl} alt={`${movie.title} poster`} className="movie-hero__poster" />
        )}
        <div className="movie-hero__content">
          <span className="tag">{movie.isComingSoon ? 'Coming soon' : 'Now playing'}</span>
          <h1 className="movie-hero__title">{movie.title}</h1>
          <p className="movie-hero__synopsis">{movie.synopsis}</p>
          <ul className="chip-list">
            <li>
              <AgeBadge rating={movie.ageRating} />
            </li>
            <li className="chip">
              <ClockIcon size={14} />
              {movie.runtimeMinutes} Min
            </li>
            {movie.formats.map((format) => (
              <li key={format.id} className="chip">
                {format.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
