const dayMonthLong = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' })
const dayMonthShort = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

function parseDate(date: string) {
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
