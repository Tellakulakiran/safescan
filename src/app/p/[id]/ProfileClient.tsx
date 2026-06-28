'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Contact { name: string; phone: string; rel?: string }
interface Profile {
  id: string; name: string; bloodType?: string | null; age?: number | null
  dob?: string | null; organDonor: boolean; allergies: string[]; medications: string[]
  conditions?: string | null; notes?: string | null; contacts: Contact[]; insurance?: string | null
}

interface NearbyPlace {
  id: number
  name: string
  lat: number
  lon: number
  phone?: string
  distance?: number
}

type Category = 'hospitals' | 'pharmacies' | 'police'

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDist(m: number): string {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`
}

const CATEGORY_CONFIG: Record<Category, { label: string; icon: string; amenity: string; color: string }> = {
  hospitals:  { label: 'Hospitals',      icon: '🏥', amenity: 'hospital',  color: '#e8302a' },
  pharmacies: { label: 'Medical Stores', icon: '💊', amenity: 'pharmacy',  color: '#22c55e' },
  police:     { label: 'Police',         icon: '🚨', amenity: 'police',    color: '#3b82f6' },
}

export default function ProfileClient({ profile }: { profile: Profile }) {
  const [isOnline, setIsOnline]         = useState(true)
  const [coords, setCoords]             = useState<{ lat: number; lon: number } | null>(null)
  const [geoError, setGeoError]         = useState<string | null>(null)
  const [activeTab, setActiveTab]       = useState<Category>('hospitals')
  const [places, setPlaces]             = useState<Record<Category, NearbyPlace[]>>({ hospitals: [], pharmacies: [], police: [] })
  const [loading, setLoading]           = useState(false)
  const [fetched, setFetched]           = useState(false)
  const [showShare, setShowShare]       = useState(false)
  const [shareToast, setShareToast]     = useState<string | null>(null)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  async function fetchCategory(cat: Category, lat: number, lon: number): Promise<NearbyPlace[]> {
    const amenity = CATEGORY_CONFIG[cat].amenity
    const radius  = 5000
    // Query nodes, ways, and relations around the coordinate, returning centers for ways/relations
    const query   = `[out:json][timeout:15];(node["amenity"="${amenity}"](around:${radius},${lat},${lon});way["amenity"="${amenity}"](around:${radius},${lat},${lon});relation["amenity"="${amenity}"](around:${radius},${lat},${lon}););out center 10;`
    const url     = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
    const res     = await fetch(url)
    const data    = await res.json()
    return (data.elements || [])
      .map((el: any) => {
        const itemLat = el.lat ?? el.center?.lat
        const itemLon = el.lon ?? el.center?.lon
        return {
          id:       el.id,
          name:     el.tags?.name || el.tags?.['name:en'] || (amenity === 'hospital' ? 'Hospital' : amenity === 'pharmacy' ? 'Medical Store' : 'Police Station'),
          lat:      itemLat,
          lon:      itemLon,
          phone:    el.tags?.phone || el.tags?.['contact:phone'] || null,
          distance: haversineDistance(lat, lon, itemLat, itemLon),
        }
      })
      .filter((place: NearbyPlace) => place.lat !== undefined && place.lon !== undefined)
      .sort((a: NearbyPlace, b: NearbyPlace) => (a.distance ?? 0) - (b.distance ?? 0))
      .slice(0, 6)
  }

  async function loadNearby() {
    setGeoError(null)
    setLoading(true)
    
    // Check if geolocation is available (blocked by browsers on non-HTTPS origins)
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocation requires a secure connection (HTTPS) on mobile devices, or localhost on computer.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        setCoords({ lat, lon })
        try {
          const [hosp, pharm, pol] = await Promise.all([
            fetchCategory('hospitals',  lat, lon),
            fetchCategory('pharmacies', lat, lon),
            fetchCategory('police',     lat, lon),
          ])
          setPlaces({ hospitals: hosp, pharmacies: pharm, police: pol })
          setFetched(true)
        } catch {
          setGeoError('Could not load nearby places. Check internet connection.')
        }
        setLoading(false)
      },
      (err) => {
        if (err.code === 1) {
          setGeoError('Location access denied. Please allow location to find nearby services.')
        } else if (err.code === 3) {
          setGeoError('Location request timed out. Please try again.')
        } else {
          setGeoError('Could not obtain your location. Make sure GPS is enabled.')
        }
        setLoading(false)
      },
      { enableHighAccuracy: false, timeout: 12000 }
    )
  }

  function handleShare() {
    const profileUrl = `${window.location.origin}/p/${profile.id}`
    if (navigator.share) {
      navigator.share({
        title: `${profile.name} — Emergency Profile`,
        text: `Emergency medical profile for ${profile.name}. Blood type: ${profile.bloodType || 'Unknown'}`,
        url: profileUrl,
      }).catch(() => {})
    } else {
      setShowShare(true)
    }
  }

  function copyProfileLink() {
    const profileUrl = `${window.location.origin}/p/${profile.id}`
    navigator.clipboard.writeText(profileUrl).then(() => {
      setShareToast('Link copied!')
      setTimeout(() => setShareToast(null), 2500)
      setShowShare(false)
    })
  }

  const initials  = profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const subParts: string[]  = []
  if (profile.age)       subParts.push('Age ' + profile.age)
  if (profile.bloodType) subParts.push(profile.bloodType + ' Blood Type')

  const currentPlaces = places[activeTab]
  const { icon: tabIcon, color: tabColor } = CATEGORY_CONFIG[activeTab]

  // Get first emergency contact for quick call
  const primaryContact = profile.contacts?.[0]

  return (
    <>
      <nav className="top-nav">
        <Link href="/" className="nav-logo">
          <div className="logo-icon" style={{ background: 'var(--accent)', boxShadow: '0 0 10px var(--accent-glow)' }}>🛡</div>
          SafeScan
        </Link>
        <ul className="nav-links">
          <li><Link href="/create" className="nav-cta" style={{ background: 'var(--accent)!important' }}>Create Mine</Link></li>
        </ul>
      </nav>

      <div style={{ paddingTop: 62, minHeight: '100vh' }}>
        <div className="vw-main">

          {/* Mode badge */}
          <div className={`mode-badge ${isOnline ? 'online' : 'offline'}`}>
            <div className="mode-dot" />
            <span>{isOnline ? '🌐 Online — Full Medical Profile' : '📴 Offline Mode — Cached Details'}</span>
          </div>

          {!isOnline && (
            <div className="offline-notice">
              <span className="icon">⚠️</span>
              <div>
                <strong>Offline Access</strong>
                <p>Showing cached data. Always verify with actual records if possible.</p>
              </div>
            </div>
          )}

          {/* ─── Emergency Header ─── */}
          <div className="em-hdr">
            <div className="em-tag"><div className="bdot" />EMERGENCY MEDICAL PROFILE</div>
            <div className="em-av">{initials}</div>
            <div className="em-name">{profile.name}</div>
            <div className="em-sub">{subParts.join(' · ')}</div>
          </div>

          {/* ─── Blood Type Mega Badge ─── */}
          {profile.bloodType && (
            <div className="blood-mega">
              <div className="blood-label">🩸 Blood Type</div>
              <div className="blood-value">{profile.bloodType}</div>
            </div>
          )}

          {/* ─── Critical Alerts ─── */}
          {(profile.allergies?.length > 0 || profile.conditions) && (
            <>
              <div className="section-label">⚠ Critical Alerts</div>
              {profile.allergies?.length > 0 && (
                <div className="glass-card-danger" style={{ padding: '16px 18px', marginBottom: 10 }}>
                  <div className="vf-label" style={{ fontSize: '.62rem', fontWeight: 800, letterSpacing: '.14em', color: 'rgba(232,48,42,.8)', textTransform: 'uppercase' as const, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ animation: 'dotPulse 1.5s ease infinite' }}>⚠</span> Allergies — Critical
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                    {profile.allergies.map((a, i) => (
                      <span key={i} style={{
                        background: 'rgba(232,48,42,.15)',
                        border: '1px solid rgba(232,48,42,.35)',
                        color: '#ff6b6b',
                        borderRadius: 100,
                        padding: '6px 14px',
                        fontSize: '.82rem',
                        fontWeight: 700,
                      }}>{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {profile.conditions && (
                <div className="glass-card-warn" style={{ padding: '16px 18px', marginBottom: 16 }}>
                  <div style={{ fontSize: '.62rem', fontWeight: 800, letterSpacing: '.14em', color: 'rgba(245,158,11,.8)', textTransform: 'uppercase' as const, marginBottom: 8 }}>
                    🏥 Medical Conditions
                  </div>
                  <div style={{ fontSize: '.95rem', fontWeight: 700, color: '#f59e0b' }}>{profile.conditions}</div>
                </div>
              )}
            </>
          )}

          {/* ─── Medications ─── */}
          {profile.medications?.length > 0 && (
            <>
              <div className="section-label">💊 Current Medications</div>
              <div className="glass-card-warn" style={{ padding: '16px 18px', marginBottom: 16 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                  {profile.medications.map((m, i) => (
                    <span key={i} style={{
                      background: 'rgba(245,158,11,.1)',
                      border: '1px solid rgba(245,158,11,.3)',
                      color: '#fbbf24',
                      borderRadius: 100,
                      padding: '6px 14px',
                      fontSize: '.82rem',
                      fontWeight: 700,
                    }}>{m}</span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── Profile Details Grid ─── */}
          <div className="section-label">📋 Profile Details</div>
          <ProfileFields profile={profile} />

          {/* ─── Nearby Emergency Services ─── */}
          <div className="section-label">📍 Nearby Emergency Services</div>
          <div id="nearby-section" className="glass-card-strong" style={{ padding: '22px 20px', marginBottom: 16 }}>

            {!fetched && !loading && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)', fontSize: '.86rem', marginBottom: 16, lineHeight: 1.6 }}>
                  Find the closest hospitals, medical stores, and police stations using your live GPS location.
                </p>
                <button
                  onClick={loadNearby}
                  className="btn-red"
                  style={{ margin: '0 auto', display: 'inline-flex', gap: 9, padding: '13px 26px' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Locate Nearby Services
                </button>
                {geoError && (
                  <p style={{ color: '#ff6b6b', fontSize: '.82rem', marginTop: 14, lineHeight: 1.5 }}>⚠️ {geoError}</p>
                )}
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <span className="spin" style={{ width: 28, height: 28, borderWidth: 3, display: 'inline-block', marginBottom: 14 }} />
                <p style={{ color: 'var(--muted)', fontSize: '.86rem' }}>Fetching your location and nearby services...</p>
              </div>
            )}

            {fetched && !loading && (
              <>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {(Object.keys(CATEGORY_CONFIG) as Category[]).map(cat => {
                    const cfg = CATEGORY_CONFIG[cat]
                    const isActive = activeTab === cat
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`osm-tab${isActive ? ' active' : ''}`}
                      >
                        {cfg.icon} {cfg.label}
                        <span style={{
                          background: isActive ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.08)',
                          borderRadius: 100,
                          padding: '1px 7px',
                          fontSize: '.72rem',
                          fontWeight: 800,
                          marginLeft: 4
                        }}>{places[cat].length}</span>
                      </button>
                    )
                  })}
                  <button
                    onClick={loadNearby}
                    className="osm-tab"
                    style={{ marginLeft: 'auto' }}
                  >↻ Refresh</button>
                </div>

                {/* Places list */}
                {currentPlaces.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '28px 0',
                    color: 'var(--muted)',
                    fontSize: '.86rem',
                  }}>
                    {tabIcon} No {CATEGORY_CONFIG[activeTab].label.toLowerCase()} found within 5km.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {currentPlaces.map((place, i) => (
                      <div key={place.id} className="osm-place-card">
                        {/* Top row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                            <div style={{
                              width: 40, height: 40, borderRadius: 10,
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              display: 'grid', placeItems: 'center',
                              fontSize: '1.1rem', flexShrink: 0,
                            }}>
                              {tabIcon}
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff' }}>
                              {place.name}
                            </div>
                          </div>
                          <span style={{
                            background: 'rgba(34, 197, 94, 0.12)',
                            border: '1.5px solid rgba(34, 197, 94, 0.25)',
                            color: '#4ade80',
                            padding: '3px 10px',
                            borderRadius: 100,
                            fontSize: '.72rem',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}>
                            {formatDist(place.distance ?? 0)}
                          </span>
                        </div>

                        {/* Mid Row (Status and info) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 52 }}>
                          <div style={{ fontSize: '.8rem', color: 'var(--muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span>📍 {formatDist(place.distance ?? 0)} away</span>
                            {place.phone && <span>· {place.phone}</span>}
                          </div>
                          <div style={{ fontSize: '.78rem', color: '#4ade80', fontWeight: 600 }}>
                            Emergency: Open 24/7
                          </div>
                        </div>

                        {/* Buttons row */}
                        <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
                          {place.phone ? (
                            <a
                              href={`tel:${place.phone.replace(/\s/g, '')}`}
                              className="place-btn call"
                            >
                              📞 Call
                            </a>
                          ) : (
                            <button
                              className="place-btn call disabled"
                              disabled
                            >
                              📞 No Phone
                            </button>
                          )}
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
                            target="_blank"
                            rel="noreferrer"
                            className="place-btn go"
                          >
                            🗺️ Go
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {coords && (
                  <p style={{ fontSize: '.72rem', color: '#444', marginTop: 14, textAlign: 'center' }}>
                    GPS: {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)} · Data via OpenStreetMap
                  </p>
                )}
              </>
            )}
          </div>

          {/* ─── Emergency Contacts ─── */}
          {profile.contacts?.length > 0 && (
            <div className="cont-section">
              <div className="section-label">📞 Emergency Contacts</div>
              {profile.contacts.map((c, i) => (
                <div key={i} className="cont-card">
                  <div>
                    <div className="cn">{c.name}</div>
                    <div className="cp">{c.phone}{c.rel ? ' · ' + c.rel : ''}</div>
                  </div>
                  <a className="call-btn" href={`tel:${c.phone.replace(/\s/g, '')}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.08 2.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                    Call Now
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* ─── Additional Info ─── */}
          {profile.notes && (
            <>
              <div className="section-label">📝 Notes for Responders</div>
              <div className="glass-card" style={{ padding: '16px 18px', marginBottom: 16 }}>
                <div style={{ fontSize: '.92rem', lineHeight: 1.6, color: 'rgba(255,255,255,.85)' }}>{profile.notes}</div>
              </div>
            </>
          )}

          <div className="vw-actions">
            <Link href="/" className="btn-ghost">← Back to SafeScan</Link>
            <Link href="/create" className="btn-red">Create My Own Profile</Link>
          </div>

        </div>
      </div>

      {/* ─── Fixed Bottom App Nav Bar ─── */}
      <div className="profile-bottom-bar">
        <div className="profile-bottom-bar-inner">
          <Link href="/" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Home</span>
          </Link>
          
          {primaryContact ? (
            <a href={`tel:${primaryContact.phone.replace(/\s/g, '')}`} className="nav-item critical">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.08 2.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              <span>Call Contact</span>
            </a>
          ) : (
            <a href="tel:911" className="nav-item critical">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.08 2.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              <span>Call 911</span>
            </a>
          )}
          
          <button onClick={() => {
            document.getElementById('nearby-section')?.scrollIntoView({ behavior: 'smooth' });
          }} className="nav-item active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Nearby</span>
          </button>
          
          <button onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* ─── Share Modal (fallback for non-native share) ─── */}
      <div className={`share-modal-bg${showShare ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && setShowShare(false)}>
        <div className="share-modal">
          <h3>Share Profile</h3>
          <p>Share this emergency profile with family or caregivers</p>
          <div className="share-options">
            <button className="share-opt" onClick={copyProfileLink}>
              <div className="share-ico" style={{ background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.3)' }}>🔗</div>
              Copy Link
            </button>
            <a className="share-opt" href={`mailto:?subject=Emergency Profile - ${profile.name}&body=View emergency medical profile: ${typeof window !== 'undefined' ? window.location.href : ''}`}>
              <div className="share-ico" style={{ background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)' }}>✉️</div>
              Send via Email
            </a>
            <button className="share-opt" onClick={() => setShowShare(false)} style={{ justifyContent: 'center', color: 'var(--muted)' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Share toast */}
      {shareToast && <div className="toast show ok">{shareToast}</div>}
    </>
  )
}

function ProfileFields({ profile }: { profile: Profile }) {
  const fields = [
    profile.age        && { lbl: 'Age',              val: profile.age + ' years',   cls: '' },
    profile.organDonor && { lbl: 'Organ Donor',      val: '✓ Registered Donor',     cls: '' },
    profile.dob        && { lbl: 'Date of Birth',    val: profile.dob,              cls: '' },
    profile.insurance  && { lbl: 'Insurance',        val: profile.insurance,        cls: 'full' },
  ].filter(Boolean) as { lbl: string; val: string; cls: string }[]

  if (fields.length === 0) return null

  return (
    <div className="vw-grid" style={{ marginBottom: 20 }}>
      {fields.map((f, i) => (
        <div key={i} className={`vf delay-${i + 1}`} style={{ animationFillMode: 'both' }}>
          <div className="lbl">{f.lbl}</div>
          <div className="val">{f.val}</div>
        </div>
      ))}
    </div>
  )
}
