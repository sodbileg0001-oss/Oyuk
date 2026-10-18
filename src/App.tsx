import { useEffect, useRef, useState } from 'react'
import { dates, getDate, type DateId } from './data/dates'
import { useInvitation } from './hooks/useInvitation'
import { useSubmission } from './hooks/useSubmission'
import { Navigation } from './components/Navigation'
import { EnvelopeIntro } from './components/EnvelopeIntro'
import { DateFolderGrid } from './components/DateFolderGrid'
import { DateDetail } from './components/DateDetail'
import { FinalInvitation } from './components/FinalInvitation'
import { ConfirmationScreen } from './components/ConfirmationScreen'
import { Heart } from './components/Illustrations'

type View = 'letter' | 'options' | 'question' | 'confirmation' | DateId
function validView(hash: string): View | null {
  const value = hash.replace('#', '')
  return ['letter', 'options', 'question', 'confirmation', ...dates.map(date => date.id)].includes(value) ? value as View : null
}

export default function App() {
  const invitation = useInvitation()
  const submission = useSubmission()
  const [view, setView] = useState<View>(() => {
    const requested = validView(location.hash)
    if (!invitation.opened) return 'letter'
    if (requested === 'confirmation' && !invitation.accepted) return 'question'
    return requested ?? (invitation.accepted ? 'confirmation' : 'options')
  })
  const main = useRef<HTMLElement>(null)
  const initial = useRef(true)
  const selected = getDate(invitation.selected)
  const current = getDate(view)
  const confirmedDate = getDate(invitation.receipt?.selectedDateId ?? null)
  const questionDate = submission.locked ? getDate(submission.draft.selectedDateId) : selected
  const pageBackground = current?.palette.background ?? '#f7f1ea'

  function navigate(next: View, replace = false) {
    if (replace) history.replaceState(null, '', `#${next}`)
    else if (location.hash !== `#${next}`) history.pushState(null, '', `#${next}`)
    setView(next)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  useEffect(() => {
    function onPopState() {
      const next = validView(location.hash)
      setView(!invitation.opened ? 'letter' : next === 'confirmation' && !invitation.accepted ? 'question' : next ?? 'options')
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [invitation.opened, invitation.accepted])
  useEffect(() => {
    document.title = current ? `${current.title} · Бидний бяцхан санаанууд` : view === 'confirmation' ? 'Хариуг чинь хүлээж авлаа ♡' : 'Чамд бичсэн бяцхан захиа ♡'
    if (initial.current) { initial.current = false; return }
    requestAnimationFrame(() => main.current?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true }))
  }, [view, current])
  useEffect(() => {
    if (current && !invitation.visited.includes(current.id)) invitation.visit(current.id)
  }, [current, invitation])
  useEffect(() => {
    document.body.style.backgroundColor = pageBackground
    document.documentElement.style.backgroundColor = pageBackground
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', pageBackground)
  }, [pageBackground])

  function openDate(id: DateId) { invitation.visit(id); navigate(id) }
  function choose(id: DateId) { invitation.select(id); navigate('question') }
  function restart() { if (submission.busy || submission.locked) return; submission.clear(); invitation.restart(); navigate('letter', true) }

  return <div className={`app view-${view}`} style={{ backgroundColor: pageBackground }}>
    <a href="#main-content" className="skip-link" onClick={event => { event.preventDefault(); main.current?.focus() }}>Үндсэн хэсэг рүү очих</a>
    <Navigation intro={view === 'letter'} accepted={invitation.accepted} locked={submission.busy || submission.locked} onHome={() => { if (view !== 'letter') navigate('options') }} onQuestion={() => navigate(invitation.accepted ? 'confirmation' : 'question')} onRestart={restart} />
    <main id="main-content" ref={main} tabIndex={-1}>
      {view === 'letter' && <EnvelopeIntro onOpen={() => { invitation.open(); const destination = validView(location.hash); navigate(destination && destination !== 'letter' && destination !== 'confirmation' ? destination : 'options') }} />}
      {view === 'options' && <DateFolderGrid visited={invitation.visited} selected={invitation.selected} onOpen={openDate} onQuestion={() => navigate('question')} />}
      {current && <DateDetail key={current.id} date={current} selected={invitation.selected === current.id} onBack={() => navigate('options')} onChoose={() => choose(current.id)} />}
      {view === 'question' && <FinalInvitation selected={questionDate} response={submission.draft.response} message={submission.draft.message} website={submission.draft.website} busy={submission.busy} locked={submission.locked} error={submission.error} onEdit={submission.edit} onSubmit={() => submission.submit(invitation.selected, receipt => { invitation.complete(receipt); navigate('confirmation') })} onBack={() => navigate('options')} />}
      {view === 'confirmation' && invitation.receipt && <ConfirmationScreen selected={confirmedDate} response={invitation.receipt.response} onBack={() => navigate('options')} onDetail={() => confirmedDate && openDate(confirmedDate.id)} />}
    </main>
    <footer className="site-footer"><span>ЖААХАН ЗОРИГ ГАРГААД <Heart /></span><span className="handwritten">маш их сэтгэл шингээв.</span><span>ЗӨВХӨН ЧАМД.</span></footer>
  </div>
}
