import manifest from './source-manifest.json'
import { dateCatalog, type DateId } from '../../shared/date-catalog'
export type { DateId } from '../../shared/date-catalog'

export type DatePhoto = { src: string; filename: string; alt: string; width?: number; height?: number }
export type DateIdea = {
  id: DateId; number: string; title: string; subtitle: string; category: string
  teaser: string; introduction: string; annotation: string; timing: string; sourceTiming: string
  palette: { paper: string; ink: string; accent: string; background: string }
  photos: DatePhoto[]; cover: DatePhoto; links: { href: string; label: string }[]
}

const artDirection = {
  chess: {
    subtitle: 'Дараагийн нүүдэл чинийх.', category: 'YOUR MOVE, MY DEAR',
    teaser: 'Хэдэн нүүдэл. Хөөрхөн яриа. Хоёулаа.',
    introduction: 'e4 Chess Bar-д хамтдаа цаг өнгөрөөх үү? Дунд маань шатрын хөлөг, дэргэд минь чи. Дараагийн нүүдлээ яаралгүй бодож, тухтай ярилцъя.',
    annotation: 'your move, my dear ♡',
    palette: { paper: '#efd8c1', ink: '#603b2b', accent: '#964524', background: '#f4e6d8' }, coverIndex: 2,
    alts: ['Терракот өнгийн дэвсгэр дээрх e4 Chess Bar-ийн лого', 'Шатрын дүрс, e4 Chess Bar-ийн таних тэмдэгтэй улбар шар постер', 'Шатрын хөлөг, уух зүйлтэй e4 Chess Bar-ийн шатрын үдшийн зураг'],
    linkLabels: ['e4-ийн Instagram', 'e4-ийг сонирхоё', 'Бас нэг бяцхан танилцуулга'],
  },
  theatre: {
    subtitle: 'Нэг түүх, зэрэгцээ хоёр суудал.', category: 'AN EVENING AT THE THEATRE',
    teaser: 'Гэрэл бүдгэрч, түүх эхэлнэ.',
    introduction: '“Амьтны ферм” жүжгийг хамт үзье. Зэрэгцэж суугаад нэг түүхийг хуваалцаж, дараа нь сэтгэгдлээ ярилцах гоё байх, тийм үү?',
    annotation: 'save me the seat next to you',
    palette: { paper: '#d8e0e6', ink: '#273c51', accent: '#713d51', background: '#e8edf2' }, coverIndex: 2,
    alts: ['Өнгөлөг нөмрөгтэй дүрийг харуулсан Амьтны ферм жүжгийн постер', 'Модон сандал дээр суусан дүртэй Амьтны ферм жүжгийн постер', 'Жүжгийн нэр болон дүрүүдийг харуулсан Амьтны фермийн хамт олны постер', 'Цайвар даашинзтай дүр бүхий Амьтны ферм жүжгийн постер', 'Давхарласан чемодан үүрсэн дүртэй Амьтны ферм жүжгийн постер', 'Ягаан сандал дээр суусан дүртэй Амьтны ферм жүжгийн постер', 'Ном тэвэрсэн дүртэй Амьтны ферм жүжгийн постер', 'Сонин уншиж буй хонин дүртэй Амьтны ферм жүжгийн постер'], linkLabels: [],
  },
  exhibition: {
    subtitle: 'Өнгөрсөн рүү хийх бяцхан аялал.', category: 'A LITTLE TIME TRAVEL',
    teaser: 'Хуучны түүх. Шинэхэн дурсамж.',
    introduction: '“Социализмаар аялцгаая” үзэсгэлэнгээр хамтдаа алхъя. Өөр нэгэн үеийн эд зүйлсийг сонирхож, юу нь бидний анхаарлыг татахыг үзье.',
    annotation: 'a little time travel, together',
    palette: { paper: '#eadfbc', ink: '#584b2e', accent: '#84502e', background: '#f4eedc' }, coverIndex: 1,
    alts: ['Социализмын үеийн амттан, савласан ундааны үзмэр', 'Хээтэй хивс, зурагт, гитар болон ахуйн эд зүйлтэй хуучны өрөөний үзмэр', 'Социализмаар аялцгаая үзэсгэлэнгийн танилцуулга постер', 'Уран хийцтэй төмөр эдлэл болон түүхэн эд зүйлсийн үзмэр', 'Хуучны хөрөгтэй товхимол, мөнгөн тэмдэгтийн үзмэр', 'Өнгөлөг авдар, тавилга болон хуучны ахуйн эд зүйлс бүхий монгол гэрийн үзмэр', 'Жинлүүр, савласан хүнстэй хуучны дэлгүүрийн үзмэр'], linkLabels: ['Үзэсгэлэнгийн тухай'],
  },
  basketball: {
    subtitle: 'Хоёулаа нэг баг.', category: 'ON THE SAME TEAM',
    teaser: 'Гоё тоглолт. Сайхан хань. Хоёулаа.',
    introduction: 'Үндэсний дээд лигийн сагсан бөмбөгийн тоглолтыг хамт үзэх үү? Хамтдаа догдолж, багаа дэмжээд, нэг оройг хөгжилтэй өнгөрөөе.',
    annotation: 'you + me, same team ♡',
    palette: { paper: '#d5e5e5', ink: '#1e444c', accent: '#94502c', background: '#e3eff0' }, coverIndex: 0,
    alts: ['Үндэсний дээд лигийн багуудын лого, тоглолтуудын хуваарь бүхий хөх дэвсгэртэй зураг'], linkLabels: ['Лигийн Facebook хуудас'],
  },
} satisfies Record<DateId, object>

function localizeTiming(value: string) {
  if (/^anytime$/i.test(value)) return 'Хоёуланд маань тохирох өдөр'
  if (/^Since October 30th$/i.test(value)) return '10-р сарын 30-наас'
  if (/^Until November 19th$/i.test(value)) return '11-р сарын 19 хүртэл'
  return value
}

export const dates: DateIdea[] = manifest.map((source, index) => {
  const id = source.id as DateId
  const direction = artDirection[id]
  const note = source.notes.map(item => item.text).join('\n\n')
  const sourceTiming = note.match(/Possible date time:\s*([^\r\n]+)/i)?.[1]?.trim() ?? 'Хамтдаа шийдье'
  const photos = source.images.map((image, i) => ({ ...image, alt: direction.alts[i] ?? `${source.folder} — зураг ${i + 1}` }))
  const urls = [...note.matchAll(/https?:\/\/[^\s]+/g)].map(match => match[0])
  return { id, number: String(index + 1).padStart(2, '0'), ...direction, title: dateCatalog[id], timing: localizeTiming(sourceTiming), sourceTiming, photos, cover: photos[direction.coverIndex] ?? photos[0], links: urls.map((href, i) => ({ href, label: direction.linkLabels[i] ?? 'Дэлгэрэнгүй үзэх' })) }
})

export function getDate(id: string | null): DateIdea | undefined { return dates.find(date => date.id === id) }
