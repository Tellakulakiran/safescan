'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'

interface Contact { name: string; phone: string; rel: string }

export default function CreatePage() {
  const [allergies,   setAllergies]   = useState<string[]>([])
  const [meds,        setMeds]        = useState<string[]>([])
  const [contacts,    setContacts]    = useState<Contact[]>([])
  const [showCM,      setShowCM]      = useState(false)
  const [cmName,      setCmName]      = useState('')
  const [cmPhone,     setCmPhone]     = useState('')
  const [cmRel,       setCmRel]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [success,     setSuccess]     = useState<{id:string; url:string; qrImg:string} | null>(null)
  const [toast,       setToast]       = useState<{msg:string;type:string}|null>(null)
  const [allergyInp,  setAllergyInp]  = useState('')
  const [medInp,      setMedInp]      = useState('')
  const allergyRef = useRef<HTMLInputElement>(null)
  const medRef     = useRef<HTMLInputElement>(null)
  const cmNameRef  = useRef<HTMLInputElement>(null)

  function showToast(msg: string, type = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    if (showCM) setTimeout(() => cmNameRef.current?.focus(), 80)
  }, [showCM])

  function addTag(type: 'allergy' | 'med') {
    const val = type === 'allergy' ? allergyInp.trim() : medInp.trim()
    if (!val) return
    if (type === 'allergy') { setAllergies(a => [...a, val]); setAllergyInp('') }
    else                    { setMeds(m => [...m, val]);       setMedInp('') }
  }

  function saveContact() {
    if (!cmName.trim() || !cmPhone.trim()) { showToast('Name and phone required', 'err'); return }
    setContacts(c => [...c, { name: cmName.trim(), phone: cmPhone.trim(), rel: cmRel.trim() }])
    setShowCM(false); setCmName(''); setCmPhone(''); setCmRel('')
  }

  async function handleSubmit() {
    const name  = (document.getElementById('ep-name')  as HTMLInputElement).value.trim()
    const blood = (document.getElementById('ep-blood') as HTMLSelectElement).value
    if (!name)             { showToast('Full name is required', 'err'); return }
    if (!blood)            { showToast('Blood group is required', 'err'); return }
    if (!contacts.length)  { showToast('Add at least one emergency contact', 'err'); return }

    const dob       = (document.getElementById('ep-dob')        as HTMLInputElement).value
    const insurance = (document.getElementById('ep-insurance')  as HTMLInputElement).value.trim()
    const conditions= (document.getElementById('ep-conditions') as HTMLInputElement).value.trim()
    const notes     = (document.getElementById('ep-notes')      as HTMLInputElement).value.trim()
    const organ     = (document.getElementById('ep-organ')      as HTMLInputElement).checked
    const age       = dob ? Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000) : null

    setLoading(true)
    try {
      const res  = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bloodType: blood, age, dob, insurance, organDonor: organ,
                               allergies, medications: meds, conditions, notes, contacts }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Failed to save', 'err'); setLoading(false); return }

      // Generate QR pointing to the live profile URL
      const profileUrl = `${window.location.origin}/p/${data.id}`
      const qrImg = await QRCode.toDataURL(profileUrl, {
        width: 240, margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      })
      setSuccess({ id: data.id, url: profileUrl, qrImg })
      showToast('✅ Profile saved & QR ready!', 'ok')
      // Hide bottom bar
      document.getElementById('ep-bar')!.style.display = 'none'
    } catch {
      showToast('Network error. Try again.', 'err')
    }
    setLoading(false)
  }

  function downloadQR() {
    if (!success) return
    const a = document.createElement('a')
    a.href = success.qrImg
    a.download = 'safescan-qr.png'
    a.click()
  }

  function resetForm() {
    setAllergies([]); setMeds([]); setContacts([]); setSuccess(null)
    setAllergyInp(''); setMedInp('')
    ;['ep-name','ep-dob','ep-insurance','ep-conditions','ep-notes'].forEach(id => {
      const el = document.getElementById(id) as HTMLInputElement
      if (el) el.value = ''
    })
    const blood = document.getElementById('ep-blood') as HTMLSelectElement
    if (blood) blood.value = ''
    const organ = document.getElementById('ep-organ') as HTMLInputElement
    if (organ) organ.checked = false
    document.getElementById('ep-bar')!.style.display = 'block'
    window.scrollTo(0,0)
  }

  return (
    <>
      <nav className="top-nav">
        <Link href="/" className="nav-logo"><div className="logo-icon">🛡</div>SafeScan</Link>
        <ul className="nav-links">
          <li><Link href="/create" className="nav-cta">Create Profile</Link></li>
        </ul>
      </nav>

      <div style={{paddingTop:62,minHeight:'100vh',background:'var(--bg)'}}>
        <div className="ep-wrap">
          <div className="ep-hdr">
            <Link href="/" className="ep-back">←</Link>
            <h1>Emergency Profile</h1>
          </div>
          <p className="ep-subtitle">Saved to cloud — scan the QR from any device, anywhere.</p>

          {/* Basic Info */}
          <div className="ep-card">
            <div className="ep-card-hd"><span style={{color:'var(--red)'}}>👤</span> Basic Information</div>
            <div className="ep-field"><label className="ep-lbl">Full Name *</label><input className="ep-in" type="text" id="ep-name" placeholder="Your full name" /></div>
            <div className="ep-field">
              <label className="ep-lbl">Blood Group *</label>
              <select className="ep-in" id="ep-blood">
                <option value="">Select blood group</option>
                {['A+','A-','B+','B-','O+','O-','AB+','AB-','Unknown'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="ep-field"><label className="ep-lbl">Date of Birth</label><input className="ep-in" type="date" id="ep-dob" /></div>
            <div className="ep-field"><label className="ep-lbl">Insurance Info</label><input className="ep-in" type="text" id="ep-insurance" placeholder="Insurance provider / ID" /></div>
            <div className="ep-field">
              <div className="toggle-row">
                <div className="toggle-lbl"><span style={{color:'var(--red)'}}>🫀</span> Organ Donor</div>
                <label className="tswitch"><input type="checkbox" id="ep-organ" /><div className="ttrack" /></label>
              </div>
            </div>
          </div>

          {/* Medical Alerts */}
          <div className="ep-card">
            <div className="ep-card-hd"><span style={{color:'var(--red)'}}>⚠️</span> Medical Alerts</div>
            <div className="ep-field">
              <label className="ep-lbl">Allergies</label>
              <div className="add-row">
                <input ref={allergyRef} className="ep-in" type="text" placeholder="Add allergy" value={allergyInp}
                  onChange={e => setAllergyInp(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('allergy'))} />
                <button className="add-btn" onClick={() => addTag('allergy')}>+</button>
              </div>
              <div className="tags">{allergies.map((t,i) => <span key={i} className="tag">{t}<button className="tag-x" onClick={() => setAllergies(a => a.filter((_,j)=>j!==i))}>×</button></span>)}</div>
            </div>
            <div className="ep-field">
              <label className="ep-lbl">Medications</label>
              <div className="add-row">
                <input ref={medRef} className="ep-in" type="text" placeholder="Add medication" value={medInp}
                  onChange={e => setMedInp(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('med'))} />
                <button className="add-btn" onClick={() => addTag('med')}>+</button>
              </div>
              <div className="tags">{meds.map((t,i) => <span key={i} className="tag">{t}<button className="tag-x" onClick={() => setMeds(m => m.filter((_,j)=>j!==i))}>×</button></span>)}</div>
            </div>
            <div className="ep-field"><label className="ep-lbl">Medical Conditions</label><input className="ep-in" type="text" id="ep-conditions" placeholder="e.g. Diabetes, Epilepsy, Asthma" /></div>
            <div className="ep-field"><label className="ep-lbl">Notes for First Responders</label><input className="ep-in" type="text" id="ep-notes" placeholder="Any critical info for responders..." /></div>
          </div>

          {/* Emergency Contacts */}
          <div className="ep-card">
            <div className="ep-card-hd"><span style={{color:'var(--red)'}}>📞</span> Emergency Contacts *</div>
            {contacts.map((c,i) => (
              <div key={i} className="contact-card">
                <div className="cc-info">
                  <div className="cc-name">{c.name}</div>
                  <div className="cc-meta">{c.phone}{c.rel ? ' · '+c.rel : ''}</div>
                </div>
                <button className="cc-rm" onClick={() => setContacts(cs => cs.filter((_,j)=>j!==i))}>✕</button>
              </div>
            ))}
            <button className="add-contact-btn" onClick={() => setShowCM(true)}><span style={{fontSize:'1.1rem'}}>+</span> Add Contact</button>
          </div>

          {/* QR Success */}
          {success && (
            <div className="qr-success show">
              <div style={{fontSize:'2rem',marginBottom:10}}>✅</div>
              <h2>Profile Created!</h2>
              <p>Your profile is live at a permanent URL. Share or scan the QR — works on any device.</p>
              <div className="qr-box"><img src={success.qrImg} alt="QR Code" width={240} height={240} /></div>
              <div className="qr-url-box">
                <span>{success.url}</span>
                <button className="btn-ghost" style={{padding:'4px 12px',fontSize:'.75rem',flexShrink:0}}
                  onClick={() => { navigator.clipboard.writeText(success.url); showToast('URL copied!','ok') }}>
                  Copy
                </button>
              </div>
              <div className="qr-btns">
                <button className="btn-red" onClick={downloadQR}>⬇ Download QR</button>
                <Link href={`/p/${success.id}`} className="btn-red" style={{background:'#2a2a2a',border:'1px solid rgba(255,255,255,.12)'}} target="_blank">👁 Preview</Link>
                <button className="btn-ghost" onClick={resetForm}>＋ New Profile</button>
              </div>
            </div>
          )}
        </div>

        {/* Fixed bottom bar */}
        <div className="ep-bar" id="ep-bar">
          <div className="ep-bar-inner">
            <button className="ep-gen-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? <><span className="spin" />Saving...</> : 'Save & Generate QR Code'}
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <div className={`cm-bg${showCM?' open':''}`} onClick={e => e.target === e.currentTarget && setShowCM(false)}>
        <div className="cm-box">
          <h3>Add Emergency Contact</h3>
          <div className="cm-f"><label>Name *</label><input ref={cmNameRef} type="text" placeholder="Contact name" value={cmName} onChange={e=>setCmName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveContact()} /></div>
          <div className="cm-f"><label>Phone Number *</label><input type="tel" placeholder="+1 555 000 0000" value={cmPhone} onChange={e=>setCmPhone(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveContact()} /></div>
          <div className="cm-f"><label>Relationship</label><input type="text" placeholder="e.g. wife, father, doctor" value={cmRel} onChange={e=>setCmRel(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveContact()} /></div>
          <div className="cm-btns">
            <button className="cm-cancel" onClick={() => setShowCM(false)}>Cancel</button>
            <button className="cm-save" onClick={saveContact}>Add Contact</button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <div className={`toast show ${toast.type}`}>{toast.msg}</div>}
    </>
  )
}
