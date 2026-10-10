import type { TicketTypeSlug } from './booking'
import type { AgeRating } from './movie'
import type { Language, SessionSort, TimeBand } from './session'
import type { Format, Venue } from './user'

export interface TicketType {
  id: number
  slug: TicketTypeSlug
  name: string
  priceRatio: number
  note: string | null
  blockedFromRatingAge: number | null
}

export interface FilterOptions {
  venues: Venue[]
  formats: Format[]
  languages: Language[]
  timeBands: { id: TimeBand; label: string }[]
  sorts: { id: SessionSort; label: string }[]
  ticketTypes: TicketType[]
  ageRatings: AgeRating[]
  maxSeatsPerOrder: number
  holdMinutes: number
}
