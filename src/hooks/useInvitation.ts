import { useState } from 'react'
import { isDateId, permittedResponses, type DateId, type InvitationResponse } from '../../shared/date-catalog'

export type Receipt = { response: InvitationResponse; selectedDateId: DateId | null; submissionId: string }
type Memory = { opened: boolean; selected: DateId | null; receipt: Receipt | null; visited: DateId[] }
const empty: Memory = { opened: false, selected: null, receipt: null, visited: [] }
const key = 'a-little-letter:v2'

function read(): Memory {
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) ?? sessionStorage.getItem('a-little-letter:v1') ?? 'null')
    if (!saved || typeof saved !== 'object') return empty
    const receipt = saved.receipt
    const validReceipt = receipt && permittedResponses.includes(receipt.response) && typeof receipt.submissionId === 'string' && (receipt.selectedDateId === null || isDateId(receipt.selectedDateId))
    return { opened: saved.opened === true, selected: isDateId(saved.selected) ? saved.selected : null, receipt: validReceipt ? receipt : null, visited: Array.isArray(saved.visited) ? [...new Set<DateId>(saved.visited.filter(isDateId))] : [] }
  } catch { return empty }
}

export function useInvitation() {
  const [memory, setMemory] = useState<Memory>(read)
  function update(patch: Partial<Memory>) {
    setMemory(previous => {
      const next = { ...previous, ...patch }
      try { sessionStorage.setItem(key, JSON.stringify(next)) } catch { /* Storage is optional. */ }
      return next
    })
  }
  function complete(receipt: Receipt) {
    const next = { ...memory, receipt }
    try { sessionStorage.setItem(key, JSON.stringify(next)) } catch { /* In-memory receipt still works. */ }
    setMemory(next)
  }
  return { ...memory, accepted: memory.receipt !== null, open: () => update({ opened: true }), visit: (id: DateId) => update({ visited: [...new Set([...memory.visited, id])] }), select: (id: DateId) => update({ selected: id }), complete, restart: () => { update(empty); try { sessionStorage.removeItem('a-little-letter:v1') } catch { /* Optional storage. */ } } }
}
