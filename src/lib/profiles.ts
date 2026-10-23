export const platforms = [
  { id: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/yourname' },
  { id: 'youtube', name: 'YouTube', placeholder: 'https://youtube.com/@yourname' },
  { id: 'whatsapp', name: 'WhatsApp', placeholder: 'https://wa.me/1234567890' },
  { id: 'snapchat', name: 'Snapchat', placeholder: 'https://snapchat.com/add/yourname' },
  { id: 'spotify', name: 'Spotify', placeholder: 'https://open.spotify.com/artist/...' },
  { id: 'discord', name: 'Discord', placeholder: 'https://discord.gg/yourinvite' },
  { id: 'x', name: 'X / Twitter', placeholder: 'https://x.com/yourname' },
  { id: 'website', name: 'Website', placeholder: 'https://yourwebsite.com' },
] as const

export type ProfileLink = { platform: string; url: string }
export type ProfileDraft = { name: string; bio: string; links: ProfileLink[] }
export type Profile = ProfileDraft & { id: string; createdAt: string }

export function emptyDraft(): ProfileDraft {
  return { name: '', bio: '', links: platforms.map((platform) => ({ platform: platform.id, url: '' })) }
}

export function profileUrl(id: string) {
  return `${window.location.origin}/p/${id}`
}

export async function profileRequest<T>(query = '', options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/profiles${query}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Something went wrong. Please try again.')
  return result as T
}
