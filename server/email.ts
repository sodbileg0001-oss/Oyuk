import { dateCatalog, responseLabels, type DateId, type InvitationResponse } from '../shared/date-catalog.js'
import type { ServerConfig } from './guards.js'
import { formatPreferredDay } from '../shared/preferred-day.js'

export type Answer = { response: InvitationResponse; selectedDateId: DateId | null; message: string; preferredDay?: string }
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}

/** Every value is deterministic for a signed ticket, including the server timestamp. */
export function createEmail(answer: Answer, receivedAt: string, submissionId: string, config: ServerConfig) {
  const title = answer.selectedDateId ? dateCatalog[answer.selectedDateId] : 'Болзооны санаа сонгоогүй.'
  const response = `${answer.response.toUpperCase()} — ${responseLabels[answer.response]}`
  const message = answer.message || 'Зурвас үлдээгээгүй.'
  const preferredDay = answer.preferredDay ? `${formatPreferredDay(answer.preferredDay)} (${answer.preferredDay}) — санал болгосон өдөр, цагийг хамтдаа тохирно.` : 'Өдөр сонгоогүй. Дараа нь хамтдаа тохирно.'
  const localTime = new Intl.DateTimeFormat('mn-MN', { timeZone: 'Asia/Ulaanbaatar', dateStyle: 'long', timeStyle: 'short' }).format(new Date(receivedAt))
  const text = `Болзооны урилгад чинь хариу ирлээ!\n\nХариу: ${response}\nСонгосон болзоо: ${title}\nСанал болгосон өдөр: ${preferredDay}\nЗурвас: ${message}\n\nХүлээн авсан цаг: ${localTime} (Улаанбаатар)\n${receivedAt}\nСайт: ${config.siteUrl}\nХариуны дугаар: ${submissionId}`
  const safe = { response: escapeHtml(response), title: escapeHtml(title), preferredDay: escapeHtml(preferredDay), message: escapeHtml(message), localTime: escapeHtml(localTime), url: escapeHtml(config.siteUrl) }
  const html = `<!doctype html><html lang="mn"><head><meta charset="utf-8"></head><body style="margin:0;background:#f7f1ea;color:#493b45;font-family:Arial,sans-serif"><table role="presentation" style="width:100%;padding:32px 16px"><tr><td align="center"><table role="presentation" style="width:100%;max-width:560px;background:#fffcf8;border:1px solid #d9c9c9;padding:32px"><tr><td><p style="color:#854658;font-size:12px;letter-spacing:2px">ЧАМД ИРСЭН БЯЦХАН ХАРИУ ♡</p><h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.3">Болзооны урилгад чинь<br>хариу ирлээ!</h1><p><strong>Хариу</strong><br>${safe.response}</p><p><strong>Сонгосон болзоо</strong><br>${safe.title}</p><p><strong>Санал болгосон өдөр</strong><br>${safe.preferredDay}</p><p><strong>Бяцхан зурвас</strong></p><p style="white-space:pre-wrap;background:#eee5e9;padding:16px;overflow-wrap:anywhere">${safe.message}</p><hr style="border:0;border-top:1px solid #e0d6d8;margin:24px 0"><p style="font-size:12px;color:#655665">Хүлээн авсан цаг: ${safe.localTime} (Улаанбаатар)<br>${escapeHtml(receivedAt)}<br>Хариуны дугаар: ${escapeHtml(submissionId)}</p><p><a href="${safe.url}" style="color:#854658">${safe.url}</a></p></td></tr></table></td></tr></table></body></html>`
  return { from: config.sender, to: [config.recipient], subject: '💌 Болзооны урилгад чинь хариу ирлээ!', text, html }
}
