import { useState } from 'react'
import { Link } from 'react-router'
import { AgeBadge } from '../../components/AgeBadge/AgeBadge'
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, TicketIcon } from '../../components/icons'
import { formatDayMonthShort } from '../../lib/format'
import { useFeaturedMovies } from '../../movies/queries'
import { paths } from '../../routes/paths'
import './HeroCarousel.css'

export function HeroCarousel() {
  const { data: movies, isPending, isError, refetch } = useFeaturedMovies()
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  if (isPending) return <section className="hero hero--placeholder" aria-busy="true" />

  if (isError || movies.length === 0) {
    return (
      <section className="hero hero--placeholder">
        <div className="hero__content">
          <h1 className="hero__title">Kino XII</h1>
          {isError && (
            <button type="button" className="button button--glass" onClick={() => refetch()}>
              Retry loading featured films
            </button>
          )}
        </div>
      </section>
    )
  }

  const count = movies.length
  const activeIndex = index % count
  const active = movies[activeIndex]
  const goTo = (next: number) => setIndex((next + count) % count)

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Featured films"
      data-paused={isPaused}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false)
      }}
    >
      <div className="hero__backdrops" aria-hidden="true">
        {movies.map((movie, i) =>
          movie.backdropUrl ? (
            <img
              key={movie.id}
              src={movie.backdropUrl}
              alt=""
              className="hero__backdrop"
              data-active={i === activeIndex}
              fetchPriority={i === 0 ? 'high' : 'low'}
            />
          ) : null,
        )}
      </div>

      <div className="hero__content" key={active.id}>
        <span className="tag">Premiere · Week of {formatDayMonthShort(active.releaseDate)}</span>
        <h1 className="hero__title">{active.title}</h1>
        <ul className="chip-list">
          <li>
            <AgeBadge rating={active.ageRating} />
          </li>
          <li className="chip">
            <ClockIcon size={14} />
            {active.runtimeMinutes} Min
          </li>
          {active.formats.map((format) => (
            <li key={format.id} className="chip">
              {format.name}
            </li>
          ))}
        </ul>
        <p className="hero__synopsis">{active.synopsis}</p>
        <div className="hero__actions">
          <Link to={paths.movie(active.slug)} className="button button--primary">
            <TicketIcon size={18} />
            Buy tickets
          </Link>
          <Link to={paths.sessions} className="button button--glass">
            All sessions
          </Link>
        </div>
      </div>

      <div className="hero__controls">
        <div className="hero__progress">
          {movies.map((movie, i) => (
            <button
              key={movie.id}
              type="button"
              className="hero__bar"
              data-active={i === activeIndex}
              aria-label={`Show ${movie.title}`}
              aria-current={i === activeIndex}
              onClick={() => goTo(i)}
            >
              <span
                className="hero__bar-fill"
                onAnimationEnd={i === activeIndex ? () => goTo(activeIndex + 1) : undefined}
              />
            </button>
          ))}
        </div>
        <div className="hero__arrows">
          <button
            type="button"
            className="hero__arrow"
            aria-label="Previous film"
            onClick={() => goTo(activeIndex - 1)}
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            className="hero__arrow"
            aria-label="Next film"
            onClick={() => goTo(activeIndex + 1)}
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </section>
  )
}
