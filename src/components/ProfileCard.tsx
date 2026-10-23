import { ArrowUpRight, AudioLines, Check, Globe } from 'lucide-react'
import { platforms } from '@/lib/profiles'
import type { ProfileDraft } from '@/lib/profiles'
import { SocialIcon } from './SocialIcon'

export function ProfileCard({ profile, demo = false, publicView = false }: { profile: ProfileDraft; demo?: boolean; publicView?: boolean }) {
  const links = profile.links.filter((link) => link.url.trim())
  const displayLinks = demo && !links.length ? [
    { platform: 'instagram', url: '' }, { platform: 'youtube', url: '' }, { platform: 'spotify', url: '' },
  ] : links
  const name = profile.name || (demo ? 'Your name here' : 'Your name')
  return <div className={`profile-card ${publicView ? 'public-card' : ''}`}>
    <div className="profile-cover"><AudioLines size={26} /><span className="cover-orbit" /><span className="cover-orbit orbit-two" /></div>
    <div className="profile-body">
      <div className="avatar">{profile.name ? profile.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() : <span>you<span className="mint">.</span></span>}</div>
      <h3>{name}<span className="verified"><Check size={10} strokeWidth={3} /></span></h3>
      <div className="profile-links">{displayLinks.map((link) => {
        const platform = platforms.find((item) => item.id === link.platform)
        let safeUrl = ''
        try {
          const parsedUrl = new URL(link.url)
          if (['https:', 'http:'].includes(parsedUrl.protocol)) safeUrl = parsedUrl.href
        } catch {}
        const content = <><SocialIcon platform={link.platform} size={18} /><span>{platform?.name || 'Website'}</span><ArrowUpRight size={16} /></>
        return safeUrl ? <a key={link.platform} href={safeUrl} target="_blank" rel="noopener noreferrer">{content}</a> : <div className="demo-link" key={link.platform}>{content}</div>
      })}</div>
      {!demo && !links.length && <div className="preview-empty"><Globe size={22} /><p>Your links appear here.</p></div>}
      <div className="profile-powered"><AudioLines size={13} /> made with <strong>NivoTap</strong></div>
    </div>
  </div>
}
