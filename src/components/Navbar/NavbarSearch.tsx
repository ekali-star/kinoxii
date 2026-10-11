import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { formatPrice, formatRuntime } from '../../lib/format'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { useMovieSearch } from '../../movies/queries'
import { paths } from '../../routes/paths'
import type { Movie } from '../../types/movie'
import { CloseIcon, PopcornIcon, SearchIcon } from '../icons'

const DEBOUNCE_MS = 250

function highlight(title: string, query: string) {
  const index = title.toLowerCase().indexOf(query.toLowerCase())
  if (!query || index === -1) return title
  return (
    <>
      {title.slice(0, index)}
      <strong>{title.slice(index, index + query.length)}</strong>
      {title.slice(index + query.length)}
    </>
  )
}

function movieMetaLine(movie: Movie) {
  const kind = movie.kind === 'event' ? 'Live event' : 'Film'
  return `${kind} · ${movie.ageRating.code} · ${formatRuntime(movie.runtimeMinutes)}`
}

interface SearchMessageProps {
  icon: ReactNode
  title: string
  text: string
  onBrowse: () => void
}

function SearchMessage({ icon, title, text, onBrowse }: SearchMessageProps) {
  return (
    <div className="search-panel__message">
      <span className="search-panel__icon">{icon}</span>
      <p className="search-panel__title">{title}</p>
      <p className="search-panel__text">{text}</p>
      <Link to={paths.sessions} className="button search-panel__browse" onClick={onBrowse}>
        Browse all sessions
      </Link>
    </div>
  )
}

export function NavbarSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const trimmed = query.trim()
  const debounced = useDebouncedValue(trimmed, DEBOUNCE_MS)
  const search = useMovieSearch(debounced)
  const isSettled = debounced === trimmed && !search.isFetching
  const results = trimmed && search.data ? search.data : []
  const optionId = (index: number) => `${listId}-option-${index}`

  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
        setIsExpanded(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  useEffect(() => {
    if (isExpanded) inputRef.current?.focus()
  }, [isExpanded])

  const reset = () => {
    setQuery('')
    setActiveIndex(-1)
    setIsOpen(false)
    setIsExpanded(false)
    inputRef.current?.blur()
  }

  const openMovie = (movie: Movie) => {
    reset()
    navigate(paths.movie(movie.slug))
  }

  const showAllResults = () => {
    if (!trimmed) return
    reset()
    navigate(`${paths.sessions}?search=${encodeURIComponent(trimmed)}`)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setIsOpen(true)
      if (results.length === 0) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((index) => {
        const next = index + step
        if (next >= results.length) return -1
        if (next < -1) return results.length - 1
        return next
      })
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const movie = results[activeIndex]
      if (movie) openMovie(movie)
      else showAllResults()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      if (isOpen) setIsOpen(false)
      else if (query) setQuery('')
      else setIsExpanded(false)
    }
  }

  let panel: ReactNode
  if (!trimmed) {
    panel = (
      <SearchMessage
        icon={<PopcornIcon size={22} />}
        title="What do you want to watch?"
        text="Search by title, director or cast"
        onBrowse={reset}
      />
    )
  } else if (search.isError && isSettled) {
    panel = <p className="search-panel__status">Search isn't available right now. Try again.</p>
  } else if (!search.data || (!isSettled && results.length === 0)) {
    panel = <p className="search-panel__status">Searching…</p>
  } else if (results.length === 0) {
    panel = (
      <SearchMessage
        icon={<SearchIcon size={22} />}
        title={`No results for “${trimmed}”`}
        text="Check the spelling or try another film or live event."
        onBrowse={reset}
      />
    )
  } else {
    panel = (
      <>
        <div className="search-panel__header">
          <span>Films &amp; Events</span>
          <span>
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </span>
        </div>
        <ul id={listId} className="search-panel__list" role="listbox" aria-label="Search results">
          {results.map((movie, index) => (
            <li
              key={movie.id}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              className="search-result"
              onPointerEnter={() => setActiveIndex(index)}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => openMovie(movie)}
            >
              <span className="search-result__poster">
                {movie.posterUrl && <img src={movie.posterUrl} alt="" />}
              </span>
              <span className="search-result__text">
                <span className="search-result__title">{highlight(movie.title, trimmed)}</span>
                <span className="search-result__meta">{movieMetaLine(movie)}</span>
              </span>
              {movie.isComingSoon ? (
                <span className="search-result__soon">Coming Soon</span>
              ) : (
                <span className="search-result__price">from {formatPrice(movie.fromPrice)}</span>
              )}
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <div className="navbar-search" ref={containerRef} data-expanded={isExpanded}>
      <button
        type="button"
        className="navbar-search__toggle"
        aria-label="Search films and live events"
        aria-expanded={isExpanded}
        onClick={() => {
          setIsExpanded(true)
          setIsOpen(true)
        }}
      >
        <SearchIcon size={20} />
      </button>

      <form
        className="navbar-search__form"
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          showAllResults()
        }}
      >
        <SearchIcon size={18} className="navbar-search__icon" />
        <input
          ref={inputRef}
          type="search"
          className="navbar-search__input"
          placeholder="Search films and live events"
          aria-label="Search films and live events"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-activedescendant={isOpen && results[activeIndex] ? optionId(activeIndex) : undefined}
          autoComplete="off"
          enterKeyHint="search"
          maxLength={100}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(-1)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {(query || isExpanded) && (
          <button
            type="button"
            className="navbar-search__clear"
            aria-label={query ? 'Clear search' : 'Close search'}
            onClick={() => {
              if (query) {
                setQuery('')
                setActiveIndex(-1)
                inputRef.current?.focus()
              } else {
                reset()
              }
            }}
          >
            <CloseIcon size={14} />
          </button>
        )}
      </form>

      {isOpen && (
        <div className="search-panel" aria-live="polite">
          {panel}
        </div>
      )}
    </div>
  )
}
