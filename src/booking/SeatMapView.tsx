import { Fragment, type CSSProperties } from 'react'
import type { Seat, SeatMap } from '../types/booking'

export type SeatDisplayState = 'available' | 'selected' | 'sold' | 'held' | 'unavailable'

interface SeatMapViewProps {
  map: SeatMap
  displayState: (seat: Seat) => SeatDisplayState
  onToggle: (seat: Seat) => void
}

const STATE_LABELS: Record<SeatDisplayState, string> = {
  available: 'available',
  selected: 'selected',
  sold: 'sold',
  held: 'held by another user',
  unavailable: 'unavailable',
}

function rowSpan(seats: Seat[]) {
  return seats.reduce((width, seat) => width + 1 + (seat.aisleAfter ? 0.5 : 0), 0)
}

export function SeatMapView({ map, displayState, onToggle }: SeatMapViewProps) {
  const columns = Math.max(
    ...map.sections.flatMap((section) => section.rows.map((row) => rowSpan(row.seats))),
  )

  return (
    <div className="seat-map" style={{ '--columns': columns } as CSSProperties}>
      <div className="seat-map__screen" aria-hidden="true">
        Screen
      </div>

      {map.sections.map((section) => {
        const first = section.rows[0]?.label
        const last = section.rows.at(-1)?.label
        return (
          <section key={section.name} className="seat-section" aria-label={section.name}>
            <p className="seat-section__label">
              {section.name}
              {first && ` · Rows ${first === last ? first : `${first}-${last}`}`}
            </p>
            <div className="seat-section__rows">
              {section.rows.map((row) => (
                <div key={row.label} className="seat-row">
                  <span className="seat-row__label" aria-hidden="true">
                    {row.label}
                  </span>
                  {row.seats.map((seat) => {
                    const state = displayState(seat)
                    return (
                      <Fragment key={seat.id}>
                        {state === 'unavailable' ? (
                          <span className="seat seat--gap" aria-hidden="true" />
                        ) : (
                          <button
                            type="button"
                            className="seat"
                            data-state={state}
                            aria-pressed={state === 'selected'}
                            aria-label={`Seat ${seat.code}, ${STATE_LABELS[state]}`}
                            disabled={state === 'sold' || state === 'held'}
                            onClick={() => onToggle(seat)}
                          >
                            {seat.label}
                          </button>
                        )}
                        {seat.aisleAfter && <span className="seat-row__aisle" aria-hidden="true" />}
                      </Fragment>
                    )
                  })}
                </div>
              ))}
            </div>
          </section>
        )
      })}

      <ul className="seat-legend">
        {(['available', 'selected', 'sold', 'held'] as const).map((state) => (
          <li key={state}>
            <span className="seat seat--swatch" data-state={state} aria-hidden="true" />
            {state === 'held' ? 'Held by another user' : state[0].toUpperCase() + state.slice(1)}
          </li>
        ))}
      </ul>
    </div>
  )
}
