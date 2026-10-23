import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Brand } from '@/components/Brand'
import { ProfileCard } from '@/components/ProfileCard'
import { profileRequest } from '@/lib/profiles'
import type { Profile } from '@/lib/profiles'

export const Route = createFileRoute('/p/$profileId')({ component: PublicProfile })

function PublicProfile() {
  const { profileId } = Route.useParams()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    setProfile(null); setError('')
    profileRequest<Profile>(`?id=${encodeURIComponent(profileId)}`).then((result) => { if (active) setProfile(result) }).catch((failure) => { if (active) setError(failure.message) })
    return () => { active = false }
  }, [profileId])
  return <main className="public-page"><Brand linked={false} /><div className="public-content">{profile ? <ProfileCard profile={profile} publicView /> : error ? <div className="public-error" role="alert"><h1>This connection is unavailable.</h1><p>{error}</p></div> : <div className="public-loading" role="status"><LoaderCircle className="spin" size={28} /><span>Opening your connection…</span></div>}</div><p className="public-footer">Your world. One tap.</p></main>
}
