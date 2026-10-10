import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useAuthModal } from '../../auth/useAuthModal'
import { SESSION_PARAM } from '../../booking/BookingModal'
import { useFilterOptions } from '../../booking/queries'
import { CloseIcon } from '../../components/icons'
import { SectionError } from '../../components/SectionError/SectionError'
import { formatLongDate, nextDays } from '../../lib/format'
import { useSessions } from '../../sessions/queries'
import { countActiveFilters, useSessionFilters } from '../../sessions/useSessionFilters'
import type { Session } from '../../types/session'
import { Pagination } from './Pagination'
import { SessionFiltersPanel } from './SessionFiltersPanel'
import { SessionGroupList } from './SessionGroupList'
import { SortMenu } from './SortMenu'
import './SessionsPage.css'

const DAYS_SHOWN = 7
const FILTERS_ID = 'session-filters'

function sessionCount(total: number) {
  if (total === 0) return 'No sessions found'
  return `Showing ${total} ${total === 1 ? 'session' : 'sessions'}`
}

export function SessionsPage() {
  const days = useMemo(() => nextDays(DAYS_SHOWN), [])
  const options = useFilterOptions()
  const { filters, update, setPage, clearAll } = useSessionFilters(options.data, days)
  const sessions = useSessions(filters, Boolean(options.data))
  const [, setSearchParams] = useSearchParams()
  const { requireAuth } = useAuthModal()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const activeCount = countActiveFilters(filters)
  const meta = sessions.data?.meta
  const lastPage = meta?.lastPage

  useEffect(() => {
    if (lastPage === undefined || sessions.isPlaceholderData) return
    if (filters.page > Math.max(lastPage, 1)) setPage(Math.max(lastPage, 1), true)
  }, [filters.page, lastPage, sessions.isPlaceholderData, setPage])

  const selectSession = (session: Session) => {
    requireAuth(() =>
      setSearchParams(
        (params) => {
          params.set(SESSION_PARAM, String(session.id))
          return params
        },
        { preventScrollReset: true },
      ),
    )
  }

  return (
    <section className="page sessions-page" aria-labelledby="sessions-heading">
      <h1 id="sessions-heading" className="sessions-page__title">
        Sessions
      </h1>
      <p className="page__lead">Browse showtimes across all venues</p>

      {options.isError ? (
        <SectionError message="Couldn't load the filters." onRetry={options.refetch} />
      ) : (
        <div className="sessions-layout">
          <button
            type="button"
            className="button button--outline sessions-page__filters-toggle"
            aria-expanded={filtersOpen}
            aria-controls={FILTERS_ID}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            {filtersOpen ? 'Hide filters' : 'Show filters'}
            {activeCount > 0 && <span className="sessions-page__filters-badge">{activeCount}</span>}
          </button>

          <div className="sessions-layout__aside" data-open={filtersOpen}>
            {options.data ? (
              <SessionFiltersPanel
                id={FILTERS_ID}
                options={options.data}
                filters={filters}
                days={days}
                activeCount={activeCount}
                onChange={update}
                onClear={clearAll}
              />
            ) : (
              <div id={FILTERS_ID} className="filters skeleton sessions-page__filters-skeleton" />
            )}
          </div>

          <div className="sessions-results" aria-busy={sessions.isFetching}>
            <div className="sessions-results__header">
              <p className="sessions-results__count" aria-live="polite">
                {meta ? sessionCount(meta.totalSessions) : ' '}
              </p>
              {options.data && (
                <SortMenu
                  options={options.data.sorts}
                  value={filters.sort}
                  onChange={(sort) => update({ sort })}
                />
              )}
            </div>

            {filters.search && (
              <p className="sessions-results__search">
                Results for <strong>“{filters.search}”</strong>
                <button
                  type="button"
                  className="sessions-results__search-clear"
                  aria-label="Clear search"
                  onClick={() => update({ search: '' })}
                >
                  <CloseIcon size={14} />
                </button>
              </p>
            )}

            {sessions.isError && !sessions.data ? (
              <SectionError message="Couldn't load the sessions." onRetry={sessions.refetch} />
            ) : !sessions.data ? (
              <div className="session-groups">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="skeleton sessions-page__group-skeleton" />
                ))}
              </div>
            ) : sessions.data.data.length === 0 ? (
              <div className="sessions-empty">
                <p>
                  No sessions match your filters on {formatLongDate(filters.date)}.
                  {activeCount > 0 ? ' Try removing some filters.' : ' Try another date.'}
                </p>
                {activeCount > 0 && (
                  <button type="button" className="button button--outline" onClick={clearAll}>
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div
                className="sessions-results__list"
                data-stale={sessions.isPlaceholderData}
              >
                <SessionGroupList groups={sessions.data.data} onSelect={selectSession} />
                <Pagination
                  current={sessions.data.meta.currentPage}
                  last={sessions.data.meta.lastPage}
                  onChange={(page) => setPage(page)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
