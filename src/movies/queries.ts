import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getComingSoonMovies,
  getFeaturedMovies,
  getMovie,
  getNowPlayingMovies,
  notifyMe,
} from '../api/movies'
import { useAuth } from '../auth/useAuth'
import type { Movie } from '../types/movie'

export const movieKeys = {
  all: ['movies'] as const,
  featured: () => [...movieKeys.all, 'featured'] as const,
  nowPlaying: (limit?: number) => [...movieKeys.all, 'now-playing', limit] as const,
  comingSoon: (viewer: number | 'guest', limit?: number) =>
    [...movieKeys.all, 'coming-soon', viewer, limit] as const,
  detail: (slug: string) => [...movieKeys.all, 'detail', slug] as const,
}

export function useFeaturedMovies() {
  return useQuery({
    queryKey: movieKeys.featured(),
    queryFn: ({ signal }) => getFeaturedMovies(signal),
  })
}

export function useNowPlayingMovies(limit?: number) {
  return useQuery({
    queryKey: movieKeys.nowPlaying(limit),
    queryFn: ({ signal }) => getNowPlayingMovies(limit, signal),
  })
}

export function useComingSoonMovies(limit?: number) {
  const { user, status } = useAuth()
  return useQuery({
    queryKey: movieKeys.comingSoon(user?.id ?? 'guest', limit),
    queryFn: ({ signal }) => getComingSoonMovies(limit, signal),
    enabled: status !== 'loading',
  })
}

export function useMovie(slug: string) {
  return useQuery({
    queryKey: movieKeys.detail(slug),
    queryFn: ({ signal }) => getMovie(slug, signal),
  })
}

export function useNotifyMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => notifyMe(slug),
    onSuccess: (_, slug) => {
      queryClient.setQueriesData<Movie[]>(
        { queryKey: [...movieKeys.all, 'coming-soon'] },
        (movies) => movies?.map((movie) => (movie.slug === slug ? { ...movie, isNotified: true } : movie)),
      )
    },
  })
}
