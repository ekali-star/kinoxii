const dayMonthLong = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' })
const dayMonthShort = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

const longDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
const weekdayShort = new Intl.DateTimeFormat('en-GB', { weekday: 'short' })

export function parseDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatRuntime(minutes: number) {
  return `${minutes} min`
}

export function formatPrice(amount: number) {
  return `₾ ${Number.isInteger(amount) ? amount : amount.toFixed(2)}`
}

export function formatDayMonthLong(date: string) {
  return dayMonthLong.format(parseDate(date))
}

export function formatDayMonthShort(date: string) {
  return dayMonthShort.format(parseDate(date))
}

export function movieMeta(genres: { name: string }[], runtimeMinutes: number) {
  const genre = genres[0]?.name
  return [genre, formatRuntime(runtimeMinutes)].filter(Boolean).join(' · ')
}

export function formatLongDate(date: string) {
  return longDate.format(parseDate(date))
}

export function toISODate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function nextDays(count: number, from = new Date()) {
  return Array.from({ length: count }, (_, offset) => {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset)
    return {
      iso: toISODate(date),
      weekday: weekdayShort.format(date),
      day: date.getDate(),
    }
  })
}

export type Day = ReturnType<typeof nextDays>[number]

const monthShort = new Intl.DateTimeFormat('en-US', { month: 'short' })

export function formatWeekdayDate(date: string | Date) {
  const value = typeof date === 'string' ? parseDate(date) : date
  return `${weekdayShort.format(value)} ${value.getDate()} ${monthShort.format(value)}`
}

export function sessionStart(date: string, time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const start = parseDate(date)
  start.setHours(hours, minutes)
  return start
}

export function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
