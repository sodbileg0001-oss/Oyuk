import type { DateIdea } from '../data/dates'
import type { InvitationResponse } from '../../shared/date-catalog'
import { Arrow, Confetti, Flower, Heart } from './Illustrations'
import { Photo } from './Photo'
import { formatPreferredDay } from '../../shared/preferred-day'

export function ConfirmationScreen({ selected, response, preferredDay, onBack, onDetail }: { selected?: DateIdea; response: InvitationResponse; preferredDay: string | null; onBack: () => void; onDetail: () => void }) {
  const yes = response === 'yes'
  const headline = yes ? <>Удахгүй<br /><em>уулзъя.</em></> : response === 'maybe' ? <>Яарах зүйлгүй.<br /><em>Бодоод үзээрэй.</em></> : <>Ойлголоо.<br /><em>Баярлалаа.</em></>
  return <section className="confirmation page-enter" aria-labelledby="confirmation-heading">
    {yes && <Confetti />}
    <div className="confirmation-title">
      <span className="handwritten" lang={yes ? 'en' : 'mn'}>{yes ? 'a little plan for us' : 'хариугаа үлдээсэнд баярлалаа ♡'}</span>
      <div className="confirmation-doodle">{yes ? <Heart filled /> : <Flower />}<span /></div>
      <p className="eyebrow confirmation-status"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>ХАРИУГ ЧИНЬ ХҮЛЭЭЖ АВЛАА</p>
      <h1 id="confirmation-heading" tabIndex={-1}>{headline}</h1>
      <p>{yes ? 'Хамтдаа сайхан цаг өнгөрөөе.' : response === 'maybe' ? 'Хэрэгтэй хугацаагаа аваарай. Чиний хариуг хүндэтгэнэ ээ.' : 'Үнэнээ хэлсэнд баярлалаа. Чамд сайхан бүхнийг хүсье.'}</p>
    </div>
    {selected ? <div className={`confirmation-recap recap-${selected.id}`} style={{ backgroundColor: selected.palette.paper, color: selected.palette.ink, borderColor: `${selected.palette.accent}55` }}>
      <div className="recap-photo"><Photo photo={selected.cover} eager /></div>
      <div className="recap-copy"><span className="eyebrow">{yes ? 'СОНГОСОН БОЛЗОО' : 'СОНИРХСОН БЯЦХАН САНАА'} · {selected.number}</span><h2 lang={(selected.id === 'chess' || selected.id === 'canvas') ? 'en' : 'mn'}>{selected.title}</h2><p>{selected.timing}</p><span className="handwritten">{yes ? preferredDay ? 'Яг цагаа хамтдаа тохиръё.' : 'Өдөр, цагаа хамтдаа тохиръё.' : 'хариунд чинь энэ санааг тэмдэглэлээ.'}</span><button className="text-link" onClick={onDetail}>Санаагаа дахин харах <Arrow /></button></div>
      <Heart className="recap-heart" />
    </div> : yes && <div className="no-plan-note"><Flower /><p>Болзооны санаагаа<br /><em>хамтдаа сонгоё.</em></p></div>}
    {yes && preferredDay && <div className="confirmed-day"><span className="eyebrow" lang="en">A LITTLE DAY FOR US</span><p><Heart /><time dateTime={preferredDay}>{formatPreferredDay(preferredDay)}</time></p><span>Санал болгосон өдөр · Яг цагаа, хуваариа хамтдаа тохиръё.</span></div>}
    <div className="confirmation-actions"><button className="button button-primary" onClick={onBack}>Бяцхан санаануудыг дахин харах <Arrow /></button>{yes && <span className="handwritten" lang="en">see you soon ♡</span>}</div>
  </section>
}
