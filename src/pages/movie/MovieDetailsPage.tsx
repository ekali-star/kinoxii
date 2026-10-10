import { useEffect } from 'react'
import { useParams } from 'react-router'
import { ApiError } from '../../api/client'
import { SectionError } from '../../components/SectionError/SectionError'
import { useMovie } from '../../movies/queries'
import { addRecentlyViewed } from '../../movies/recentlyViewed'
import { NotFoundPage } from '../NotFoundPage'
import { MovieDetailsAside } from './MovieDetailsAside'
import { MovieHero } from './MovieHero'
import { MovieSessions } from './MovieSessions'
import './MovieDetailsPage.css'

export function MovieDetailsPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: movie, isPending, error, refetch } = useMovie(slug)

  useEffect(() => {
    if (movie) addRecentlyViewed(movie)
  }, [movie])

  useEffect(() => {
    if (movie) document.title = `${movie.title} · Kino XII`
    return () => {
      document.title = 'Kino XII'
    }
  }, [movie])

  if (error instanceof ApiError && error.status === 404) return <NotFoundPage />

  if (error) {
    return (
      <section className="page page--centered">
        <SectionError message="Couldn't load this film." onRetry={refetch} />
      </section>
    )
  }

  if (isPending) {
    return (
      <div className="movie-page" aria-busy="true">
        <div className="movie-hero movie-hero--placeholder" />
      </div>
    )
  }

  return (
    <div className="movie-page">
      <MovieHero movie={movie} />
      <div className="movie-page__body">
        <MovieSessions movie={movie} />
        <MovieDetailsAside movie={movie} />
      </div>
    </div>
  )
}
