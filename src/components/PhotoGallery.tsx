import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { DateIdea } from '../data/dates'
import { Photo } from './Photo'
import { Arrow } from './Illustrations'

export function PhotoGallery({ date }: { date: DateIdea }) {
  const [active, setActive] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    if (active !== null && !dialog.current?.open) dialog.current?.showModal()
  }, [active])
  function close() { dialog.current?.close(); setActive(null); trigger.current?.focus() }
  function move(direction: number) { setActive(previous => ((previous ?? 0) + direction + date.photos.length) % date.photos.length) }
  function onDialogKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
    if (event.key === 'Tab') {
      const controls = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
  }
  return <section className={`photo-gallery gallery-${date.id}`} aria-labelledby="gallery-heading">
    <div className="gallery-heading"><div><span className="eyebrow" lang="en">A CLOSER LOOK</span><h2 id="gallery-heading">Хэдэн бяцхан агшин<span>.</span></h2></div><span className="handwritten" lang="en">tap a photo, linger a little</span></div>
    <div className="photo-masonry">{date.photos.map((photo, index) => <figure key={photo.src}>
      <button className="gallery-photo" onClick={event => { trigger.current = event.currentTarget; setActive(index) }} aria-label={`Зураг ${index + 1}-ийг томруулах: ${photo.alt}`}>
        <Photo photo={photo} /><span className="photo-zoom" aria-hidden="true">↗</span>
      </button>
    </figure>)}</div>
    <dialog ref={dialog} className="lightbox" aria-label={`${date.title} — зургийн цомог`} onCancel={event => { event.preventDefault(); close() }} onClick={event => { if (event.target === event.currentTarget) close() }} onKeyDown={onDialogKeyDown}>
      {active !== null && <><div className="lightbox-toolbar"><span>{active + 1} / {date.photos.length}</span><button onClick={close} className="icon-button" aria-label="Зургийг хаах" autoFocus>×</button></div><div className="lightbox-image"><Photo key={date.photos[active].src} photo={date.photos[active]} eager /></div><div className="lightbox-bottom"><button className="icon-button" aria-label="Өмнөх зураг" onClick={() => move(-1)} disabled={date.photos.length === 1}><Arrow back /></button><button className="icon-button" aria-label="Дараагийн зураг" onClick={() => move(1)} disabled={date.photos.length === 1}><Arrow /></button></div></>}
    </dialog>
  </section>
}
