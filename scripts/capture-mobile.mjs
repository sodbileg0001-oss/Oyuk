import { mkdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { chromium } from '@playwright/test'

const root = fileURLToPath(new URL('../', import.meta.url))
const base = 'http://127.0.0.1:5173'
const output = path.join(root, 'qa')
let ownedServer
let browser

async function ready() {
  try { return (await fetch(base, { signal: AbortSignal.timeout(1000) })).ok } catch { return false }
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map(image => { image.loading = 'eager'; return image.decode().catch(() => {}) }))
  })
}

try {
  await mkdir(output, { recursive: true })
  if (!await ready()) {
    ownedServer = spawn(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '5173', '--strictPort'], { cwd: root, windowsHide: true, stdio: 'ignore' })
    const deadline = Date.now() + 30_000
    while (!await ready()) {
      if (Date.now() > deadline || ownedServer.exitCode !== null) throw new Error('Could not start the local website on port 5173.')
      await new Promise(resolve => setTimeout(resolve, 150))
    }
  }
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const views = []
  async function capture(id, title, note) {
    await settle(page)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: path.join(output, `mobile-${id}-screen.png`) })
    await page.screenshot({ path: path.join(output, `mobile-${id}-full.png`), fullPage: true })
    views.push({ id, title, note, background: await page.evaluate(() => getComputedStyle(document.body).backgroundColor) })
  }
  await page.goto(base)
  await page.locator('.intro').waitFor()
  await capture('letter', 'The little letter', 'A little Mongolian, a little English.')
  await page.getByRole('button', { name: 'Захиагаа нээх', exact: true }).first().click()
  await page.locator('.folder-grid').waitFor()
  await capture('options', 'Four little worlds', 'Your photos, waiting in their folders.')
  for (const [id, title, note] of [
    ['chess', 'e4 Chess Bar', 'Rust-orange branding, softened to terracotta paper'],
    ['theatre', 'Амьтны ферм жүжиг', 'Slate stage backdrops & red costume details'],
    ['exhibition', 'Социализмаар аялцгаая', 'Aged exhibit labels, ochre & rust'],
    ['basketball', 'Үндэсний дээд лиг', 'Indigo from the uploaded league schedule'],
  ]) {
    await page.getByRole('button', { name: `${title} — дэлгэрэнгүй`, exact: false }).click()
    await page.locator(`.detail-${id}`).waitFor()
    await capture(id, title, note)
    await page.getByRole('button', { name: 'Бяцхан санаанууд руу буцах' }).first().click()
  }
  await page.getByRole('button', { name: 'нэг асуулт', exact: false }).click()
  await page.locator('.question-card').waitFor()
  await page.getByRole('button', { name: 'Бямба гараг?', exact: true }).click()
  await settle(page)
  await page.screenshot({ path: path.join(output, 'mobile-question-full.png'), fullPage: true })

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your mobile preview</title><style>
  *{box-sizing:border-box}body{margin:0;padding:40px 28px;background:#f3ece7;color:#493b45;font-family:Arial,sans-serif}header{max-width:1000px;margin:0 auto 30px;display:flex;justify-content:space-between;align-items:end;gap:24px}h1{font:italic 35px Georgia,serif;margin:8px 0 0}header p{font-size:12px;line-height:1.8;margin:0}small{font-size:9px;letter-spacing:2px;color:#854658}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px 30px;max-width:1000px;margin:auto}article{min-width:0}h2{font:19px Georgia,serif;margin:0 0 7px}article p{font-size:11px;margin:0 0 14px;color:#76616e}.phone{border:7px solid #4a3b45;border-radius:24px;overflow:hidden;box-shadow:0 8px 18px #493b4514;background:#4a3b45}.phone img{display:block;width:100%;height:auto}a{color:inherit;text-underline-offset:4px}footer{max-width:1000px;margin:30px auto 0;font-size:12px;line-height:1.8}a:focus-visible{outline:2px solid #854658;outline-offset:4px}@media(max-width:750px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}header{display:block}header p{margin-top:14px}h2{font-size:16px}}@media(max-width:450px){.grid{grid-template-columns:1fr}body{padding:28px}h1{font-size:30px}}</style></head><body><header><div><small>CHAMD. / MOBILE PREVIEW</small><h1>Six little views, just for you.</h1></div><p>Actual website screenshots · 390 × 844<br>Open any phone to see the full page.</p></header><main class="grid">${views.map(view => `<article><h2>${view.title}</h2><p>${view.note}</p><a class="phone" style="display:block" href="mobile-${view.id}-full.png" aria-label="Open the full ${view.title} mobile screenshot"><img src="mobile-${view.id}-screen.png" alt="Mobile layout of ${view.title}"></a></article>`).join('')}</main><footer><a href="mobile-question-full.png">See the final invitation on mobile →</a><br>No response was submitted while capturing these previews.</footer></body></html>`
  await writeFile(path.join(output, 'mobile-preview.html'), html)
  await writeFile(path.join(output, 'mobile-preview.json'), JSON.stringify({ viewport: { width: 390, height: 844 }, views }, null, 2) + '\n')
  const board = await context.newPage()
  await board.setViewportSize({ width: 1120, height: 1000 })
  await board.goto(`${base}/qa/mobile-preview.html`)
  await settle(board)
  await board.screenshot({ path: path.join(output, 'mobile-preview.png'), fullPage: true })
  console.log('Mobile previews ready: qa/mobile-preview.html, qa/mobile-preview.png, and full-page screenshots of all four dates.')
} finally {
  await browser?.close()
  ownedServer?.kill()
}
