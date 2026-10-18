import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { isDateId, MAX_MESSAGE_LENGTH, permittedResponses, type InvitationResponse } from '../shared/date-catalog.js'
import { isCalendarDay, todayInUlaanbaatar } from '../shared/preferred-day.js'
import { createEmail, type Answer } from './email.js'
import { MAX_BODY_BYTES, RequestError, TICKET_LIFETIME_MS, WarmRateLimiter, readConfig } from './guards.js'

type NodeRequest = IncomingMessage & { body?: unknown }
type Ticket = { version: 1; id: string; receivedAt: string; expiresAt: number; digest: string }
type Dependencies = { env?: () => NodeJS.ProcessEnv; now?: () => number; fetch?: typeof fetch; limiter?: WarmRateLimiter }
const malformed = () => new RequestError(400, 'INVALID_REQUEST', 'Хариугаа дахин шалгаад илгээгээрэй.')
const digest = (answer: Answer) => createHash('sha256').update(JSON.stringify(answer)).digest('hex')
const sign = (encoded: string, secret: string) => createHmac('sha256', secret).update(`little-letter/v1/${encoded}`).digest('base64url')

async function readPayload(request: NodeRequest): Promise<unknown> {
  if (!/^application\/json(?:\s*;|$)/i.test(String(request.headers['content-type'] ?? '')) || (request.headers['content-encoding'] && request.headers['content-encoding'] !== 'identity')) throw new RequestError(415, 'JSON_REQUIRED', 'Хариугаа сайтаас илгээгээрэй.')
  const length = request.headers['content-length']
  if (length && (!/^\d+$/.test(String(length)) || Number(length) > MAX_BODY_BYTES)) throw new RequestError(413, 'REQUEST_TOO_LARGE', 'Зурвас арай урт байна. Жаахан товчлоод илгээгээрэй.')
  let raw: string
  if (request.body !== undefined) {
    if (typeof request.body === 'string') raw = request.body
    else if (Buffer.isBuffer(request.body)) raw = new TextDecoder('utf-8', { fatal: true }).decode(request.body)
    else raw = JSON.stringify(request.body)
  } else {
    const chunks: Buffer[] = []
    let bytes = 0
    for await (const chunk of request) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      bytes += buffer.length
      if (bytes > MAX_BODY_BYTES) throw new RequestError(413, 'REQUEST_TOO_LARGE', 'Зурвас арай урт байна. Жаахан товчлоод илгээгээрэй.')
      chunks.push(buffer)
    }
    raw = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks))
  }
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) throw new RequestError(413, 'REQUEST_TOO_LARGE', 'Зурвас арай урт байна. Жаахан товчлоод илгээгээрэй.')
  try { return JSON.parse(raw) } catch { throw malformed() }
}

function validate(value: unknown): { answer: Answer; intent: 'prepare' | 'submit'; token?: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw malformed()
  const body = value as Record<string, unknown>
  const allowed = ['intent', 'response', 'selectedDateId', 'selectedDateTitle', 'preferredDay', 'message', 'website', 'submissionToken']
  if (Object.keys(body).some(key => !allowed.includes(key))) throw malformed()
  if (body.intent !== 'prepare' && body.intent !== 'submit') throw malformed()
  if (!permittedResponses.includes(body.response as InvitationResponse)) throw malformed()
  const selectedDateId = body.selectedDateId ?? null
  if (selectedDateId !== null && !isDateId(selectedDateId)) throw malformed()
  if (body.selectedDateTitle !== undefined && (typeof body.selectedDateTitle !== 'string' || body.selectedDateTitle.length > 160)) throw malformed()
  const preferredDay = body.preferredDay ?? null
  if (preferredDay !== null && (!isCalendarDay(preferredDay) || body.response !== 'yes')) throw malformed()
  if (body.message !== undefined && (typeof body.message !== 'string' || body.message.length > MAX_MESSAGE_LENGTH || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(body.message))) throw malformed()
  if (body.website !== undefined && body.website !== '') throw malformed()
  if (body.intent === 'prepare' && body.submissionToken !== undefined) throw malformed()
  if (body.intent === 'submit' && (typeof body.submissionToken !== 'string' || body.submissionToken.length > 2048)) throw malformed()
  return { intent: body.intent, token: body.submissionToken as string | undefined, answer: { response: body.response as InvitationResponse, selectedDateId: selectedDateId as Answer['selectedDateId'], message: (body.message as string | undefined ?? '').trim().replace(/\r\n/g, '\n'), ...(preferredDay ? { preferredDay: preferredDay as string } : {}) } }
}

function verifyTicket(token: string, secret: string, answer: Answer, now: number): Ticket {
  const parts = token.split('.')
  if (parts.length !== 2 || !/^[\w-]+$/.test(parts[0]) || !/^[\w-]{43}$/.test(parts[1])) throw malformed()
  const expected = Buffer.from(sign(parts[0], secret))
  const actual = Buffer.from(parts[1])
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw malformed()
  let ticket: Ticket
  try { ticket = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) } catch { throw malformed() }
  if (ticket.version !== 1 || typeof ticket.id !== 'string' || typeof ticket.receivedAt !== 'string' || ticket.digest !== digest(answer) || !Number.isFinite(ticket.expiresAt)) throw malformed()
  if (now > ticket.expiresAt) throw new RequestError(410, 'SUBMISSION_EXPIRED', 'Энэ хариуны хугацаа дууссан байна. Давхар илгээхээс сэргийлж дахин автоматаар илгээхгүй. Надтай шууд холбогдоорой. ♡')
  return ticket
}

export function createSubmissionHandler(dependencies: Dependencies = {}) {
  const limiter = dependencies.limiter ?? new WarmRateLimiter()
  const clock = dependencies.now ?? Date.now
  const send = dependencies.fetch ?? globalThis.fetch
  const environment = dependencies.env ?? (() => process.env)
  return async function handle(request: NodeRequest, response: ServerResponse) {
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    function json(status: number, body: object) { response.statusCode = status; response.end(JSON.stringify(body)) }
    try {
      if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); throw new RequestError(405, 'METHOD_NOT_ALLOWED', 'Хариугаа сайтаас илгээгээрэй.') }
      const env = environment()
      const now = clock()
      // Vercel sets x-real-ip at its edge. Local clients use the socket address instead.
      const ip = env.VERCEL === '1' ? String(request.headers['x-real-ip'] ?? request.socket.remoteAddress ?? 'unknown') : request.socket.remoteAddress ?? 'local'
      if (!limiter.take(ip, now)) { response.setHeader('Retry-After', '600'); throw new RequestError(429, 'TOO_MANY_REQUESTS', 'Түр амсхийгээд хэдэн минутын дараа дахин оролдоорой. ♡') }
      let payload: unknown
      try { payload = await readPayload(request) } catch (error) { if (error instanceof RequestError) throw error; throw malformed() }
      const { answer, intent, token } = validate(payload)
      // Validate past days only when preparing: retrying a signed answer after midnight
      // must keep exactly the original payload and provider idempotency key.
      if (intent === 'prepare' && answer.preferredDay && answer.preferredDay < todayInUlaanbaatar(now)) throw new RequestError(422, 'DAY_IN_THE_PAST', 'Энэ өдөр өнгөрсөн байна. Өөр өдөр сонгох эсвэл өдрөө дараа тохирч болно. ♡')
      const config = readConfig(env)
      if ((request.headers.origin && request.headers.origin !== config.siteUrl) || request.headers['sec-fetch-site'] === 'cross-site') throw new RequestError(403, 'ORIGIN_NOT_ALLOWED', 'Хариугаа урилгын сайтаас илгээгээрэй.')

      if (intent === 'prepare') {
        const ticket: Ticket = { version: 1, id: randomUUID(), receivedAt: new Date(now).toISOString(), expiresAt: now + TICKET_LIFETIME_MS, digest: digest(answer) }
        const encoded = Buffer.from(JSON.stringify(ticket)).toString('base64url')
        return json(200, { ok: true, stage: 'prepared', submissionId: ticket.id, submissionToken: `${encoded}.${sign(encoded, config.apiKey)}` })
      }
      const ticket = verifyTicket(token!, config.apiKey, answer, now)
      const email = createEmail(answer, ticket.receivedAt, ticket.id, config)
      let provider: Response
      try {
        provider = await send('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `little-letter/${ticket.id}` },
          body: JSON.stringify(email), signal: AbortSignal.timeout(12_000),
        })
      } catch { throw new RequestError(502, 'DELIVERY_UNCONFIRMED', 'Хариуг илгээснийг баталгаажуулж чадсангүй. Интернэтээ шалгаад дахин оролдоорой. ♡') }
      if (!provider.ok) {
        if (provider.status === 409) { response.setHeader('Retry-After', '3'); throw new RequestError(409, 'RETRY_LATER', 'Хариуг чинь шалгаж байна. Хэдхэн хоромын дараа дахин оролдоорой. ♡') }
        throw new RequestError(502, 'DELIVERY_UNCONFIRMED', 'Хариуг чинь одоохондоо илгээж чадсангүй. Жаахан дараа дахин оролдоорой. ♡')
      }
      const result = await provider.json().catch(() => null) as { id?: unknown } | null
      if (!result || typeof result.id !== 'string' || !result.id) throw new RequestError(502, 'DELIVERY_UNCONFIRMED', 'Хариуг илгээснийг баталгаажуулж чадсангүй. Дахин оролдоорой. ♡')
      return json(200, { ok: true, stage: 'submitted', submissionId: ticket.id })
    } catch (error) {
      const controlled = error instanceof RequestError ? error : new RequestError(500, 'SERVER_ERROR', 'Жижигхэн саатал гарлаа. Жаахан дараа дахин оролдоорой. ♡')
      json(controlled.status, { ok: false, code: controlled.code, message: controlled.message })
    }
  }
}
