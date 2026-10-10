import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { FilterOptions } from '../types/filters'
import type { SessionFilters, SessionSort, TimeBand } from '../types/session'
import type { Day } from '../lib/format'

export const DEFAULT_SORT: SessionSort = 'time_asc'

const LIST_KEYS = {
  venues: 'venue',
  formats: 'format',
  languages: 'language',
  bands: 'time',
} as const

type ListFilter = keyof typeof LIST_KEYS

export type FilterPatch = Partial<Omit<SessionFilters, 'page'>>

function readList(params: URLSearchParams, key: string, allowed?: Set<string>) {
  const values = (params.get(key) ?? '').split(',').filter(Boolean)
  return [...new Set(values)].filter((value) => !allowed || allowed.has(value))
}

export function allowedFormats(options: FilterOptions, venues: string[]) {
  if (venues.length === 0) return options.formats
  const slugs = new Set(
    options.venues
      .filter((venue) => venues.includes(venue.slug))
      .flatMap((venue) => venue.formats.map((format) => format.slug)),
  )
  return options.formats.filter((format) => slugs.has(format.slug))
}

export function countActiveFilters(filters: SessionFilters) {
  return (
    filters.venues.length +
    filters.formats.length +
    filters.languages.length +
    filters.bands.length +
    (filters.search ? 1 : 0)
  )
}

export function useSessionFilters(options: FilterOptions | undefined, days: Day[]) {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<SessionFilters>(() => {
    const slugs = (items: { slug: string }[] | undefined) =>
      items ? new Set(items.map((item) => item.slug)) : undefined

    const venues = readList(searchParams, LIST_KEYS.venues, slugs(options?.venues))
    const formats = readList(
      searchParams,
      LIST_KEYS.formats,
      slugs(options ? allowedFormats(options, venues) : undefined),
    )
    const languages = readList(searchParams, LIST_KEYS.languages, slugs(options?.languages))
    const bands = readList(
      searchParams,
      LIST_KEYS.bands,
      options ? new Set(options.timeBands.map((band) => band.id)) : undefined,
    ) as TimeBand[]

    const requestedDate = searchParams.get('date')
    const date = days.some((day) => day.iso === requestedDate) ? requestedDate! : days[0].iso

    const requestedSort = searchParams.get('sort') as SessionSort | null
    const sort =
      requestedSort && (!options || options.sorts.some((option) => option.id === requestedSort))
        ? requestedSort
        : DEFAULT_SORT

    const page = Number.parseInt(searchParams.get('page') ?? '', 10)

    return {
      date,
      venues,
      formats,
      languages,
      bands,
      search: searchParams.get('search')?.trim() ?? '',
      sort,
      page: Number.isInteger(page) && page > 1 ? page : 1,
    }
  }, [searchParams, options, days])

  const update = useCallback(
    (patch: FilterPatch) => {
      setSearchParams(
        (params) => {
          const next = new URLSearchParams(params)
          for (const [field, key] of Object.entries(LIST_KEYS) as [ListFilter, string][]) {
            const values = patch[field]
            if (!values) continue
            if (values.length > 0) next.set(key, values.join(','))
            else next.delete(key)
          }
          if (patch.date !== undefined) next.set('date', patch.date)
          if (patch.sort !== undefined) {
            if (patch.sort === DEFAULT_SORT) next.delete('sort')
            else next.set('sort', patch.sort)
          }
          if (patch.search !== undefined) {
            if (patch.search) next.set('search', patch.search)
            else next.delete('search')
          }
          next.delete('page')
          return next
        },
        { preventScrollReset: true },
      )
    },
    [setSearchParams],
  )

  const setPage = useCallback(
    (page: number, replace = false) => {
      setSearchParams(
        (params) => {
          const next = new URLSearchParams(params)
          if (page > 1) next.set('page', String(page))
          else next.delete('page')
          return next
        },
        { replace },
      )
    },
    [setSearchParams],
  )

  const clearAll = useCallback(
    () => update({ venues: [], formats: [], languages: [], bands: [], search: '' }),
    [update],
  )

  return { filters, update, setPage, clearAll }
}
