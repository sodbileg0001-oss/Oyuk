import { useRef, useState } from 'react'
import { isDateId, MAX_MESSAGE_LENGTH, permittedResponses, type DateId, type InvitationResponse } from '../../shared/date-catalog'
import type { Receipt } from './useInvitation'

type Draft = { response: InvitationResponse; message: string; website: string; selectedDateId: DateId | null; submissionToken?: string; submissionId?: string }
const key = 'a-little-letter:response-draft:v1'
const empty: Draft = { response: 'yes', message: '', website: '', selectedDateId: null }

function read(): Draft {
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) ?? 'null')
    if (!saved || !permittedResponses.includes(saved.response) || typeof saved.message !== 'string' || saved.message.length > MAX_MESSAGE_LENGTH || (saved.selectedDateId !== null && !isDateId(saved.selectedDateId))) return empty
    return { response: saved.response, message: saved.message, website: '', selectedDateId: saved.selectedDateId, submissionToken: typeof saved.submissionToken === 'string' ? saved.submissionToken : undefined, submissionId: typeof saved.submissionId === 'string' ? saved.submissionId : undefined }
  } catch { return empty }
}

async function post(payload: object) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 20_000)
  try {
    const response = await fetch('/api/submit-response', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(payload), signal: controller.signal })
    const result = await response.json().catch(() => null)
    if (!response.ok || result?.ok !== true) throw new Error(typeof result?.message === 'string' && result.message.length < 600 ? result.message : 'Хариуг чинь илгээж чадсангүй. Жаахан дараа дахин оролдоорой. ♡')
    return result
  } finally { clearTimeout(timeout) }
}

export function useSubmission() {
  const [draft, setDraft] = useState<Draft>(read)
  const current = useRef(draft)
  const sending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  function save(next: Draft) {
    current.current = next
    setDraft(next)
    try { sessionStorage.setItem(key, JSON.stringify(next)) } catch { /* In-page retries still work without storage. */ }
  }
  function edit(patch: Partial<Pick<Draft, 'response' | 'message' | 'website'>>) {
    if (sending.current || current.current.submissionToken) return
    setError(''); save({ ...current.current, ...patch })
  }
  function clear() {
    current.current = empty; setDraft(empty); setError('')
    try { sessionStorage.removeItem(key) } catch { /* Optional storage. */ }
  }
  async function submit(selectedDateId: DateId | null, onSuccess: (receipt: Receipt) => void) {
    if (sending.current) return
    sending.current = true; setBusy(true); setError('')
    try {
      let pending = current.current
      if (!pending.submissionToken) {
        pending = { ...pending, selectedDateId }; save(pending)
        const prepared = await post({ intent: 'prepare', response: pending.response, selectedDateId, message: pending.message, website: pending.website })
        if (prepared.stage !== 'prepared' || typeof prepared.submissionToken !== 'string' || typeof prepared.submissionId !== 'string') throw new Error('Хариуг чинь бэлдэж чадсангүй. Дахин оролдоорой. ♡')
        pending = { ...pending, submissionToken: prepared.submissionToken, submissionId: prepared.submissionId }; save(pending)
      }
      const sent = await post({ intent: 'submit', response: pending.response, selectedDateId: pending.selectedDateId, message: pending.message, website: pending.website, submissionToken: pending.submissionToken })
      if (sent.stage !== 'submitted' || sent.submissionId !== pending.submissionId) throw new Error('Хариуг илгээснийг баталгаажуулж чадсангүй. Дахин оролдоорой. ♡')
      onSuccess({ response: pending.response, selectedDateId: pending.selectedDateId, submissionId: sent.submissionId })
      clear()
    } catch (cause) {
      setError(cause instanceof Error && cause.name !== 'AbortError' && cause.name !== 'TypeError' ? cause.message : 'Холболт жаахан саатлаа. Интернэтээ шалгаад дахин оролдоорой. ♡')
    } finally { sending.current = false; setBusy(false) }
  }
  return { draft, busy, error, locked: !!draft.submissionToken, edit, submit, clear }
}
