import { useEffect, useRef, useState } from 'react'
import { Check, Copy, ExternalLink, Link2, LoaderCircle, Minus, Plus, ShieldCheck } from 'lucide-react'
import { emptyDraft, platforms, profileRequest, profileUrl } from '@/lib/profiles'
import type { Profile, ProfileDraft } from '@/lib/profiles'
import { Brand } from './Brand'
import { SocialIcon } from './SocialIcon'
import { ProfileCard } from './ProfileCard'

function invalidLink(url: string) {
  if (!url.trim()) return false
  try {
    const parsed = new URL(url.trim())
    return !['http:', 'https:'].includes(parsed.protocol) || Boolean(parsed.username || parsed.password) || url.length > 2048
  } catch {
    return true
  }
}

function profileDraft(profile: Profile): ProfileDraft {
  return { name: profile.name, bio: profile.bio, links: emptyDraft().links.map((link) => profile.links.find((saved) => saved.platform === link.platform) || link) }
}

export function LandingPage() {
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savedDraft, setSavedDraft] = useState(() => JSON.stringify(emptyDraft()))
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [retry, setRetry] = useState(0)
  const [loadRetry, setLoadRetry] = useState(0)
  const lastAttempt = useRef('')
  const nameInput = useRef<HTMLInputElement>(null)
  const serializedDraft = JSON.stringify(draft)
  const dirty = serializedDraft !== savedDraft
  const hasInvalidLink = draft.links.some((link) => invalidLink(link.url))
  const valid = Boolean(draft.name.trim()) && !hasInvalidLink
  const canSwitch = !loading && !loadError && !busy && !dirty

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError('')
    profileRequest<Profile[]>().then((saved) => {
      if (!active) return
      setProfiles(saved)
      if (saved[0]) {
        const initialDraft = profileDraft(saved[0])
        setDraft(initialDraft)
        setSavedDraft(JSON.stringify(initialDraft))
        setEditingId(saved[0].id)
        setShowAll(saved[0].links.some((link) => platforms.slice(4).some((platform) => platform.id === link.platform)))
      }
    }).catch((failure: unknown) => {
      if (active) setLoadError(failure instanceof Error ? failure.message : 'Unable to load your clients.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [loadRetry])

  useEffect(() => {
    if (loading || loadError || busy || !dirty || !valid) return
    const attempt = JSON.stringify([editingId, retry, serializedDraft])
    if (lastAttempt.current === attempt) return
    const timer = window.setTimeout(async () => {
      lastAttempt.current = attempt
      setBusy(true)
      setError('')
      setNotice('')
      try {
        const profile = await profileRequest<Profile>(editingId ? '?id=' + editingId : '', {
          method: editingId ? 'PUT' : 'POST', body: serializedDraft,
        })
        setProfiles((current) => [profile, ...current.filter((item) => item.id !== profile.id)])
        setEditingId(profile.id)
        setSavedDraft(serializedDraft)
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : 'Unable to save your changes.')
      } finally {
        setBusy(false)
      }
    }, 800)
    return () => window.clearTimeout(timer)
  }, [loading, loadError, busy, dirty, valid, editingId, retry, serializedDraft])

  useEffect(() => {
    if (!dirty && !busy) return
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving)
  }, [dirty, busy])

  function selectClient(id: string) {
    if (!canSwitch) return
    const profile = profiles.find((item) => item.id === id)
    const nextDraft = profile ? profileDraft(profile) : emptyDraft()
    setDraft(nextDraft)
    setSavedDraft(JSON.stringify(nextDraft))
    setEditingId(profile?.id ?? null)
    setError('')
    setNotice('')
    lastAttempt.current = ''
    setShowAll(Boolean(profile?.links.some((link) => platforms.slice(4).some((platform) => platform.id === link.platform))))
    if (!profile) nameInput.current?.focus()
  }

  function updateLink(platform: string, url: string) {
    lastAttempt.current = ''
    setDraft((current) => ({ ...current, links: current.links.map((link) => link.platform === platform ? { ...link, url } : link) }))
    setError('')
    setNotice('')
  }

  async function copyLink() {
    if (!editingId || dirty || busy) return
    const url = profileUrl(editingId)
    try {
      await navigator.clipboard.writeText(url)
      setNotice('Link copied. Use this URL on your client’s NFC card.')
    } catch {
      setNotice('NFC profile link: ' + url)
    }
  }

  const status = loading ? 'Loading clients…' : loadError ? 'Clients unavailable' : busy ? 'Saving changes…' : error ? 'Changes not saved' : dirty ? (valid ? 'Waiting to save…' : 'Complete the fields to save') : editingId ? 'All changes saved' : 'Add a name to start'

  return <div className="site-shell compact-shell">
    <header className="site-header"><Brand /><span className="workspace-label">CLIENT STUDIO</span></header>
    <main className="compact-main">
      <div className="section-heading compact-heading"><div><h1>Your world. <span className="mint">One tap.</span></h1><p>Your clients’ profiles. Just a name and their links.</p></div></div>
      <div className="builder-grid compact-builder">
        <section className="editor-panel" aria-label="Client profile editor">
          <div className="client-toolbar"><label htmlFor="client-select">Client</label><select id="client-select" value={editingId ?? ''} disabled={!canSwitch} onChange={(event) => selectClient(event.target.value)}><option value="">New client</option>{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select><button type="button" className="button" disabled={!canSwitch || !editingId} onClick={() => selectClient('')}><Plus size={15} />New client</button></div>
          {loadError && <div className="form-message error" role="alert">{loadError} <button type="button" className="retry-button" onClick={() => setLoadRetry((current) => current + 1)}>Retry loading</button></div>}
          <form className="editor-form compact-form" onSubmit={(event) => event.preventDefault()}>
            <fieldset disabled={loading || Boolean(loadError)}>
              <label htmlFor="profile-name">Profile name <span>*</span></label>
              <input ref={nameInput} id="profile-name" placeholder="Your client’s name" value={draft.name} maxLength={60} required onChange={(event) => { lastAttempt.current = ''; setDraft((current) => ({ ...current, name: event.target.value })); setError(''); setNotice('') }} />
              <div className="form-heading links-heading"><div><h2>Links</h2><p>Only the links you add appear on the profile.</p></div><Link2 size={17} /></div>
              <div className="link-inputs compact-link-inputs">{(showAll ? platforms : platforms.slice(0, 4)).map((platform) => {
                const url = draft.links.find((link) => link.platform === platform.id)?.url || ''
                const invalid = invalidLink(url)
                return <div className={'link-input-row' + (invalid ? ' invalid-link' : '')} key={platform.id}><span className={'platform-icon icon-' + platform.id}><SocialIcon platform={platform.id} size={18} /></span><div className="link-field"><label htmlFor={'link-' + platform.id}>{platform.name}</label><input id={'link-' + platform.id} type="url" inputMode="url" autoCapitalize="none" spellCheck={false} aria-invalid={invalid} aria-describedby={invalid ? 'link-validation' : undefined} placeholder={platform.placeholder} value={url} maxLength={2048} onChange={(event) => updateLink(platform.id, event.target.value)} /></div></div>
              })}</div>
              <button type="button" className="add-platforms" aria-expanded={showAll} onClick={() => setShowAll((current) => !current)}>{showAll ? <Minus size={14} /> : <Plus size={14} />}{showAll ? 'Fewer platforms' : 'More platforms'}</button>
            </fieldset>
          </form>
          {hasInvalidLink && <p id="link-validation" className="form-message error" role="alert">Use a complete http:// or https:// link without a username or password. Your changes stay here until every link is valid.</p>}
          {dirty && !draft.name.trim() && <p className="form-message error" role="alert">Add a profile name so your changes can save.</p>}
          <div className="autosave-status" role="status">{loading || busy ? <LoaderCircle className="spin" size={14} /> : !dirty && editingId ? <Check size={14} /> : <span className="status-dot" />}<span>{status}</span></div>
          {error && <div className="form-message error" role="alert">{error} <button type="button" className="retry-button" onClick={() => setRetry((current) => current + 1)}>Retry</button></div>}
          {editingId && <div className="client-share"><button type="button" className="button primary" disabled={dirty || busy} onClick={copyLink}><Copy size={15} />Copy NFC link</button><a className="subtle-link" href={'/p/' + editingId} target="_blank" rel="noopener noreferrer">View profile <ExternalLink size={14} /></a></div>}
          {notice && <div className="form-message" role="status">{notice}</div>}
        </section>
        <aside className="preview-panel compact-preview"><div className="preview-title"><span className="status-dot" />PROFILE PREVIEW<span><ShieldCheck size={13} />Visitors can only view</span></div><ProfileCard profile={draft} /><p className="compact-preview-note">One profile. Every connection.</p></aside>
      </div>
      <p className="browser-access-note"><ShieldCheck size={13} />Manage your clients from this browser. Keep its cookies to keep editing access. Profiles save online automatically.</p>
    </main>
  </div>
}
