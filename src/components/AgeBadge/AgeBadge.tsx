import type { AgeRating } from '../../types/movie'
import './AgeBadge.css'

export function AgeBadge({ rating }: { rating: AgeRating }) {
  return (
    <span className="age-badge" title={rating.description} aria-label={`Rated ${rating.code}`}>
      {rating.code}
    </span>
  )
}
