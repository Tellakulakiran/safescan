'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Contact { name: string; phone: string; rel?: string }
interface Profile {
  id: string; name: string; bloodType?: string | null; age?: number | null
  dob?: string | null; organDonor: boolean; allergies: string[]; medications: string[]
  conditions?: string | null; notes?: string | null; contacts: Contact[]; insurance?: string | null
}

export default function ProfileClient({ profile }: { profile: Profile }) {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const initials = profile.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
  const subParts = []
  if (profile.age)       subParts.push('Age ' + profile.age)
  if (profile.bloodType) subParts.push(profile.bloodType + ' Blood Type')

  return (
    <>
      <nav className="top-nav">
        <Link href="/" className="nav-logo"><div className="logo-icon">🛡</div>SafeScan</Link>
        <ul className="nav-links">
          <li><Link href="/create" className="nav-cta">Create Mine</Link></li>
        </ul>
      </nav>

      <div style={{paddingTop:62,minHeight:'100vh'}}>
        <div className="vw-main">

          {/* Mode badge */}
          <div className={`mode-badge ${isOnline ? 'online' : 'offline'}`}>
            <div className="mode-dot" />
            <span>{isOnline ? '🌐 Online — Full Visual Profile' : '📴 Offline — Text Profile'}</span>
          </div>

          {/* Emergency header */}
          <div className="em-hdr">
            <div className="em-tag"><div className="bdot" />EMERGENCY MEDICAL PROFILE</div>
            <div className="em-av">{initials}</div>
            <div className="em-name">{profile.name}</div>
            <div className="em-sub">{subParts.join(' · ')}</div>
          </div>

          {isOnline ? <OnlineView profile={profile} /> : <OfflineView profile={profile} />}

          <div className="vw-actions">
            <Link href="/" className="btn-ghost">← Back to SafeScan</Link>
            <Link href="/create" className="btn-red">Create My Own Profile</Link>
          </div>
        </div>
      </div>
    </>
  )
}

function OnlineView({ profile }: { profile: Profile }) {
  const fields = [
    profile.bloodType && { lbl: '🩸 Blood Type',   val: profile.bloodType,   cls: 'crit',           danger: true },
    profile.age       && { lbl: 'Age',              val: profile.age+' years', cls: '' },
    profile.organDonor && { lbl: 'Organ Donor',     val: '✓ Yes',             cls: '' },
    profile.dob       && { lbl: 'Date of Birth',    val: new Date(profile.dob).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'}), cls: '' },
    profile.insurance && { lbl: 'Insurance',        val: profile.insurance,   cls: 'full' },
    (profile.allergies?.length)   && { lbl: '⚠ Allergies',       val: profile.allergies.join(', '),   cls: 'crit full',        danger: true },
    (profile.medications?.length) && { lbl: '💊 Medications',     val: profile.medications.join(', '), cls: 'crit-yellow full', warn: true },
    profile.conditions && { lbl: 'Medical Conditions',  val: profile.conditions, cls: 'full' },
    profile.notes      && { lbl: '📋 Notes for Responders', val: profile.notes, cls: 'full' },
  ].filter(Boolean) as {lbl:string;val:string;cls:string;danger?:boolean;warn?:boolean}[]

  return (
    <>
      <div className="vw-grid">
        {fields.map((f, i) => (
          <div key={i} className={`vf ${f.cls}`}>
            <div className="lbl">{f.lbl}</div>
            <div className={`val ${f.danger?'danger':f.warn?'warn':''}`}>{f.val}</div>
          </div>
        ))}
      </div>

      {profile.contacts?.length > 0 && (
        <div className="cont-section">
          <h3>Emergency Contacts</h3>
          {profile.contacts.map((c, i) => (
            <div key={i} className="cont-card">
              <div>
                <div className="cn">{c.name}</div>
                <div className="cp">{c.phone}{c.rel ? ' · '+c.rel : ''}</div>
              </div>
              <a className="call-btn" href={`tel:${c.phone.replace(/\s/g,'')}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.08 2.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                Call Now
              </a>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function OfflineView({ profile }: { profile: Profile }) {
  const allergies = profile.allergies?.join(', ') || 'None known'
  const meds      = profile.medications?.join(', ') || 'None'

  let txt = '=== SAFESCAN EMERGENCY PROFILE ===\n'
  txt += `NAME: ${profile.name}\n`
  txt += `BLOOD TYPE: ${profile.bloodType || 'Unknown'}`
  if (profile.age) txt += `  |  AGE: ${profile.age}`
  txt += '\n'
  if (profile.dob)         txt += `DOB: ${new Date(profile.dob).toLocaleDateString('en-GB')}\n`
  if (profile.organDonor)  txt += 'ORGAN DONOR: YES\n'
  if (profile.insurance)   txt += `INSURANCE: ${profile.insurance}\n`
  txt += `\n!! ALLERGIES: ${allergies}\n`
  txt += `MEDICATIONS: ${meds}\n`
  if (profile.conditions)  txt += `CONDITIONS: ${profile.conditions}\n`
  if (profile.notes)       txt += `NOTES: ${profile.notes}\n`
  txt += '\nEMERGENCY CONTACTS:\n'
  profile.contacts?.forEach((c, i) => {
    txt += `${i+1}. ${c.name}`
    if (c.rel) txt += ` (${c.rel})`
    txt += `: ${c.phone}\n`
  })
  txt += '\n[SafeScan emergency profile]'

  return (
    <>
      <div className="ov-warn">⚠️ No internet — showing offline text profile. All data is complete.</div>
      <div className="ov-box">{txt}</div>
    </>
  )
}
