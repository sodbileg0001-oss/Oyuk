import { createHash } from 'node:crypto'

export const MAX_BODY_BYTES = 8192
export const TICKET_LIFETIME_MS = 23 * 60 * 60 * 1000

export class RequestError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message) }
}

/** Deliberately bounded, best-effort limits per warm function instance, not a distributed quota. */
export class WarmRateLimiter {
  private clients = new Map<string, { count: number; until: number }>()
  private global = { count: 0, until: 0 }

  take(ip: string, now: number) {
    if (this.global.until <= now) this.global = { count: 0, until: now + 60 * 60 * 1000 }
    for (const [key, value] of this.clients) if (value.until <= now) this.clients.delete(key)
    const key = createHash('sha256').update(ip).digest('hex')
    const client = this.clients.get(key) ?? { count: 0, until: now + 10 * 60 * 1000 }
    if (this.global.count >= 60 || client.count >= 12 || this.clients.size >= 2000) return false
    client.count++
    this.global.count++
    this.clients.set(key, client)
    return true
  }
}

export type ServerConfig = { apiKey: string; recipient: string; sender: string; siteUrl: string }
export function readConfig(env: NodeJS.ProcessEnv): ServerConfig {
  const values = ['RESEND_API_KEY', 'NOTIFICATION_EMAIL', 'FROM_EMAIL', 'SITE_URL'].map(key => env[key]?.trim())
  const [apiKey, recipient, sender, siteUrl] = values
  const fail = () => new RequestError(503, 'CONFIGURATION_REQUIRED', 'Уучлаарай, хариу хүлээн авах хэсэг хараахан бэлэн болоогүй байна. Жаахан дараа дахин оролдоорой.')
  if (!apiKey || !recipient || !sender || !siteUrl || values.some(value => /[\r\n]/.test(value!))) throw fail()
  const email = /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/
  if (!email.test(recipient) || !email.test(sender)) throw fail()
  let canonical: URL
  try { canonical = new URL(siteUrl) } catch { throw fail() }
  const local = env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1', '[::1]'].includes(canonical.hostname)
  if ((canonical.protocol !== 'https:' && !(local && canonical.protocol === 'http:')) || canonical.username || canonical.password || canonical.search || canonical.hash || canonical.pathname !== '/') throw fail()
  return { apiKey, recipient, sender, siteUrl: canonical.origin }
}
