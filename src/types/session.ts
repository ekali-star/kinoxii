import type { Movie } from './movie'
import type { Format } from './user'

export interface VenueSummary {
  id: number
  slug: string
  name: string
  city: string
}

export interface Language {
  id: number
  slug: string
  name: string
  code: string
}

export interface Hall {
  id: number
  name: string
}

export type TimeBand = 'morning' | 'afternoon' | 'evening'

export interface Session {
  id: number
  startsAt: string
  date: string
  time: string
  timeBand: TimeBand
  price: number
  seatsLeft: number
  isSoldOut: boolean
  hall: Hall
  venue: VenueSummary
  format: Format
  language: Language
  movie?: Movie
}

export interface VenueSessions {
  venue: VenueSummary
  sessions: Session[]
}

export type SessionSort = 'time_asc' | 'time_desc' | 'price_asc' | 'price_desc' | 'title_asc'

export interface SessionGroup {
  movie: Movie
  sessions: Session[]
}

export interface SessionsMeta {
  currentPage: number
  lastPage: number
  perPage: number
  totalSessions: number
  totalMovies: number
  date: string
}

export interface SessionsResponse {
  data: SessionGroup[]
  meta: SessionsMeta
}

export interface SessionFilters {
  date: string
  venues: string[]
  formats: string[]
  languages: string[]
  bands: TimeBand[]
  search: string
  sort: SessionSort
  page: number
}
