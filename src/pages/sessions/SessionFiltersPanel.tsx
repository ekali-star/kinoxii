import { DayPicker } from '../../components/DayPicker/DayPicker'
import { CheckIcon } from '../../components/icons'
import type { Day } from '../../lib/format'
import { allowedFormats, type FilterPatch } from '../../sessions/useSessionFilters'
import type { FilterOptions } from '../../types/filters'
import type { SessionFilters, TimeBand } from '../../types/session'

interface Option<Value extends string> {
  value: Value
  label: string
  hint?: string
}

interface FilterGroupProps<Value extends string> {
  title: string
  options: Option<Value>[]
  selected: Value[]
  onChange: (selected: Value[]) => void
}

function FilterGroup<Value extends string>({
  title,
  options,
  selected,
  onChange,
}: FilterGroupProps<Value>) {
  const toggle = (value: Value) =>
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : options.map((option) => option.value).filter((item) => item === value || selected.includes(item)),
    )

  return (
    <fieldset className="filter-group">
      <legend className="filter-group__title">{title}</legend>
      {options.map((option) => (
        <label key={option.value} className="filter-check">
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={() => toggle(option.value)}
          />
          <span className="filter-check__box" aria-hidden="true">
            <CheckIcon size={14} />
          </span>
          <span className="filter-check__label">{option.label}</span>
          {option.hint && <span className="filter-check__hint">· {option.hint}</span>}
        </label>
      ))}
    </fieldset>
  )
}

function splitBandLabel(label: string) {
  const match = /^(.*?)\s*\((.*)\)$/.exec(label)
  return match ? { label: match[1], hint: match[2] } : { label }
}

interface SessionFiltersPanelProps {
  id: string
  options: FilterOptions
  filters: SessionFilters
  days: Day[]
  activeCount: number
  onChange: (patch: FilterPatch) => void
  onClear: () => void
}

export function SessionFiltersPanel({
  id,
  options,
  filters,
  days,
  activeCount,
  onChange,
  onClear,
}: SessionFiltersPanelProps) {
  const formats = allowedFormats(options, filters.venues)

  const changeVenues = (venues: string[]) => {
    const allowed = new Set(allowedFormats(options, venues).map((format) => format.slug))
    onChange({ venues, formats: filters.formats.filter((format) => allowed.has(format)) })
  }

  return (
    <aside id={id} className="filters" aria-label="Filters">
      <h2 className="filters__title">Filters</h2>

      <FilterGroup
        title="Venue"
        options={options.venues.map((venue) => ({
          value: venue.slug,
          label: venue.name,
          hint: venue.city,
        }))}
        selected={filters.venues}
        onChange={changeVenues}
      />

      <div className="filter-group">
        <h3 className="filter-group__title">Date</h3>
        <DayPicker days={days} selected={filters.date} onSelect={(date) => onChange({ date })} />
      </div>

      <FilterGroup
        title="Format"
        options={formats.map((format) => ({ value: format.slug, label: format.name }))}
        selected={filters.formats}
        onChange={(selected) => onChange({ formats: selected })}
      />

      <FilterGroup
        title="Language"
        options={options.languages.map((language) => ({
          value: language.slug,
          label: language.name,
        }))}
        selected={filters.languages}
        onChange={(selected) => onChange({ languages: selected })}
      />

      <FilterGroup<TimeBand>
        title="Time of day"
        options={options.timeBands.map((band) => ({ value: band.id, ...splitBandLabel(band.label) }))}
        selected={filters.bands}
        onChange={(selected) => onChange({ bands: selected })}
      />

      <div className="filters__footer">
        <button
          type="button"
          className="button button--outline button--block"
          disabled={activeCount === 0}
          onClick={onClear}
        >
          Clear All Filters
        </button>
        <p className="filters__count" aria-live="polite">
          {activeCount === 1 ? '1 filter active' : `${activeCount} filters active`}
        </p>
      </div>
    </aside>
  )
}
