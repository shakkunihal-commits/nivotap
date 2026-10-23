import { Globe, Instagram, Youtube, MessageCircle, Music2, Ghost } from 'lucide-react'

export function SocialIcon({ platform, size = 19 }: { platform: string; size?: number }) {
  if (platform === 'instagram') return <Instagram size={size} />
  if (platform === 'youtube') return <Youtube size={size} />
  if (platform === 'whatsapp') return <MessageCircle size={size} />
  if (platform === 'snapchat') return <Ghost size={size} />
  if (platform === 'website') return <Globe size={size} />
  if (platform === 'spotify') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="M6 9c4-1.5 8-1.2 12 1M7 12.5c3-1 6-1 9 1M8 16c2-.7 4-.5 6 .5" stroke="var(--icon-background, #202322)" strokeWidth="1.7" strokeLinecap="round" /></svg>
  if (platform === 'x') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m5 4 14 16h-4L1 4h4Zm14 0L5 20" transform="translate(2 0)" /></svg>
  if (platform === 'discord') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m8 5-3 1c-2 3-3 7-3 11l5 2 1-2m8-12 3 1c2 3 3 7 3 11l-5 2-1-2M7 15c3 2 7 2 10 0M8 5c3-1 5-1 8 0" /><circle cx="8" cy="11" r="1.3" fill="currentColor" /><circle cx="16" cy="11" r="1.3" fill="currentColor" /></svg>
  return <Music2 size={size} />
}
