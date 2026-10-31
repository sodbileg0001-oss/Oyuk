import type { CSSProperties } from 'react'
import type { DateIdea } from '../data/dates'
import { Arrow, Heart, Sparkle } from './Illustrations'
import { Photo } from './Photo'

const symbols = { chess: '♞', theatre: '✧', exhibition: '↗', basketball: '◎', canvas: '✳', boardgame: '⚄', clayface: '▶' }

export function DateFolder({ date, seen, selected, onOpen }: { date: DateIdea; seen: boolean; selected: boolean; onOpen: () => void }) {
  const secondary = date.photos.find(photo => photo.src !== date.cover.src)
  return <button
    className={['date-folder', 'folder-' + date.id, selected ? 'is-selected' : ''].join(' ')}
    style={{ '--paper': date.palette.paper, '--ink': date.palette.ink, '--accent': date.palette.accent } as CSSProperties}
    onClick={onOpen}
    aria-label={date.title + ' — дэлгэрэнгүй' + (selected ? ', чиний сонголт' : '')}
  >
    <span className="folder-tab">БЯЦХАН САНАА № {date.number} {selected ? <Heart filled /> : seen ? <span className="seen-check">✓ <span className="sr-only">үзсэн</span></span> : <span>♡</span>}</span>
    <span className="folder-art">
      {date.id === 'clayface' ? <Photo photo={date.cover} className="cinema-folder-image" /> : <>
      <span className="journal-rules" aria-hidden="true" />
      <span className="journal-photo"><Photo photo={date.cover} /><span className="journal-photo-label" lang="en">a little time, together</span></span>
      {secondary && <span className="journal-photo-small"><Photo photo={secondary} /></span>}
      <span className="journal-tape" aria-hidden="true" />
      <span className="journal-symbol" aria-hidden="true">{symbols[date.id]}</span>
      <span className="journal-photo-count" aria-hidden="true">{String(date.photos.length).padStart(2, '0')} PHOTOS / ♡</span>
      <Sparkle className="journal-sparkle" />
      </>}
    </span>
    <span className="folder-copy">
      <span className="folder-category">{date.category}</span>
      <span className="folder-title" lang={date.titleLanguage}>{date.title}</span>
      <span className="folder-teaser">{date.teaser}</span>
      <span className="folder-open">Нээгээд үзье <Arrow /></span>
    </span>
  </button>
}
