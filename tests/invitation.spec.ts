import { expect, test, type Page } from '@playwright/test'

const names = ['e4 Chess Bar', 'Амьтны ферм жүжиг', 'Социализмаар аялцгаая', 'Үндэсний дээд лиг']
const counts = [3, 8, 7, 1]
const explore = (page: Page, name: string) => page.getByRole('button', { name: `${name} — дэлгэрэнгүй`, exact: false })
const back = (page: Page) => page.getByRole('button', { name: 'Бяцхан санаанууд руу буцах' }).first()

async function openLetter(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Захиагаа нээх', exact: true }).first().click()
  await expect(page.locator('.date-folder')).toHaveCount(4)
}
async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map(image => { image.loading = 'eager'; return image.decode().catch(() => {}) }))
    await Promise.all(document.getAnimations().filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {})))
  })
}
async function mockApi(page: Page, failSubmissions = 0) {
  const calls: Record<string, any>[] = []
  let sequence = 0
  await page.route('**/api/submit-response', async route => {
    const body = route.request().postDataJSON()
    calls.push(body)
    if (body.intent === 'prepare') {
      sequence++
      return route.fulfill({ json: { ok: true, stage: 'prepared', submissionToken: `test-ticket-${sequence}`, submissionId: `test-receipt-${sequence}` } })
    }
    await new Promise(resolve => setTimeout(resolve, 80))
    if (failSubmissions-- > 0) return route.fulfill({ status: 502, json: { ok: false, code: 'DELIVERY_UNCONFIRMED', message: 'Жижигхэн саатал гарлаа. Дахин оролдоорой. ♡' } })
    return route.fulfill({ json: { ok: true, stage: 'submitted', submissionId: body.submissionToken.replace('test-ticket', 'test-receipt') } })
  })
  return calls
}

test('all four real date galleries, images, focus management and navigation remain intact', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  const calls = await mockApi(page)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await openLetter(page)
  for (const [index, name] of names.entries()) {
    await explore(page, name).click()
    await expect(page.locator('h1')).toHaveText(name)
    await expect(page.locator('h1')).toBeFocused()
    await expect(page.locator('.gallery-photo')).toHaveCount(counts[index])
    await settle(page)
    for (const image of await page.locator('img').all()) expect(await image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    const first = page.locator('.gallery-photo').first()
    await first.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Зургийг хаах' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true)
    await page.keyboard.press('Tab')
    if (counts[index] > 1) { await page.keyboard.press('ArrowRight'); await expect(page.locator('.lightbox-toolbar')).toContainText(`2 / ${counts[index]}`) }
    await page.keyboard.press('Escape')
    await expect(first).toBeFocused()
    await settle(page)
    await page.screenshot({ path: `qa/mn-detail-${index + 1}.png`, fullPage: true })
    await back(page).click()
    await expect(page.getByLabel(`4 санаанаас ${index + 1}-ыг үзлээ`)).toBeVisible()
  }
  expect(calls).toEqual([]); expect(errors).toEqual([])
  await settle(page)
  await page.screenshot({ path: 'qa/mn-options-desktop.png', fullPage: true })
})

test('selection sends nothing; explicit submit confirms the real selected date; reload never resends', async ({ page }) => {
  const calls = await mockApi(page)
  await openLetter(page)
  await explore(page, names[0]).click()
  await page.getByRole('button', { name: 'Энэ болзоог сонгоё' }).first().click()
  await expect(page.locator('.question-card')).toBeVisible()
  expect(calls.length).toBe(0)
  await page.getByLabel('Надад үлдээх бяцхан зурвас').fill('Үнэхээр гоё санаа байна. Хамтдаа явъя ♡')
  await page.locator('.response-form').evaluate(form => { (form as HTMLFormElement).requestSubmit(); (form as HTMLFormElement).requestSubmit() })
  await expect(page.locator('.confirmation')).toBeVisible()
  expect(calls).toHaveLength(2)
  expect(calls[1]).toMatchObject({ intent: 'submit', selectedDateId: 'chess', response: 'yes', message: 'Үнэхээр гоё санаа байна. Хамтдаа явъя ♡' })
  await expect(page.locator('.confirmation-recap')).toContainText(names[0])
  await page.reload()
  await expect(page.locator('.confirmation-recap')).toContainText(names[0])
  expect(calls).toHaveLength(2)
  await page.getByRole('button', { name: 'Бяцхан санаануудыг дахин харах' }).click()
  await explore(page, names[2]).click()
  await page.getByRole('button', { name: 'Энэ болзоог сонгоё' }).first().click()
  expect(calls).toHaveLength(2)
  await page.getByRole('button', { name: 'Хариугаа илгээх', exact: true }).click()
  await expect(page.locator('.confirmation-recap')).toContainText(names[2])
  expect(calls[3].selectedDateId).toBe('exhibition')
})

test('failed submission never shows success; refresh preserves the ticket and retry uses the same payload', async ({ page }) => {
  const calls = await mockApi(page, 1)
  await openLetter(page)
  await page.getByRole('button', { name: 'нэг асуулт', exact: false }).click()
  await page.getByLabel('Надад үлдээх бяцхан зурвас').fill('Өөрийнхөөрөө хариулж байна ♡')
  await page.getByRole('button', { name: 'Хариугаа илгээх', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('саатал')
  await expect(page.locator('.confirmation')).toHaveCount(0)
  expect(calls).toHaveLength(2)
  const failed = calls[1]
  await page.reload()
  await expect(page.locator('.question-card')).toBeVisible()
  await expect(page.getByLabel('Надад үлдээх бяцхан зурвас')).toHaveValue('Өөрийнхөөрөө хариулж байна ♡')
  expect(calls).toHaveLength(2)
  await page.getByRole('button', { name: 'Дахин оролдох' }).click()
  await expect(page.locator('.confirmation')).toBeVisible()
  expect(calls).toHaveLength(3); expect(calls[2]).toEqual(failed)
  await expect(page.locator('.confirmation-recap')).toHaveCount(0)
})

for (const [value, label, heading] of [['maybe', 'Жаахан бодох хугацаа өгөөч', 'Бодоод үзээрэй.'], ['no', 'Энэ удаа амжихгүй нь', 'Баярлалаа.']]) {
  test(`a ${value} response stays accurate and respectful`, async ({ page }) => {
    const calls = await mockApi(page)
    await openLetter(page)
    await page.getByRole('button', { name: 'нэг асуулт', exact: false }).click()
    await page.getByRole('radio', { name: label }).check()
    await page.getByRole('button', { name: 'Хариугаа илгээх', exact: true }).click()
    await expect(page.locator('.confirmation h1')).toContainText(heading)
    await expect(page.locator('.confetti')).toHaveCount(0)
    expect(calls[1]).toMatchObject({ response: value, selectedDateId: null })
  })
}

test('a real local API request reports missing configuration as JSON and the visitor sees a retry', async ({ page, request }) => {
  const response = await request.post('/api/submit-response', { data: { intent: 'prepare', response: 'yes', selectedDateId: null } })
  expect(response.status()).toBe(503)
  expect(await response.json()).toMatchObject({ ok: false, code: 'CONFIGURATION_REQUIRED' })
  await openLetter(page)
  await page.getByRole('button', { name: 'нэг асуулт', exact: false }).click()
  await page.getByRole('button', { name: 'Хариугаа илгээх', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('хараахан бэлэн болоогүй')
  await expect(page.getByRole('button', { name: 'Дахин оролдох' })).toBeEnabled()
  await expect(page.locator('.confirmation')).toHaveCount(0)
})

test('hash deep links survive the opening letter and Mongolian fonts load', async ({ page }) => {
  await page.goto('/#exhibition')
  await page.getByRole('button', { name: 'Захиагаа нээх', exact: true }).first().click()
  await expect(page.locator('h1')).toHaveText(names[2])
  await page.reload()
  await expect(page.locator('h1')).toHaveText(names[2])
  await settle(page)
  await page.evaluate(async () => {
    await document.fonts.load('400 20px "Noto Serif"', 'ҮүӨө')
    await document.fonts.load('400 16px "Noto Sans"', 'ҮүӨө')
  })
  expect(await page.evaluate(() => document.fonts.check('400 20px "Noto Serif"', 'ҮүӨө'))).toBe(true)
  expect(await page.evaluate(() => document.fonts.check('400 16px "Noto Sans"', 'ҮүӨө'))).toBe(true)
})

for (const width of [360, 390, 768, 1440]) {
  test(`Mongolian layouts and submission fit ${width}px with reduced motion`, async ({ page }) => {
    const calls = await mockApi(page)
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1024 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await settle(page)
    if (width === 390 || width === 1440) await page.screenshot({ path: `qa/mn-intro-${width}.png`, fullPage: true })
    async function noOverflow() { expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true) }
    await noOverflow()
    await page.getByRole('button', { name: 'Захиагаа нээх', exact: true }).first().click()
    await noOverflow()
    if (width === 390) { await settle(page); await page.screenshot({ path: 'qa/mn-options-mobile.png', fullPage: true }) }
    for (const name of names) { await explore(page, name).click(); await noOverflow(); await back(page).click() }
    await explore(page, names[1]).click()
    await page.getByRole('button', { name: 'Энэ болзоог сонгоё' }).first().click()
    await noOverflow()
    if (width === 390) await page.screenshot({ path: 'qa/mn-question-mobile.png', fullPage: true })
    await page.getByRole('button', { name: 'Хариугаа илгээх', exact: true }).click()
    await expect(page.locator('.confirmation')).toBeVisible()
    await noOverflow()
    await expect(page.locator('.confetti')).toHaveCSS('display', 'none')
    if (width === 390) { await settle(page); await page.screenshot({ path: 'qa/mn-confirmation-mobile.png', fullPage: true }) }
    expect(calls).toHaveLength(2)
    await page.getByRole('button', { name: 'Захиаг эхнээс нь үзэх' }).click()
    await expect(page.locator('.intro')).toBeVisible()
  })
}
