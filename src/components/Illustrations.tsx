import type { CSSProperties } from 'react'

export function Heart({ className = '', filled = false }: { className?: string; filled?: boolean }) {
  return <svg className={className} width="24" height="24" viewBox="0 0 32 32" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M16 27S4 20 4 11.5C4 3 14 2 16 9c2-7 12-6 12 2.5C28 20 16 27 16 27Z" /></svg>
}

export function Arrow({ back = false }: { back?: boolean }) {
  return <svg width="22" height="16" viewBox="0 0 24 16" fill="none" aria-hidden="true" style={back ? { transform: 'rotate(180deg)' } : undefined}><path d="M1 8h20M15 2l7 6-7 6" stroke="currentColor" strokeWidth="1.4" /></svg>
}

export function Flower({ className = '' }: { className?: string }) {
  return <svg className={className} width="56" height="72" viewBox="0 0 56 72" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="1.3"><path d="M28 31c-17-12-7-24 1-12C40 3 51 18 35 26c18 4 9 19-2 9-1 17-18 14-13 0-18 3-18-14-1-12" /><path d="M28 32c-1 12 6 27-1 38M30 54c-15 1-17-11-17-11s13-2 17 11ZM31 60c15-1 16-12 16-12s-15 0-16 12Z" /></g><circle cx="28" cy="27" r="5" fill="currentColor" /></svg>
}

export function Sparkle({ className = '' }: { className?: string }) {
  return <svg className={className} width="30" height="38" viewBox="0 0 30 38" fill="none" aria-hidden="true"><path d="M15 2c0 12-2 16-13 17 11 1 13 5 13 17 0-12 2-16 13-17C17 18 15 14 15 2Z" stroke="currentColor" strokeWidth="1.2" /></svg>
}

export function Confetti() {
  return <div className="confetti" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <span key={i} style={{ '--x': `${(i * 37) % 100}%`, '--delay': `${(i % 7) * 0.09}s`, '--rotation': `${i * 31}deg`, '--color': ['#854658', '#d8b394', '#b7caca', '#b8afc8'][i % 4] } as CSSProperties}>{i % 5 === 0 ? '♡' : ''}</span>)}</div>
}
