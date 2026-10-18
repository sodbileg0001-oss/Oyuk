import { Flower, Heart } from './Illustrations'

type Props = { intro: boolean; onHome: () => void; onQuestion: () => void; onRestart: () => void; accepted: boolean; locked?: boolean }
export function Navigation({ intro, onHome, onQuestion, onRestart, accepted, locked }: Props) {
  return <header className="site-header"><div className="header-inner">
    <button className="wordmark" onClick={onHome} aria-label={intro ? 'Чамд бичсэн захиа' : 'Болзооны санаанууд руу очих'}><Flower /><span><i>чамд.</i></span></button>
    {intro ? <span className="header-note">чамд зориулсан бяцхан урилга <Heart /></span> : <nav aria-label="Үндсэн цэс"><button onClick={onHome}>бяцхан санаанууд</button><button className="nav-question" onClick={onQuestion}>{accepted ? 'чиний хариу' : 'нэг асуулт'} <Heart /></button><button className="restart-button" onClick={onRestart} disabled={locked} aria-label="Захиаг эхнээс нь үзэх" title="Захиаг эхнээс нь үзэх"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M4 10a8 8 0 1 1 2 8M4 4v6h6" /></svg></button></nav>}
  </div></header>
}
