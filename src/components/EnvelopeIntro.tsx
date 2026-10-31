import { useEffect, useRef, useState } from 'react'
import { Arrow, Flower, Heart, Sparkle } from './Illustrations'
import { dates } from '../data/dates'
import { Photo } from './Photo'

const glimpses = dates.filter(date => ['chess', 'canvas', 'boardgame'].includes(date.id))

export function EnvelopeIntro({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  function open() {
    if (opening) return
    setOpening(true)
    timer.current = setTimeout(onOpen, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650)
  }
  return <section className={`intro page-enter ${opening ? 'is-opening' : ''}`} aria-labelledby="intro-heading">
    <div className="intro-copy">
      <h1 id="intro-heading" tabIndex={-1}>Хамт<br /><em>гарах уу?</em></h1>
      <button className="button button-primary" onClick={open} disabled={opening}>{opening ? 'Нээж байна…' : 'Санаануудыг харах'} <Arrow /></button>
    </div>
    <div className="intro-photo-scene">
      <div className="intro-glimpses">{glimpses.map(date => <div className={'intro-glimpse glimpse-' + date.id} key={date.id}><Photo photo={date.cover} eager /></div>)}</div>
      <Sparkle className="intro-photo-sparkle" />
      <button className="envelope" onClick={open} disabled={opening} aria-label="Санаануудыг харах">
        <span className="letter-insert"><span className="letter-lines" /></span>
        <span className="envelope-back" />
        <span className="envelope-flap" />
        <span className="envelope-front"><span className="postage-stamp"><Flower /></span></span>
        <span className="wax-seal"><Heart filled /></span>
      </button>
    </div>
    <div className="intro-bottom" aria-hidden="true" />
  </section>
}
