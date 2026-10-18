import { useEffect, useRef, useState } from 'react'
import { Arrow, Flower, Heart, Sparkle } from './Illustrations'

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
      <p className="eyebrow" lang="en"><span className="tiny-star">✳</span> A LITTLE NOTE, JUST FOR YOU</p>
      <h1 id="intro-heading" tabIndex={-1}>Чамаас нэг<br /><em>хөөрхөн зүйл</em><br />асууя<span className="period">.</span></h1>
      <p className="intro-description">Чамд зориулж бяцхан захиа бэлдлээ.<br />Хамтдаа өнгөрүүлэх цаг, дөрвөн жижигхэн санаа.<br />Нээгээд үзэх үү?</p>
      <button className="button button-primary" onClick={open} disabled={opening}>{opening ? 'Захиаг чинь нээж байна…' : 'Захиагаа нээх'} <Heart /></button>
      <span className="handwritten intro-ps" lang="en">p.s. this little corner is just for you.</span>
    </div>
    <div className="envelope-scene">
      <Sparkle className="envelope-sparkle" />
      <span className="handwritten envelope-annotation">хамт байх дуртай<br />нэг хүндээ</span>
      <svg className="annotation-arrow" width="78" height="83" viewBox="0 0 78 83" fill="none" aria-hidden="true"><path d="M72 4C17-3 0 31 41 68m-3-14 5 18-18-3" stroke="currentColor" strokeWidth="1.3" /></svg>
      <button className="envelope" onClick={open} disabled={opening} aria-label="Захиагаа нээх">
        <span className="letter-insert"><span className="handwritten">Хөөрхөн чамдаа,</span><span className="letter-lines" /><Heart /></span>
        <span className="envelope-back" />
        <span className="envelope-flap" />
        <span className="envelope-front"><span className="recipient">ХҮЛЭЭН АВАХ: ЧИ<br /><span>ЖААХАН ЗОРИГ ГАРГААД, НАДААС.</span></span><span className="postage-stamp"><Flower /><span>чамдаа</span></span></span>
        <span className="wax-seal"><Heart filled /></span>
      </button>
      <span className="envelope-shadow" />
      <span className="handwritten sealed-note">бяцхан найдвар шингээв <Heart /></span>
      <Flower className="scene-flower" />
      <span className="letter-edition">ГАНЦХАН ХУВЬ · ЗӨВХӨН ЧАМД</span>
    </div>
    <div className="intro-bottom"><span>01 / БЯЦХАН ЗАХИА</span><span>Нээгээд үз. Нэг хөөрхөн зүйл бий. <Arrow /></span></div>
  </section>
}
