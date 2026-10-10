import { apiRequest } from './client'
import type { ApiResponse } from '../types/api'
import type { Movie, MovieDetail, MovieWithSynopsis, NotifyResponse } from '../types/movie'
import type { VenueSessions } from '../types/session'

function withLimit(path: string, limit?: number) {
  return limit ? `${path}?limit=${limit}` : path
}

export async function getFeaturedMovies(signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<MovieWithSynopsis[]>>('/movies/featured', {
    signal,
  })
  return response.data
}

export async function getNowPlayingMovies(limit?: number, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<MovieWithSynopsis[]>>(
    withLimit('/movies/now-playing', limit),
    { signal },
  )
  return response.data
}

export async function getComingSoonMovies(limit?: number, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<Movie[]>>(
    withLimit('/movies/coming-soon', limit),
    { signal },
  )
  return response.data
}

export async function getMovie(slug: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<MovieDetail>>(
    `/movies/${encodeURIComponent(slug)}`,
    { signal },
  )
  return response.data
}

export async function getMovieSessions(slug: string, date: string, signal?: AbortSignal) {
  const response = await apiRequest<ApiResponse<VenueSessions[]>>(
    `/movies/${encodeURIComponent(slug)}/sessions?date=${date}`,
    { signal },
  )
  return response.data
}

export async function notifyMe(slug: string) {
  const response = await apiRequest<ApiResponse<NotifyResponse>>(
    `/movies/${encodeURIComponent(slug)}/notify`,
    { method: 'POST' },
  )
  return response.data
}
