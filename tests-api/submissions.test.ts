import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { test } from 'node:test'
import { createSubmissionHandler } from '../server/submissions.js'
import { TICKET_LIFETIME_MS } from '../server/guards.js'

// Reserved example domains and an explicitly fake secret; tests never call Resend.
const configured = { RESEND_API_KEY: 'test-only-not-a-real-key', NOTIFICATION_EMAIL: 'recipient@example.invalid', FROM_EMAIL: 'sender@example.invalid', SITE_URL: 'https://invite.example.invalid', NODE_ENV: 'test' }
const answer = { response: 'yes', selectedDateId: 'theatre', message: 'Хамтдаа үзье ♡' }
const accepted = () => Promise.resolve(Response.json({ id: 'provider-test-email' }))

async function fixture(run: (call: (body?: unknown, options?: { method?: string; headers?: Record<string, string>; raw?: string }) => Promise<{ status: number; body: any; headers: Headers }>) => Promise<void>, options: Parameters<typeof createSubmissionHandler>[0] = {}, vercelParsed = false) {
  const handler = createSubmissionHandler({ env: () => configured, fetch: accepted, ...options })
  const server = createServer(async (request, response) => {
    if (vercelParsed) {
      const chunks = []
      for await (const chunk of request) chunks.push(chunk)
      Object.assign(request, { body: JSON.parse(Buffer.concat(chunks).toString('utf8')) })
    }
    await handler(request, response)
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address() as { port: number }
  try {
    await run(async (body, options = {}) => {
      const response = await fetch(`http://127.0.0.1:${address.port}/api/submit-response`, { method: options.method ?? 'POST', headers: { 'Content-Type': 'application/json', ...options.headers }, body: options.method === 'GET' ? undefined : options.raw ?? JSON.stringify(body) })
      return { status: response.status, body: await response.json(), headers: response.headers }
    })
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())) }
}

test('explicit preparation sends no email; final submission uses authoritative title and escaped HTML', async () => {
  const outbound: { url: string; init: RequestInit }[] = []
  await fixture(async call => {
    const input = { ...answer, selectedDateTitle: '<script>untrusted title</script>', message: '<img src=x onerror="alert(1)">\nҮү Өө & hello' }
    const prepare = await call({ ...input, intent: 'prepare' })
    assert.equal(prepare.status, 200); assert.equal(outbound.length, 0)
    assert.match(prepare.body.submissionId, /^[\da-f-]{36}$/)
    const result = await call({ ...input, intent: 'submit', submissionToken: prepare.body.submissionToken })
    assert.equal(result.status, 200); assert.equal(result.body.stage, 'submitted'); assert.equal(outbound.length, 1)
    const { url, init } = outbound[0]
    assert.equal(url, 'https://api.resend.com/emails')
    const email = JSON.parse(String(init.body))
    assert.deepEqual(email.to, [configured.NOTIFICATION_EMAIL]); assert.equal(email.from, configured.FROM_EMAIL)
    assert.ok(email.text.includes('YES —')); assert.ok(email.text.includes('Амьтны ферм жүжиг'))
    assert.ok(!email.html.includes('<img')); assert.ok(email.html.includes('&lt;img'))
    assert.ok(!email.html.includes('untrusted title')); assert.ok(email.text.includes('Үү Өө & hello'))
    assert.ok(email.text.includes(configured.SITE_URL)); assert.equal(result.body.submissionToken, undefined)
  }, { fetch: async (url, init) => { outbound.push({ url: String(url), init: init! }); return accepted() } })
})

test('Vercel-style pre-parsed request bodies support the same endpoint flow', async () => {
  await fixture(async call => {
    const prepared = await call({ ...answer, intent: 'prepare' })
    assert.equal(prepared.status, 200)
    const submitted = await call({ ...answer, intent: 'submit', submissionToken: prepared.body.submissionToken })
    assert.equal(submitted.status, 200)
    assert.equal((await call({ ...answer, intent: 'prepare', selectedDateId: 'not-a-date' })).status, 400)
  }, {}, true)
})

for (const response of ['yes', 'maybe', 'no']) test(`${response} is reported accurately, including no selected date`, async () => {
  let text = ''
  await fixture(async call => {
    const prepared = await call({ intent: 'prepare', response, selectedDateId: null })
    const sent = await call({ intent: 'submit', response, selectedDateId: null, submissionToken: prepared.body.submissionToken })
    assert.equal(sent.status, 200); assert.ok(text.includes(`${response.toUpperCase()} —`)); assert.ok(text.includes('Болзооны санаа сонгоогүй.'))
    if (response !== 'yes') assert.ok(!text.includes('YES —'))
  }, { fetch: async (_, init) => { text = JSON.parse(String(init?.body)).text; return accepted() } })
})

const invalid = [
  { ...answer, response: 'always-yes' }, { ...answer, selectedDateId: 'date-1' }, { ...answer, selectedDateId: '__proto__' },
  { ...answer, selectedDateId: [] }, { ...answer, message: 'x'.repeat(1001) }, { ...answer, message: { html: 'bad' } },
  { ...answer, message: '\u0000bad' }, { ...answer, to: 'attacker@example.invalid' }, { ...answer, from: 'spoof@example.invalid' },
  { ...answer, RESEND_API_KEY: 'not-allowed' }, { ...answer, website: 'spam' },
]
for (const [index, payload] of invalid.entries()) test(`rejects invalid or unexpected payload ${index + 1} without sending`, async () => {
  let calls = 0
  await fixture(async call => { assert.equal((await call({ ...payload, intent: 'prepare' })).status, 400) }, { fetch: async () => { calls++; return accepted() } })
  assert.equal(calls, 0)
})

test('rejects malformed JSON, primitives, wrong methods/types and oversized bodies', async () => {
  await fixture(async call => {
    assert.equal((await call(undefined, { raw: '{broken' })).status, 400)
    assert.equal((await call([], {})).status, 400)
    const get = await call(undefined, { method: 'GET' }); assert.equal(get.status, 405); assert.equal(get.headers.get('allow'), 'POST')
    assert.equal((await call(answer, { headers: { 'Content-Type': 'text/plain' } })).status, 415)
    assert.equal((await call(undefined, { raw: ' '.repeat(8193) })).status, 413)
  })
})

for (const name of ['RESEND_API_KEY', 'NOTIFICATION_EMAIL', 'FROM_EMAIL', 'SITE_URL']) test(`missing ${name} is a controlled configuration error`, async () => {
  await fixture(async call => {
    const result = await call({ ...answer, intent: 'prepare' })
    assert.equal(result.status, 503); assert.equal(result.body.code, 'CONFIGURATION_REQUIRED')
    assert.ok(!JSON.stringify(result.body).includes(configured.RESEND_API_KEY)); assert.equal(result.body.stack, undefined)
  }, { env: () => ({ ...configured, [name]: '' }) })
})

test('rejects cross-site browser submissions and filled honeypots', async () => {
  await fixture(async call => {
    assert.equal((await call({ ...answer, intent: 'prepare' }, { headers: { Origin: 'https://other.example.invalid' } })).status, 403)
    assert.equal((await call({ ...answer, intent: 'prepare' }, { headers: { 'Sec-Fetch-Site': 'cross-site' } })).status, 403)
  })
})

test('server rate limiting enforces a limit independently of browser controls', async () => {
  await fixture(async call => {
    for (let i = 0; i < 12; i++) assert.equal((await call({ ...answer, intent: 'prepare' })).status, 200)
    const limited = await call({ ...answer, intent: 'prepare' }); assert.equal(limited.status, 429); assert.equal(limited.headers.get('retry-after'), '600')
  })
})

test('signed tickets reject tampering, changed answers, and expiry', async () => {
  let now = Date.now()
  await fixture(async call => {
    const prepared = await call({ ...answer, intent: 'prepare' })
    const input = { ...answer, intent: 'submit', submissionToken: prepared.body.submissionToken }
    assert.equal((await call({ ...input, submissionToken: 'tampered.token' })).status, 400)
    assert.equal((await call({ ...input, response: 'no' })).status, 400)
    now += TICKET_LIFETIME_MS + 1
    assert.equal((await call(input)).status, 410)
  }, { now: () => now })
})

test('retry uses identical provider key/body and stable server time, including another function instance', async () => {
  let now = Date.now(), deliveries = 0
  const seen = new Map<string, string>()
  const provider: typeof fetch = async (_, init) => {
    const key = new Headers(init?.headers).get('Idempotency-Key')!
    if (seen.has(key)) assert.equal(init?.body, seen.get(key))
    else { seen.set(key, String(init?.body)); deliveries++ }
    return accepted()
  }
  let retry: object
  await fixture(async call => {
    const prepared = await call({ ...answer, intent: 'prepare' })
    retry = { ...answer, intent: 'submit', submissionToken: prepared.body.submissionToken }
    assert.equal((await call(retry)).status, 200)
    now += 60_000
    assert.equal((await call(retry)).status, 200)
  }, { fetch: provider, now: () => now })
  await fixture(async call => { assert.equal((await call(retry)).status, 200) }, { fetch: provider, now: () => now })
  assert.equal(deliveries, 1)
})

test('provider failures are controlled, private, and never automatically retried', async () => {
  for (const status of [429, 500, 409]) {
    let calls = 0
    await fixture(async call => {
      const prepared = await call({ ...answer, intent: 'prepare' })
      const result = await call({ ...answer, intent: 'submit', submissionToken: prepared.body.submissionToken })
      assert.equal(result.status, status === 409 ? 409 : 502); assert.equal(calls, 1)
      assert.ok(!JSON.stringify(result.body).includes('private provider detail')); assert.equal(result.body.ok, false)
    }, { fetch: async () => { calls++; return Response.json({ error: 'private provider detail' }, { status }) } })
  }
})

test('the preferred calendar day is authoritative, signed, and included in both email formats', async () => {
  let email: any
  const input = { ...answer, preferredDay: '2026-10-24' }
  await fixture(async call => {
    const prepared = await call({ ...input, intent: 'prepare' })
    assert.equal(prepared.status, 200)
    const submit = { ...input, intent: 'submit', submissionToken: prepared.body.submissionToken }
    assert.equal((await call({ ...submit, preferredDay: '2026-10-25' })).status, 400)
    assert.equal((await call(submit)).status, 200)
    assert.ok(email.text.includes('Санал болгосон өдөр:'))
    assert.ok(email.text.includes('2026-10-24')); assert.ok(email.html.includes('2026-10-24'))
    assert.ok(email.text.includes('Бямба')); assert.ok(email.html.includes('Бямба'))
    assert.deepEqual(email.to, [configured.NOTIFICATION_EMAIL])
  }, { now: () => Date.UTC(2026, 9, 18), fetch: async (_, init) => { email = JSON.parse(String(init?.body)); return accepted() } })
})

test('invalid calendar days and days attached to non-acceptance answers are rejected without sending', async () => {
  let sends = 0
  await fixture(async call => {
    for (const preferredDay of ['2026-02-30', '2027-02-29', '2026-13-01', '24/10/2026', '<script>alert(1)</script>', {}, false, '']) {
      assert.equal((await call({ ...answer, preferredDay, intent: 'prepare' })).status, 400)
    }
    for (const response of ['maybe', 'no']) assert.equal((await call({ ...answer, response, preferredDay: '2026-10-24', intent: 'prepare' })).status, 400)
    assert.equal(sends, 0)
  }, { fetch: async () => { sends++; return accepted() } })
})

test('calendar validation uses Ulaanbaatar today and preserves identical retries across local midnight', async () => {
  let now = Date.UTC(2026, 9, 18, 15, 59)
  const sent: { body: unknown; key: string | null }[] = []
  const input = { ...answer, preferredDay: '2026-10-18' }
  await fixture(async call => {
    const prepared = await call({ ...input, intent: 'prepare' })
    assert.equal(prepared.status, 200)
    const submit = { ...input, intent: 'submit', submissionToken: prepared.body.submissionToken }
    assert.equal((await call(submit)).status, 200)
    now += 120_000 // It is now October 19 in Ulaanbaatar, still October 18 UTC.
    const past = await call({ ...input, intent: 'prepare' })
    assert.equal(past.status, 422); assert.equal(past.body.code, 'DAY_IN_THE_PAST')
    assert.equal((await call(submit)).status, 200)
    assert.deepEqual(sent[0], sent[1])
  }, { now: () => now, fetch: async (_, init) => { sent.push({ body: init?.body, key: new Headers(init?.headers).get('Idempotency-Key') }); return accepted() } })
})

test('a flexible day remains optional and the email says it has not been chosen', async () => {
  let email: any
  await fixture(async call => {
    const prepared = await call({ ...answer, preferredDay: null, intent: 'prepare' })
    assert.equal(prepared.status, 200)
    assert.equal((await call({ ...answer, preferredDay: null, intent: 'submit', submissionToken: prepared.body.submissionToken })).status, 200)
    assert.ok(email.text.includes('Өдөр сонгоогүй.')); assert.ok(email.html.includes('Өдөр сонгоогүй.'))
  }, { fetch: async (_, init) => { email = JSON.parse(String(init?.body)); return accepted() } })
})

test('Canvas art is accepted as the fifth option and its real title is sent to the configured recipient', async () => {
  let email: any
  const input = { ...answer, selectedDateId: 'canvas', selectedDateTitle: 'untrusted browser title' }
  await fixture(async call => {
    const prepared = await call({ ...input, intent: 'prepare' })
    assert.equal(prepared.status, 200)
    assert.equal((await call({ ...input, intent: 'submit', submissionToken: prepared.body.submissionToken })).status, 200)
    assert.deepEqual(email.to, [configured.NOTIFICATION_EMAIL])
    assert.ok(email.text.includes('Canvas art')); assert.ok(email.html.includes('Canvas art'))
    assert.ok(!email.text.includes('untrusted browser title')); assert.ok(!email.html.includes('untrusted browser title'))
  }, { fetch: async (_, init) => { email = JSON.parse(String(init?.body)); return accepted() } })
})
