import { parseDate } from '../lib/format'
import type { TicketTypeSlug } from '../types/booking'
import type { TicketType } from '../types/filters'
import type { Session } from '../types/session'

const weekdayDayMonth = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const shortWeekdayDayMonth = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

export interface SelectedSeat {
  seatId: number
  code: string
  ticketType: TicketTypeSlug
}

export function sessionHeadline(session: Session) {
  return [
    session.venue.name,
    `Hall ${session.hall.name}`,
    weekdayDayMonth.format(parseDate(session.date)),
    session.time,
    session.format.name,
    session.language.name,
  ].join(' · ')
}

export function sessionShortLine(session: Session, withVenue = false) {
  return [
    withVenue ? session.venue.name : null,
    `Hall ${session.hall.name}`,
    shortWeekdayDayMonth.format(parseDate(session.date)),
    session.time,
  ]
    .filter(Boolean)
    .join(' · ')
}

export function ticketPrice(sessionPrice: number, ticketType: TicketType | undefined) {
  return Math.round(sessionPrice * (ticketType?.priceRatio ?? 1) * 100) / 100
}

export function isTicketTypeBlocked(ticketType: TicketType | undefined, minAge: number) {
  return ticketType?.blockedFromRatingAge != null && minAge >= ticketType.blockedFromRatingAge
}

export function ticketSummary(names: string[]) {
  const counts = new Map<string, number>()
  for (const name of names) counts.set(name, (counts.get(name) ?? 0) + 1)
  return [...counts].map(([name, count]) => `${count} x ${name}`).join(', ')
}

export function seatCodes(codes: string[]) {
  return [...codes].sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).join(', ')
}
