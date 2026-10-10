import type { Format } from './user'

export type AgeRatingCode = 'G' | 'PG' | '12+' | '16+' | '18+'

export interface AgeRating {
  code: AgeRatingCode
  minAge: number
  description: string
}

export interface Genre {
  id: number
  slug: string
  name: string
}

export interface Movie {
  id: number
  slug: string
  title: string
  kind: 'film' | 'event'
  runtimeMinutes: number
  posterUrl: string | null
  backdropUrl: string | null
  releaseDate: string
  isComingSoon: boolean
  isNotified: boolean
  isFeatured: boolean
  fromPrice: number
  ageRating: AgeRating
  genres: Genre[]
  formats: Format[]
}

export interface MovieWithSynopsis extends Movie {
  synopsis: string
}

export interface NotifyResponse {
  movieId: number
  subscribed: boolean
}
