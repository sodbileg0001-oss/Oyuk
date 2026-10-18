import type { FormEvent } from 'react'
import type { DateIdea } from '../data/dates'
import { MAX_MESSAGE_LENGTH, permittedResponses, responseLabels, type InvitationResponse } from '../../shared/date-catalog'
import { Arrow, Flower, Heart, Sparkle } from './Illustrations'
import { DayPicker } from './DayPicker'

type Props = { selected?: DateIdea; response: InvitationResponse; preferredDay: string; message: string; website: string; busy: boolean; locked: boolean; error: string; onEdit: (patch: { response?: InvitationResponse; preferredDay?: string; message?: string; website?: string }) => void; onSubmit: () => void; onBack: () => void }
export function FinalInvitation({ selected, response, preferredDay, message, website, busy, locked, error, onEdit, onSubmit, onBack }: Props) {
  function submit(event: FormEvent) { event.preventDefault(); onSubmit() }
  return <section className="final-invitation page-enter" aria-labelledby="question-heading"><div className="question-card">
    <span className="card-corner corner-top" /><span className="card-corner corner-bottom" /><Flower className="question-flower" /><span className="handwritten">тэгэхээр, асуух гэсэн зүйл минь…</span>
    <h1 id="question-heading" tabIndex={-1}>Надтай хамт<br /><em>болзоонд явах уу?</em></h1><Heart className="question-heart" /><p>Чамтай хамт жаахан цаг өнгөрөөхийг<br />үнэхээр их хүсэж байна.</p>
    <span className="selected-plan-note">{selected ? <>Сонгосон бяцхан санаа: <strong>{selected.title}</strong></> : 'Болзооны санаагаа дараа нь хамтдаа сонгож болно.'}</span>
    <form className="response-form" onSubmit={submit} aria-busy={busy}>
      <fieldset disabled={busy || locked}><legend>Чиний хариу</legend><div className="response-choices">{permittedResponses.map(value => <label key={value} className={response === value ? 'is-checked' : ''}><input type="radio" name="response" value={value} checked={response === value} onChange={() => onEdit({ response: value })} /><span>{responseLabels[value]}</span></label>)}</div></fieldset>
      {response === 'yes' && <DayPicker value={preferredDay} disabled={busy || locked} onChange={day => onEdit({ preferredDay: day })} />}
      <label className="message-label" htmlFor="personal-message">Надад үлдээх бяцхан зурвас <span>заавал биш</span></label><textarea id="personal-message" value={message} maxLength={MAX_MESSAGE_LENGTH} disabled={busy || locked} rows={3} onChange={event => onEdit({ message: event.target.value })} placeholder="Хэлмээр зүйл байвал энд бичээрэй…" aria-describedby="message-limit" /><span className="message-limit" id="message-limit">{message.length} / {MAX_MESSAGE_LENGTH}</span>
      <div className="honeypot" aria-hidden="true"><label htmlFor="invitation-website">Website</label><input id="invitation-website" name="website" type="text" autoComplete="off" tabIndex={-1} value={website} onChange={event => onEdit({ website: event.target.value })} /></div>
      {locked && !error && <p className="pending-note" role="status">Өмнөх хариугаа илгээж дуусгая. ♡</p>}{error && <p className="submission-error" role="alert">{error}</p>}
      <div className="question-actions"><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Хариуг чинь илгээж байна…' : error || locked ? 'Дахин оролдох' : 'Хариугаа илгээх'} <Heart /></button><button className="text-link" type="button" onClick={onBack} disabled={busy || locked}>Болзооны санаагаа эхлээд сонгоё <Arrow /></button></div>
    </form><span className="question-footnote">жаахан зориг гаргаад, чин сэтгэлээсээ асуув.</span><Sparkle className="question-sparkle" /></div><p className="comfortable-note">Яарах хэрэггүй ээ. Өөрийнхөөрөө хариулаарай. ♡</p></section>
}
