import { createHash, randomUUID } from 'node:crypto'
import { and, desc, eq } from 'drizzle-orm'
import type { Config } from '@netlify/functions'
import { getDatabase } from '../../db/index'
import { profiles } from '../../db/schema'
import { platforms } from '../../src/lib/profiles'
import type { ProfileDraft, ProfileLink } from '../../src/lib/profiles'

function parseDraft(value: unknown): ProfileDraft | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Record<string, unknown>
  if (typeof input.name !== 'string' || !input.name.trim() || input.name.trim().length > 60) return null
  if (typeof input.bio !== 'string' || input.bio.length > 160 || !Array.isArray(input.links) || input.links.length > 8) return null
  const links: ProfileLink[] = []
  for (const entry of input.links) {
    if (!entry || typeof entry !== 'object' || typeof entry.url !== 'string' || entry.url.length > 2048) return null
    if (!platforms.some((platform) => platform.id === entry.platform) || links.some((link) => link.platform === entry.platform)) return null
    if (!entry.url.trim()) continue
    try {
      const url = new URL(entry.url.trim())
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null
      links.push({ platform: entry.platform, url: url.href })
    } catch { return null }
  }
  return { name: input.name.trim(), bio: input.bio.trim(), links }
}

export default async (request: Request) => {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const headers = new Headers({ 'Cache-Control': 'no-store' })
  const reply = (body: unknown, status = 200) => Response.json(body, { status, headers })
  if (id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return reply({ error: 'Invalid profile link.' }, 400)
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(request.method)) return reply({ error: 'Method not allowed.' }, 405)
  if (request.method !== 'GET' && request.headers.get('origin') !== url.origin) return reply({ error: 'Request not allowed.' }, 403)
  const cookie = request.headers.get('cookie')?.split(';').map((entry) => entry.trim()).find((entry) => entry.startsWith('nivotap_browser='))?.split('=')[1]
  const browserToken = cookie && /^[0-9a-f-]{36}$/.test(cookie) ? cookie : randomUUID()
  const ownerHash = createHash('sha256').update(browserToken).digest('hex')
  const publicFields = { id: profiles.id, name: profiles.name, bio: profiles.bio, links: profiles.links, createdAt: profiles.createdAt }
  if (!(request.method === 'GET' && id)) {
    headers.set('Set-Cookie', `nivotap_browser=${browserToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${url.protocol === 'https:' ? '; Secure' : ''}`)
  }
  try {
    const database = getDatabase()
    if (request.method === 'GET') {
      if (id) {
        const [profile] = await database.select(publicFields).from(profiles).where(eq(profiles.id, id)).limit(1)
        return profile ? reply(profile) : reply({ error: 'This profile is no longer available.' }, 404)
      }
      return reply(await database.select(publicFields).from(profiles).where(eq(profiles.ownerHash, ownerHash)).orderBy(desc(profiles.createdAt)))
    }
    if (request.method === 'DELETE') {
      if (!id) return reply({ error: 'Choose a profile to delete.' }, 400)
      const removed = await database.delete(profiles).where(and(eq(profiles.id, id), eq(profiles.ownerHash, ownerHash))).returning({ id: profiles.id })
      return removed.length ? reply({ success: true }) : reply({ error: 'Profile not found in this browser.' }, 404)
    }
    if (!request.headers.get('content-type')?.includes('application/json')) return reply({ error: 'JSON is required.' }, 415)
    const body = await request.text()
    if (body.length > 20000) return reply({ error: 'Your profile is too large.' }, 413)
    let parsed: unknown
    try { parsed = JSON.parse(body) } catch { return reply({ error: 'Invalid profile data.' }, 400) }
    const draft = parseDraft(parsed)
    if (!draft) return reply({ error: 'Add a name and valid http or https links. Keep your bio under 160 characters.' }, 400)
    if (request.method === 'PUT') {
      if (!id) return reply({ error: 'Choose a profile to update.' }, 400)
      const [profile] = await database.update(profiles).set(draft).where(and(eq(profiles.id, id), eq(profiles.ownerHash, ownerHash))).returning(publicFields)
      return profile ? reply(profile) : reply({ error: 'Profile not found in this browser.' }, 404)
    }
    const [profile] = await database.insert(profiles).values({ ...draft, ownerHash }).returning(publicFields)
    return reply(profile, 201)
  } catch {
    return reply({ error: 'Profiles are temporarily unavailable. Your draft is still here — please try again shortly.' }, 503)
  }
}

export const config: Config = { path: '/api/profiles' }
