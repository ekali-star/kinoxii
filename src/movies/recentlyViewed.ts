import { useSyncExternalStore } from 'react'
import type { AgeRating, Movie } from '../types/movie'

export interface RecentMovie {
  slug: string
  title: string
  posterUrl: string | null
  backdropUrl: string | null
  runtimeMinutes: number
  genre: string | null
  ageRating: AgeRating
}

const STORAGE_KEY = 'kinoxii_recently_viewed'
const MAX_ITEMS = 10
const listeners = new Set<() => void>()
const EMPTY: RecentMovie[] = []
let cache: RecentMovie[] | null = null

function read(): RecentMovie[] {
  if (cache) return cache
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    cache = Array.isArray(parsed) ? parsed : EMPTY
  } catch {
    cache = EMPTY
  }
  return cache
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return
    cache = null
    listener()
  }
  window.addEventListener('storage', handleStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', handleStorage)
  }
}

export function addRecentlyViewed(movie: Movie) {
  const entry: RecentMovie = {
    slug: movie.slug,
    title: movie.title,
    posterUrl: movie.posterUrl,
    backdropUrl: movie.backdropUrl,
    runtimeMinutes: movie.runtimeMinutes,
    genre: movie.genres[0]?.name ?? null,
    ageRating: movie.ageRating,
  }
  cache = [entry, ...read().filter((item) => item.slug !== movie.slug)].slice(0, MAX_ITEMS)
  persist(cache)
  listeners.forEach((listener) => listener())
}

function persist(items: RecentMovie[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    return true
  } catch {
    return false
  }
}

export function useRecentlyViewed() {
  return useSyncExternalStore(subscribe, read, () => EMPTY)
}
