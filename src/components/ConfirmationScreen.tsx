import type { DateIdea } from '../data/dates'
import type { InvitationResponse } from '../../shared/date-catalog'
import { Arrow, Confetti, Flower, Heart } from './Illustrations'
import { Photo } from './Photo'

export function ConfirmationScreen({ selected, response, onBack, onDetail }: { selected?: DateIdea; response: InvitationResponse; onBack: () => void; onDetail: () => void }) {
  const yes = response === 'yes'
  const headline = yes ? <>Тэгвэл…<br /><em>болзоо шүү!</em></> : response === 'maybe' ? <>Яарах зүйлгүй.<br /><em>Бодоод үзээрэй.</em></> : <>Ойлголоо.<br /><em>Баярлалаа.</em></>
  return <section className="confirmation page-enter" aria-labelledby="confirmation-heading">
    {yes && <Confetti />}
    <div className="confirmation-title">
      <span className="handwritten">{yes ? 'одоо инээмсэглэхээ больж чадахгүй нь.' : 'хариугаа үлдээсэнд баярлалаа ♡'}</span>
      <div className="confirmation-doodle">{yes ? <Heart filled /> : <Flower />}<span /></div>
      <p className="eyebrow">ХАРИУГ ЧИНЬ ХҮЛЭЭЖ АВЛАА</p>
      <h1 id="confirmation-heading" tabIndex={-1}>{headline}</h1>
      <p>{yes ? <>Намайг ямар их баярлуулсныг чи мэдэхгүй дээ.<br />Хамтдаа гоё дурсамж бүтээе.</> : response === 'maybe' ? 'Хэрэгтэй хугацаагаа аваарай. Чиний хариуг хүндэтгэнэ ээ.' : 'Үнэнээ хэлсэнд баярлалаа. Чамд сайхан бүхнийг хүсье.'}</p>
    </div>
    {selected ? <div className={`confirmation-recap recap-${selected.id}`}>
      <div className="recap-photo"><Photo photo={selected.cover} eager /></div>
      <div className="recap-copy"><span className="eyebrow">{yes ? 'БИДНИЙ БЯЦХАН ТӨЛӨВЛӨГӨӨ' : 'СОНИРХСОН БЯЦХАН САНАА'} · {selected.number}</span><h2 lang={selected.id === 'chess' ? 'en' : 'mn'}>{selected.title}</h2><p>{selected.timing}</p><span className="handwritten">{yes ? 'яг өдрөө хамтдаа тохиръё.' : 'хариунд чинь энэ санааг тэмдэглэлээ.'}</span><button className="text-link" onClick={onDetail}>Санаагаа дахин харах <Arrow /></button></div>
      <Heart className="recap-heart" />
    </div> : yes && <div className="no-plan-note"><Flower /><p>Хэнтэй гэдэг нь шийдэгдлээ.<br /><em>Хаашаа гэдгээ хамтдаа сонгоё.</em></p></div>}
    <div className="confirmation-actions"><button className="button button-primary" onClick={onBack}>Бяцхан санаануудыг дахин харах <Arrow /></button>{yes && <span className="handwritten">хүлээх нэг хөөрхөн зүйлтэй болчихлоо ♡</span>}</div>
  </section>
}
