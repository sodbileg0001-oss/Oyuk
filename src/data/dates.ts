import manifest from './source-manifest.json'
import { dateCatalog, type DateId } from '../../shared/date-catalog'
export type { DateId } from '../../shared/date-catalog'

export type DatePhoto = { src: string; filename: string; alt: string; width?: number; height?: number }
export type DateIdea = {
  id: DateId; number: string; title: string; titleLanguage: 'en' | 'mn'; subtitle: string; category: string
  teaser: string; introduction: string; annotation: string; timing: string; sourceTiming: string
  palette: { paper: string; ink: string; accent: string; background: string; pageInk?: string; pageAccent?: string }
  photos: DatePhoto[]; cover: DatePhoto; links: { href: string; label: string }[]
}

const artDirection = {
  chess: {
    subtitle: 'Дараагийн нүүдэл чинийх.', category: 'YOUR MOVE, MY DEAR',
    teaser: 'Хэдэн нүүдэл. Хөөрхөн яриа. Хоёулаа.',
    introduction: 'e4 Chess Bar-д хамтдаа цаг өнгөрөөх үү? Дунд маань шатрын хөлөг, дэргэд минь чи. Дараагийн нүүдлээ яаралгүй бодож, тухтай ярилцъя.',
    annotation: 'your move, my dear ♡',
    // Burnt orange keeps white text above 5:1 contrast on the folder and page.
    palette: { paper: '#b54d1c', ink: '#ffffff', accent: '#ffffff', background: '#b54d1c' }, coverIndex: 2,
    alts: ['Терракот өнгийн дэвсгэр дээрх e4 Chess Bar-ийн лого', 'Шатрын дүрс, e4 Chess Bar-ийн таних тэмдэгтэй улбар шар постер', 'Шатрын хөлөг, уух зүйлтэй e4 Chess Bar-ийн шатрын үдшийн зураг'],
    linkLabels: ['e4-ийн Instagram', 'e4-ийг сонирхоё', 'Бас нэг бяцхан танилцуулга'],
  },
  theatre: {
    subtitle: 'Нэг түүх, зэрэгцээ хоёр суудал.', category: 'AN EVENING AT THE THEATRE',
    teaser: 'Гэрэл бүдгэрч, түүх эхэлнэ.',
    introduction: '“Амьтны ферм” жүжгийг хамт үзье. Зэрэгцэж суугаад нэг түүхийг хуваалцаж, дараа нь сэтгэгдлээ ярилцах гоё байх, тийм үү?',
    annotation: 'save me the seat next to you',
    // Slate stage backdrops (#303050, #305050) and red costume details.
    palette: { paper: '#c6cfd8', ink: '#2f354b', accent: '#713b3e', background: '#dce2e8' }, coverIndex: 2,
    alts: ['Өнгөлөг нөмрөгтэй дүрийг харуулсан Амьтны ферм жүжгийн постер', 'Модон сандал дээр суусан дүртэй Амьтны ферм жүжгийн постер', 'Жүжгийн нэр болон дүрүүдийг харуулсан Амьтны фермийн хамт олны постер', 'Цайвар даашинзтай дүр бүхий Амьтны ферм жүжгийн постер', 'Давхарласан чемодан үүрсэн дүртэй Амьтны ферм жүжгийн постер', 'Ягаан сандал дээр суусан дүртэй Амьтны ферм жүжгийн постер', 'Ном тэвэрсэн дүртэй Амьтны ферм жүжгийн постер', 'Сонин уншиж буй хонин дүртэй Амьтны ферм жүжгийн постер'], linkLabels: [],
  },
  exhibition: {
    subtitle: 'Өнгөрсөн рүү хийх бяцхан аялал.', category: 'A LITTLE TIME TRAVEL',
    teaser: 'Хуучны түүх. Шинэхэн дурсамж.',
    introduction: '“Социализмаар аялцгаая” үзэсгэлэнгээр хамтдаа алхъя. Өөр нэгэн үеийн эд зүйлсийг сонирхож, юу нь бидний анхаарлыг татахыг үзье.',
    annotation: 'a little time travel, together',
    // Aged exhibit labels (#d0d0b0, #f0f0d0), ochre rug and painted furniture.
    palette: { paper: '#dfd1a2', ink: '#504527', accent: '#914326', background: '#eee4c6' }, coverIndex: 1,
    alts: ['Социализмын үеийн амттан, савласан ундааны үзмэр', 'Хээтэй хивс, зурагт, гитар болон ахуйн эд зүйлтэй хуучны өрөөний үзмэр', 'Социализмаар аялцгаая үзэсгэлэнгийн танилцуулга постер', 'Уран хийцтэй төмөр эдлэл болон түүхэн эд зүйлсийн үзмэр', 'Хуучны хөрөгтэй товхимол, мөнгөн тэмдэгтийн үзмэр', 'Өнгөлөг авдар, тавилга болон хуучны ахуйн эд зүйлс бүхий монгол гэрийн үзмэр', 'Жинлүүр, савласан хүнстэй хуучны дэлгүүрийн үзмэр'], linkLabels: ['Үзэсгэлэнгийн тухай'],
  },
  basketball: {
    subtitle: 'Хоёулаа нэг баг.', category: 'ON THE SAME TEAM',
    teaser: 'Хамтдаа тоглолт үзье.',
    introduction: 'Үндэсний дээд лигийн сагсан бөмбөгийн тоглолтыг хамт үзэх үү? Хамтдаа догдолж, багаа дэмжээд, нэг оройг хөгжилтэй өнгөрөөе.',
    annotation: 'you + me, same team ♡',
    // Midnight blue from the schedule; light page text and lavender paper details.
    palette: { paper: '#c5cbea', ink: '#25274e', accent: '#3c4390', background: '#101d42', pageInk: '#f5f1e7', pageAccent: '#b8c7ff' }, coverIndex: 0,
    alts: ['Үндэсний дээд лигийн багуудын лого, тоглолтуудын хуваарь бүхий хөх дэвсгэртэй зураг'], linkLabels: ['Лигийн Facebook хуудас'],
  },
  canvas: {
    subtitle: 'Манай бяцхан урлан.', category: 'A LITTLE ART, A LITTLE US',
    teaser: 'Өнгөө сонгоод, дурсамжаа зуръя.',
    introduction: 'Зотон, зурах хэрэгслүүдийг нь бэлдээд чамд өгчихсөн шүү. Одоо хоёулаа өнгөө сонгоод, хүссэн зургаа зурж, нэг хөөрхөн дурсамж бүтээе. Хоёуланд маань тохирох өдөр байхад л болно.',
    annotation: 'a little art, a little us ♡',
    // Lilac canvases, soft greens and butter-yellow paint in the supplied art.
    palette: { paper: '#e1d2e9', ink: '#45374f', accent: '#72517b', background: '#f0e8f2' }, coverIndex: 0,
    coverFilename: 'bb44aea35127b18f6a0efd7555c56a68.jpg',
    // Associate descriptions with the files we inspected, independent of the
    // discovery order (uppercase Screenshot sorts before lowercase filenames).
    alts: [] as string[],
    photoAlts: {
      '4021ae27d8e09259800c6186227c1103.jpg': 'Цайвар нил ягаан зотон дээрх цагаан нугасны бяцхан зураг',
      '432f620bc13f4ed0de29d5f15db1c035.jpg': 'Хар дэвсгэр дээрх шар нугасны зотон зураг',
      '6320573f66e6381610b9550f5d164559.jpg': 'Улаан мөөгөн дээр гитар тоглож буй титэмтэй мэлхийний зураг',
      '969f08061486235418539e1a3ff38d4d.jpg': 'Цэнхэр тэнгэрийн өмнөх Том, Жерри хоёрын зотон зураг',
      'a72966b74e3d2a57dfe033f5774790a4.jpg': 'Цайвар шар дэвсгэр дээр амаа ангайсан муурны зураг',
      'bb44aea35127b18f6a0efd7555c56a68.jpg': 'Жижиг модон суурин дээрх улаан мөөгтэй зотон зураг',
      'blanck_canvas_12x15_2.jpg': 'Ногоон байгаль, модны мөчрөөс дүүжилсэн савлууртай зотон зураг',
      'Screenshot 2026-10-19 001036.png': 'Цэнхэр дэвсгэрийн өмнө сандал дээр суусан оцон шувууны зураг',
    },
    linkLabels: [],
  },
  boardgame: {
    subtitle: 'Тоглоом эхэллээ. Хоёулаа бэлэн үү?', category: 'A LITTLE FRIENDLY COMPETITION',
    teaser: 'Жаахан өрсөлдөөн. Маш их инээд.',
    introduction: 'Хамтдаа Board game тоглох уу? Нэг тоглоомоо сонгоод, дүрмээ хамтдаа ойлгож, хожихоосоо илүү хөгжилдөхөд анхааръя. Ямар тоглоом тоглох, хаана уулзахаа хоёулаа тохиръё.',
    annotation: 'your turn, my favourite person ♡',
    palette: { paper: '#dce2c9', ink: '#2d4030', accent: '#526538', background: '#e8ecdc' }, coverIndex: 7,
    coverFilename: 'images.jpg',
    alts: [] as string[],
    photoAlts: {
      'images (1).jpg': 'Шатар, даам болон нардны модон хөлөг, тоглоомын дүрснүүд',
      'images (2).jpg': 'Sorry, Connect 4, Twister болон бусад Board game-ын хайрцагнууд',
      'images (3).jpg': 'Worms Board game-ын хайрцаг, хөлөг болон дүрснүүд',
      'images (4).jpg': 'Улаан хайрцагтай Mahabharata Board game',
      'images (5).jpg': 'Catan Board game-ын хайрцаг',
      'images (6).jpg': 'Ногоон дэвсгэр дээрх Tetris болон Sushi Go тоглоомын хайрцагнууд',
      'images (7).jpg': 'Модон даамны хөлөг дээрх хар, цагаан даамнууд',
      'images.jpg': 'Monopoly, Sleeping Queens, даам, нард болон шатрын тоглоомын цуглуулга',
    },
    linkLabels: ['Тоглоомын тухай Instagram пост'],
  },
  clayface: {
    subtitle: 'Нэг кино, зэрэгцээ хоёр суудал.', category: 'A MOVIE NIGHT FOR TWO',
    teaser: 'Дэлгэцэн дээр кино. Дэргэд минь чи.',
    introduction: 'Clayface киног хамт үзэх үү? Зэрэгцэж суугаад, нэг түүхийг хамтдаа үзэж, дараа нь сэтгэгдлээ ярилцъя. Үзэх боломж, өдөр, цагаа хоёулаа шалгаад тохиръё.',
    annotation: 'save me the seat next to you ♡',
    palette: { paper: '#302423', ink: '#fff3df', accent: '#f0b493', background: '#241b1b', pageInk: '#fff3df', pageAccent: '#f0b493' }, coverIndex: 0,
    coverFilename: 'b6ecvb8oo2.webp',
    alts: [] as string[],
    photoAlts: {
      'b6ecvb8oo2.webp': 'Clayface нэртэй, нүүрний хажуу талаас харуулсан хар, улаан кино постер',
      'images (1).jpg': 'Улаан, хар өнгөөр хуваасан эрэгтэй хүний нүүртэй Clayface постер',
      'images (2).jpg': 'Цагаан дэвсгэр, нүүрний хэсгүүд болон улаан дүрстэй Clayface постер',
      'images (3).jpg': 'Улаан хүрээтэй, хайлж буй нүүр болон гэрэлтэй Clayface постер',
      'images (4).jpg': 'Нүүрэндээ гараа хүргэсэн ногоон нүдтэй дүрийн Clayface постер',
      'images (5).jpg': 'Олон нүүр давхарласан улаан, бор өнгийн Clayface постер',
      'images (6).jpg': 'Хайлж буй нүүртэй, бараан дэвсгэртэй Clayface постер',
      'images.jpg': 'Хар дэвсгэр дээр хашгирч буй дүртэй Clayface постер',
    },
    linkLabels: [],
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
  const photoAlts: Record<string, string> = 'photoAlts' in direction ? direction.photoAlts : {}
  const photos = source.images.map((image, i) => ({ ...image, alt: photoAlts[image.filename] ?? direction.alts[i] ?? `${source.folder} — зураг ${i + 1}` }))
  const coverFilename = 'coverFilename' in direction ? direction.coverFilename : undefined
  const urls = [...note.matchAll(/https?:\/\/[^\s]+/g)].map(match => match[0])
  return { id, number: String(index + 1).padStart(2, '0'), ...direction, title: dateCatalog[id], titleLanguage: ['chess', 'canvas', 'boardgame', 'clayface'].includes(id) ? 'en' : 'mn', timing: localizeTiming(sourceTiming), sourceTiming, photos, cover: photos.find(photo => photo.filename === coverFilename) ?? photos[direction.coverIndex] ?? photos[0], links: urls.map((href, i) => ({ href, label: direction.linkLabels[i] ?? 'Дэлгэрэнгүй үзэх' })) }
})

export function getDate(id: string | null): DateIdea | undefined { return dates.find(date => date.id === id) }
