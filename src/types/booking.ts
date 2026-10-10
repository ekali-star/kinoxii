import type { Session, VenueSummary } from './session'

export type SeatState = 'available' | 'sold' | 'held' | 'unavailable'

export interface Seat {
  id: number
  code: string
  label: string
  state: SeatState
  aisleAfter: boolean
  isMine: boolean
}

export interface SeatRow {
  label: string
  seats: Seat[]
}

export interface SeatSection {
  name: string
  rows: SeatRow[]
}

export interface SeatMap {
  sessionId: number
  hall: { id: number; name: string; venue: VenueSummary }
  sections: SeatSection[]
}

export type TicketTypeSlug = 'adult' | 'child' | 'student'

export interface HoldSeatRequest {
  seatId: number
  ticketType: TicketTypeSlug
}

export interface HoldRequest {
  seats: HoldSeatRequest[]
}

export interface SeatHold {
  holdId: string
  sessionId: number
  expiresAt: string
  secondsRemaining: number
  isLive: boolean
  subtotal: number
  seats: {
    seatId: number
    code: string
    ticketType: { slug: TicketTypeSlug; name: string }
    price: number
  }[]
}

export interface ContestedResponse {
  message: string
  contested: string[]
}

export interface OrderRequest {
  holdId: string
  fullName: string
  email: string
  mobileNumber: string
  cardNumber: string
  expiry: string
  cvv: string
}

export interface OrderTicket {
  id: number
  seatCode: string
  ticketType: { slug: TicketTypeSlug; name: string }
  price: number
}

export interface Order {
  id: number
  reference: string
  status: 'paid' | 'refunded'
  totalPrice: number
  paidAt: string
  refundedAt: string | null
  isUpcoming: boolean
  isRefundable: boolean
  cardLastFour: string
  contact: { fullName: string; email: string; mobileNumber: string }
  session: Session
  tickets: OrderTicket[]
}
