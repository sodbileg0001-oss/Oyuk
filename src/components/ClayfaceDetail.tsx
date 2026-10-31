import type { DateIdea } from '../data/dates'
import { Arrow, Heart } from './Illustrations'

export function ClayfaceDetail({ date, selected, onBack, onChoose }: { date: DateIdea; selected: boolean; onBack: () => void; onChoose: () => void }) {
  return <article className="date-detail detail-clayface page-enter">
    <button className="back-link" onClick={onBack}><Arrow back /> Бяцхан санаанууд руу буцах</button>
    <div className="detail-hero cinema-hero">
      <div className="detail-copy">
        <p className="eyebrow">БЯЦХАН САНАА № {date.number} <span>♡</span> {date.category}</p>
        <h1 tabIndex={-1} lang={date.titleLanguage}>{date.title}</h1>
        <p className="detail-subtitle">{date.subtitle}</p>
        <p className="detail-description">{date.introduction}</p>
        <div className="timing-note"><span className="timing-icon" aria-hidden="true">◷</span><div><span className="small-label">ХЭЗЭЭ БОЛОХ ВЭ?</span><p>{date.timing}</p><small>Үзэх боломж, цагийг хамтдаа шалгая.</small></div></div>
        <button className="button button-themed" onClick={onChoose}>{selected ? 'Энэ санаагаа сонгоё' : 'Энэ болзоог сонгоё'} <Heart /></button>
      </div>
    </div>
  </article>
}
