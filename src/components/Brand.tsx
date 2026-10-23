import { AudioLines } from 'lucide-react'

export function Brand({ small = false, linked = true }: { small?: boolean; linked?: boolean }) {
  const className = `brand ${small ? 'brand-small' : ''}`
  const content = <><span className="brand-symbol"><AudioLines size={23} strokeWidth={2.5} /></span><span>Nivo<span className="brand-light">Tap</span><span className="brand-dot">.</span></span></>
  return linked ? <a className={className} href="/" aria-label="NivoTap home">{content}</a> : <span className={className}>{content}</span>
}
