import { useState } from 'react'
import type { DatePhoto } from '../data/dates'
import { Heart } from './Illustrations'

export function Photo({ photo, className = '', eager = false }: { photo: DatePhoto; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <span className={`photo-fallback ${className}`} role="img" aria-label={photo.alt}><Heart /><span>Энэ зураг түр ачаалсангүй.</span></span>
  return <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} className={className} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />
}
