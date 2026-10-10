import { useEffect } from 'react'
import { useParams } from 'react-router'
import { useMovie } from '../movies/queries'
import { addRecentlyViewed } from '../movies/recentlyViewed'

export function MovieDetailsPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: movie, isError } = useMovie(slug)

  useEffect(() => {
    if (movie) addRecentlyViewed(movie)
  }, [movie])

  return (
    <section className="page">
      <h1 className="page__title">{movie?.title ?? (isError ? 'Film not found' : '')}</h1>
    </section>
  )
}
