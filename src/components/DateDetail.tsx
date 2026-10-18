import type { CSSProperties } from 'react'
import type { DateIdea } from '../data/dates'
import { Arrow, Heart, Sparkle } from './Illustrations'
import { Photo } from './Photo'
import { PhotoGallery } from './PhotoGallery'

export function DateDetail({ date, selected, onBack, onChoose }: { date: DateIdea; selected: boolean; onBack: () => void; onChoose: () => void }) {
  return <article className={`date-detail detail-${date.id} page-enter`} style={{ '--paper': date.palette.paper, '--ink': date.palette.pageInk ?? date.palette.ink, '--accent': date.palette.pageAccent ?? date.palette.accent, '--photo-ink': date.palette.ink } as CSSProperties}>
    <button className="back-link" onClick={onBack}><Arrow back /> Бяцхан санаанууд руу буцах</button>
    <div className="detail-hero"><div className="detail-copy"><p className="eyebrow">БЯЦХАН САНАА № {date.number} <span>♡</span> {date.category}</p><h1 tabIndex={-1} lang={(date.id === 'chess' || date.id === 'canvas') ? 'en' : 'mn'}>{date.title}</h1><p className="detail-subtitle">{date.subtitle}</p><p className="detail-description">{date.introduction}</p><div className="timing-note"><span className="timing-icon" aria-hidden="true">◷</span><div><span className="small-label">ХЭЗЭЭ БОЛОХ ВЭ?</span><p>{date.timing}</p><small>Яг өдрөө хамтдаа тохиръё.</small></div></div><button className="button button-themed" onClick={onChoose}>{selected ? 'Энэ санаагаа сонгоё' : 'Энэ болзоог сонгоё'} <Heart /></button></div><div className="detail-cover"><div className="detail-photo-frame"><Photo photo={date.cover} eager /><span className="handwritten">{date.annotation}</span></div><span className="detail-edition">ХАМТДАА ӨНГӨРҮҮЛЭХ ЦАГ · № {date.number}</span><Sparkle className="detail-sparkle" /></div></div>
    {date.links.length > 0 && <aside className="source-links"><span>Сонирхож байвал дахиад жаахан</span><div>{date.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} <span aria-hidden="true">↗</span><span className="sr-only"> (шинэ цонхонд нээгдэнэ)</span></a>)}</div></aside>}
    <PhotoGallery key={date.id} date={date} />
    <section className="detail-ending"><span className="handwritten">Их гоё дурсамж болох юм шиг ээ.</span><h2>Хамтдаа нэг<br /><em>дурсамж бүтээх үү?</em></h2><button className="button button-themed" onClick={onChoose}>Энэ болзоог сонгоё <Heart /></button><button className="text-link" onClick={onBack}><Arrow back /> Бяцхан санаанууд руу буцах</button></section>
  </article>
}
