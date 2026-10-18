/** Calendar days have no time or browser timezone attached. */
export function isCalendarDay(value: unknown): value is string {
  if (typeof value !== 'string' || !/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T12:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export function todayInUlaanbaatar(now = Date.now()): string {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Ulaanbaatar', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)!.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function nextSaturday(today: string): string {
  const day = new Date(`${today}T12:00:00Z`)
  day.setUTCDate(day.getUTCDate() + (6 - day.getUTCDay() + 7) % 7)
  return day.toISOString().slice(0, 10)
}

export function formatPreferredDay(day: string): string {
  // Some mobile browsers do not ship Mongolian Intl date names and fall back
  // to English. Keep this small calendar label consistently Mongolian.
  const date = new Date(`${day}T12:00:00Z`)
  const weekdays = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба']
  return `${date.getUTCFullYear()} оны ${date.getUTCMonth() + 1}-р сарын ${date.getUTCDate()} · ${weekdays[date.getUTCDay()]}`
}
