import type { CSSProperties } from 'react'
import type { DateIdea } from '../data/dates'
import { Arrow, Heart, Sparkle } from './Illustrations'
import { Photo } from './Photo'

export function DateFolder({ date, seen, selected, onOpen }: { date: DateIdea; seen: boolean; selected: boolean; onOpen: () => void }) {
  return <button className={`date-folder folder-${date.id}`} style={{ '--paper': date.palette.paper, '--ink': date.palette.ink, '--accent': date.palette.accent } as CSSProperties} onClick={onOpen} aria-label={`${date.title} — дэлгэрэнгүй${selected ? ', чиний сонголт' : ''}`}>
    <span className="folder-tab">БЯЦХАН САНАА № {date.number} {selected ? <Heart filled /> : seen ? <span className="seen-check">✓ <span className="sr-only">үзсэн</span></span> : <span>♡</span>}</span>
    <span className="folder-art">
      {date.id === 'chess' && <><span className="checker-strip" /><span className="chess-piece" aria-hidden="true">♞</span><span className="polaroid chess-main"><Photo photo={date.cover} /><span className="handwritten">хөөрхөн эхний нүүдэл.</span></span><span className="mini-polaroid"><Photo photo={date.photos[0]} /></span><span className="round-sticker">чи, би<br />ба жаахан<br /><i>шатар</i></span></>}
      {date.id === 'theatre' && <><span className="theatre-rules" /><span className="theatre-poster"><Photo photo={date.photos[5] ?? date.cover} /></span><span className="theatre-cast"><Photo photo={date.cover} /></span><span className="ticket-stub"><span>ХОЁР ХҮНИЙ</span><i>бидний<br />нэг үдэш</i><span>♡ &nbsp; 02 &nbsp; ♡</span></span><Sparkle className="theatre-sparkle" /></>}
      {date.id === 'exhibition' && <><span className="postcard"><Photo photo={date.cover} /><span className="postcard-caption">ӨӨР НЭГЭН ЦАГ ҮЕД</span></span><span className="tape" /><span className="travel-stamp">ХАМТДАА<br /><i>аялъя</i><br />ХОЁУЛАА</span><span className="exhibition-line" /><span className="handwritten archive-note">өнгөрсний нэгэн хуудас…</span></>}
      {date.id === 'basketball' && <><span className="court-lines" /><span className="league-photo"><Photo photo={date.cover} /></span><span className="basketball-doodle" aria-hidden="true"><svg width="72" height="72" viewBox="0 0 72 72" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="36" cy="36" r="32" /><path d="m12 14 48 44M12 58 59 14M5 37c20-10 35 1 32 30M37 5c-6 23 9 31 30 30" /></svg></span><span className="score-note">ЧИ + БИ<br /><i>нэг баг.</i></span><span className="handwritten league-note">хөөрхөн баг болох нь ♡</span></>}
    </span>
    <span className="folder-copy"><span className="folder-category">{date.category}</span><span className="folder-title" lang={date.id === 'chess' ? 'en' : 'mn'}>{date.title}</span><span className="folder-teaser">{date.teaser}</span><span className="folder-open">Нээгээд үзье <Arrow /></span></span>
  </button>
}
