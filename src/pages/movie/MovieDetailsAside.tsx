import { formatLongDate, formatPrice } from '../../lib/format'
import type { MovieDetail } from '../../types/movie'

export function MovieDetailsAside({ movie }: { movie: MovieDetail }) {
  const rows = [
    { label: 'Genre', value: movie.genres.map((genre) => genre.name).join(', ') },
    { label: 'Director', value: movie.director },
    { label: 'Main cast', value: movie.cast },
    { label: 'Duration', value: `${movie.runtimeMinutes} minutes` },
    { label: 'Release date', value: formatLongDate(movie.releaseDate) },
    { label: 'Formats', value: movie.formats.map((format) => format.name).join(', ') },
    { label: 'From', value: movie.isComingSoon ? null : formatPrice(movie.fromPrice) },
  ].filter((row) => row.value)

  return (
    <aside className="movie-aside" aria-labelledby="movie-details-heading">
      <h2 id="movie-details-heading" className="movie-section-title">
        Details
      </h2>
      <dl className="movie-aside__list">
        {rows.map((row) => (
          <div key={row.label} className="movie-aside__row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="rating-note">
        <p className="rating-note__title">Rating note</p>
        <p className="rating-note__body">
          <strong>{movie.ageRating.code}</strong> {movie.ageRating.description}
        </p>
      </div>
    </aside>
  )
}
