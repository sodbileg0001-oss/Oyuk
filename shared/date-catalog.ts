/** The authoritative IDs/titles are shared by the UI and the server. */
export const dateCatalog = {
  chess: 'e4 Chess Bar',
  theatre: 'Амьтны ферм жүжиг',
  exhibition: 'Социализмаар аялцгаая',
  basketball: 'Үндэсний дээд лиг',
} as const

export type DateId = keyof typeof dateCatalog
export function isDateId(value: unknown): value is DateId {
  return typeof value === 'string' && Object.hasOwn(dateCatalog, value)
}

export const permittedResponses = ['yes', 'maybe', 'no'] as const
export type InvitationResponse = typeof permittedResponses[number]
export const responseLabels: Record<InvitationResponse, string> = {
  yes: 'Тийм ээ, хамт болзъё! ♡',
  maybe: 'Жаахан бодох хугацаа өгөөч',
  no: 'Энэ удаа амжихгүй нь',
}
export const MAX_MESSAGE_LENGTH = 1000
