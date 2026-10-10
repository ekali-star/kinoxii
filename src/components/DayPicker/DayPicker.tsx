import { formatLongDate, type Day } from '../../lib/format'
import './DayPicker.css'

interface DayPickerProps {
  days: Day[]
  selected: string | null
  isAvailable?: (iso: string) => boolean
  onSelect: (iso: string) => void
}

export function DayPicker({ days, selected, isAvailable = () => true, onSelect }: DayPickerProps) {
  return (
    <div className="day-picker" role="group" aria-label="Choose a date">
      {days.map((day) => {
        const available = isAvailable(day.iso)
        return (
          <button
            key={day.iso}
            type="button"
            className="day-picker__day"
            aria-pressed={day.iso === selected}
            aria-label={`${formatLongDate(day.iso)}${available ? '' : ', no sessions'}`}
            disabled={!available}
            onClick={() => onSelect(day.iso)}
          >
            <span className="day-picker__weekday">{day.weekday}</span>
            <span className="day-picker__date">{day.day}</span>
          </button>
        )
      })}
    </div>
  )
}
