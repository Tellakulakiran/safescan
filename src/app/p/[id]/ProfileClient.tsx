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
    const query   = `[out:json][timeout:10];node["amenity"="${amenity}"](around:${radius},${lat},${lon});out 10;`
    const url     = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
    const res     = await fetch(url)
    const data    = await res.json()
    return (data.elements || [])
      .map((el: any) => ({
        id:       el.id,
        name:     el.tags?.name || el.tags?.['name:en'] || (amenity === 'hospital' ? 'Hospital' : amenity === 'pharmacy' ? 'Medical Store' : 'Police Station'),
        lat:      el.lat,
        lon:      el.lon,
        phone:    el.tags?.phone || el.tags?.['contact:phone'] || null,
        distance: haversineDistance(lat, lon, el.lat, el.lon),
      }))
      .sort((a: NearbyPlace, b: NearbyPlace) => (a.distance ?? 0) - (b.distance ?? 0))
      .slice(0, 6)
  }

  async function loadNearby() {
    setGeoError(null)
    setLoading(true)
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
        setGeoError('Location access denied. Please allow location to find nearby services.')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const initials  = profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const subParts  = []
  if (profile.age)       subParts.push('Age ' + profile.age)
  if (profile.bloodType) subParts.push(profile.bloodType + ' Blood Type')

  const currentPlaces = places[activeTab]
  const { icon: tabIcon, color: tabColor } = CATEGORY_CONFIG[activeTab]

  return (
    <>
      <nav className="top-nav">
        <Link href="/" className="nav-logo"><div className="logo-icon">🛡</div>SafeScan</Link>
        <ul className="nav-links">
          <li><Link href="/create" className="nav-cta">Create Mine</Link></li>
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

          {/* Emergency header */}
          <div className="em-hdr">
            <div className="em-tag"><div className="bdot" />EMERGENCY MEDICAL PROFILE</div>
            <div className="em-av">{initials}</div>
            <div className="em-name">{profile.name}</div>
            <div className="em-sub">{subParts.join(' · ')}</div>
          </div>

          {/* Profile fields */}
          <ProfileFields profile={profile} />

          {/* ─── Nearby Emergency Services ─── */}
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '22px 20px',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: '1.2rem' }}>📍</span>
              <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-.01em' }}>Nearby Emergency Services</span>
            </div>

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
                        style={{
                          background: isActive ? cfg.color : 'var(--bg3)',
                          color: isActive ? 'white' : 'var(--muted)',
                          border: `1.5px solid ${isActive ? cfg.color : 'var(--border)'}`,
                          borderRadius: 100,
                          padding: '7px 16px',
                          fontSize: '.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontFamily: 'inherit',
                          transition: 'all .2s',
                        }}
                      >
                        {cfg.icon} {cfg.label}
                        <span style={{
                          background: isActive ? 'rgba(255,255,255,.25)' : 'var(--bg)',
                          borderRadius: 100,
                          padding: '1px 7px',
                          fontSize: '.72rem',
                          fontWeight: 800,
                        }}>{places[cat].length}</span>
                      </button>
                    )
                  })}
                  <button
                    onClick={loadNearby}
                    style={{
                      background: 'transparent',
                      color: 'var(--muted)',
                      border: '1px solid var(--border)',
                      borderRadius: 100,
                      padding: '7px 14px',
                      fontSize: '.78rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      marginLeft: 'auto',
                    }}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {currentPlaces.map((place, i) => (
                      <div key={place.id} style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        padding: '14px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        transition: 'border-color .2s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: `${tabColor}20`,
                            border: `1.5px solid ${tabColor}40`,
                            display: 'grid', placeItems: 'center',
                            fontSize: '.95rem', flexShrink: 0,
                          }}>
                            {i + 1}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {place.name}
                            </div>
                            <div style={{ fontSize: '.76rem', color: 'var(--muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{ color: tabColor, fontWeight: 700 }}>📍 {formatDist(place.distance ?? 0)}</span>
                              {place.phone && <span>· {place.phone}</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                          {place.phone && (
                            <a
                              href={`tel:${place.phone.replace(/\s/g, '')}`}
                              style={{
                                background: '#22c55e',
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                padding: '7px 12px',
                                fontSize: '.76rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                textDecoration: 'none',
                              }}
                            >
                              📞 Call
                            </a>
                          )}
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              background: tabColor,
                              color: 'white',
                              border: 'none',
                              borderRadius: 8,
                              padding: '7px 12px',
                              fontSize: '.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              textDecoration: 'none',
                            }}
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

          {/* Emergency Contacts */}
          {profile.contacts?.length > 0 && (
            <div className="cont-section">
              <h3>Emergency Contacts</h3>
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

          <div className="vw-actions">
            <Link href="/" className="btn-ghost">← Back to SafeScan</Link>
            <Link href="/create" className="btn-red">Create My Own Profile</Link>
          </div>

        </div>
      </div>
    </>
  )
}

function ProfileFields({ profile }: { profile: Profile }) {
  const fields = [
    profile.bloodType  && { lbl: '🩸 Blood Type',           val: profile.bloodType,               cls: 'crit',           danger: true },
    profile.age        && { lbl: 'Age',                      val: profile.age + ' years',           cls: '' },
    profile.organDonor && { lbl: 'Organ Donor',              val: '✓ Yes',                          cls: '' },
    profile.dob        && { lbl: 'Date of Birth',            val: profile.dob,                      cls: '' },
    profile.insurance  && { lbl: 'Insurance',                val: profile.insurance,                cls: 'full' },
    profile.allergies?.length  && { lbl: '⚠ Allergies',          val: profile.allergies.join(', '),    cls: 'crit full',        danger: true },
    profile.medications?.length && { lbl: '💊 Medications',        val: profile.medications.join(', '),  cls: 'crit-yellow full', warn: true },
    profile.conditions && { lbl: 'Medical Conditions',       val: profile.conditions,               cls: 'full' },
    profile.notes      && { lbl: '📋 Notes for Responders',  val: profile.notes,                    cls: 'full' },
  ].filter(Boolean) as { lbl: string; val: string; cls: string; danger?: boolean; warn?: boolean }[]

  return (
    <div className="vw-grid">
      {fields.map((f, i) => (
        <div key={i} className={`vf ${f.cls}`}>
          <div className="lbl">{f.lbl}</div>
          <div className={`val ${f.danger ? 'danger' : f.warn ? 'warn' : ''}`}>{f.val}</div>
        </div>
      ))}
    </div>
  )
}
