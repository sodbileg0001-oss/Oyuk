import { formatPreferredDay, isCalendarDay, nextSaturday, todayInUlaanbaatar } from '../../shared/preferred-day'

export function DayPicker({ value, disabled, onChange }: { value: string; disabled: boolean; onChange: (day: string) => void }) {
  const today = todayInUlaanbaatar()
  return <div className="day-picker">
    <div className="day-picker-heading"><label htmlFor="preferred-day">Хэзээ уулзах вэ? <span>заавал биш</span></label><span className="day-picker-note" lang="en">save a little day for us</span></div>
    <input id="preferred-day" name="preferredDay" type="date" value={value} min={disabled ? undefined : today} max="9999-12-31" disabled={disabled} onChange={event => { const day = event.target.value; if (!day || isCalendarDay(day)) onChange(day) }} aria-describedby="day-help day-preview" />
    <div className="day-shortcuts"><button type="button" disabled={disabled} onClick={() => onChange(nextSaturday(today))}>Бямба гараг?</button><button type="button" disabled={disabled} aria-pressed={!value} onClick={() => onChange('')}>Өдрөө дараа тохиръё</button></div>
    <p id="day-preview" className="day-preview" aria-live="polite">{value ? <><span aria-hidden="true">♡</span> <time dateTime={value}>{formatPreferredDay(value)}</time></> : 'Хоёуланд маань тохирох өдрийг хамтдаа олъё.'}</p>
    <p id="day-help" className="day-help">Зүгээр л санал шүү. Тухайн өдрийн хуваарийг хамтдаа шалгаад, яг цагаа тохиръё.</p>
  </div>
}
