import { dates, type DateId } from '../data/dates'
import { DateFolder } from './DateFolder'
import { Arrow, Heart } from './Illustrations'

export function DateFolderGrid({ visited, selected, onOpen, onQuestion }: { visited: DateId[]; selected: DateId | null; onOpen: (id: DateId) => void; onQuestion: () => void }) {
  return <section className="options page-enter" aria-labelledby="options-heading">
    <div className="section-heading"><div><p className="eyebrow">ХАМТДАА ӨНГӨРҮҮЛЭХ ЦАГИЙН ТУХАЙ</p><h1 id="options-heading" tabIndex={-1}>Дөрвөн бяцхан санаа.<br /><em>Хамгийн гоё нь — хоёулаа.</em></h1></div><div className="options-margin"><span className="handwritten">аль нь бид хоёрт тохирох бол?</span><div className="explore-progress" aria-label={`4 санаанаас ${visited.length}-ыг үзлээ`}><span>{dates.map(date => <i key={date.id} className={visited.includes(date.id) ? 'is-seen' : ''} />)}</span><small>{visited.length} / 4 САНААГ ҮЗЛЭЭ</small></div></div></div>
    <p className="options-intro">Чамтай хамт хийх хэдэн санаа бэлдлээ. Хавтас бүрийг нээгээд,<br className="desktop-break" /> юу нь чамд таалагдахыг сонирхоорой. Аль нь ч гоё.</p>
    <div className="folder-grid">{dates.map(date => <DateFolder key={date.id} date={date} seen={visited.includes(date.id)} selected={date.id === selected} onOpen={() => onOpen(date.id)} />)}</div>
    <div className="options-ending"><Heart /><p>Үнэндээ эдний хамгийн гоё нь<br /><em>чамтай хамт байх.</em></p><button className="text-link" onClick={onQuestion}>Чамаас нэг зүйл асуух гэсэн юм <Arrow /></button></div>
  </section>
}
