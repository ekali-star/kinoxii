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
