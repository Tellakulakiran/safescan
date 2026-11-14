'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import AdBanner from '@/components/AdBanner'
import BottomNav from '@/components/BottomNav'

interface Contact { name: string; phone: string; rel: string }

interface SuccessProfile {
  id: string
  url: string
  qrImg: string
  cardImg: string
  name: string
  bloodType: string
  allergies: string[]
  contacts: Contact[]
  conditions?: string
  organDonor?: boolean
}

// Canvas helper: Rounded Rectangle
function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (ctx.roundRect) {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
    return
  }
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

// Canvas helper: Viewfinder Corner Brackets
function drawCornerBrackets(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, len: number) {
  ctx.beginPath()
  // Top Left
  ctx.moveTo(x, y + len)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.lineTo(x + len, y)
  // Top Right
  ctx.moveTo(x + w - len, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + len)
  // Bottom Right
  ctx.moveTo(x + w, y + h - len)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + w - len, y + h)
  // Bottom Left
  ctx.moveTo(x + len, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + h - len)
  ctx.stroke()
}

// Canvas helper: SafeScan Shield Icon
function drawShield(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.lineTo(size * 0.85, -size * 0.5)
  ctx.lineTo(size * 0.85, size * 0.2)
  ctx.bezierCurveTo(size * 0.85, size * 0.7, 0, size, 0, size)
  ctx.bezierCurveTo(0, size, -size * 0.85, size * 0.7, -size * 0.85, size * 0.2)
  ctx.lineTo(-size * 0.85, -size * 0.5)
  ctx.closePath()
  ctx.fill()

  // Inner 'S' emblem
  ctx.fillStyle = '#060a12'
  ctx.font = `900 ${Math.round(size * 1.05)}px "Barlow", sans-serif, system-ui`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('S', 0, 1)
  ctx.restore()
}

// Generate the attractive high-res Emergency ID Card (1080x1600)
function generateStyledCard(
  qrDataUrl: string,
  profile: {
    name: string
    bloodType: string
    allergies: string[]
    contacts: Contact[]
    conditions?: string
    organDonor?: boolean
    url: string
  }
): Promise<string> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas')
      const width = 1080
      const height = 1600
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(qrDataUrl)
        return
      }

      const qr = new Image()
      qr.crossOrigin = 'anonymous'
      qr.onload = () => {
        // 1. Dark Slate Gradient Background
        const bg = ctx.createLinearGradient(0, 0, 0, height)
        bg.addColorStop(0, '#070d18')
        bg.addColorStop(0.5, '#0b1424')
        bg.addColorStop(1, '#050a12')
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, width, height)

        // 2. Ambient Cyan Glow Behind QR
        const glow = ctx.createRadialGradient(width / 2, 800, 40, width / 2, 800, 520)
        glow.addColorStop(0, 'rgba(0, 213, 236, 0.22)')
        glow.addColorStop(0.5, 'rgba(0, 180, 200, 0.06)')
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = glow
        ctx.fillRect(0, 300, width, 950)

        // 3. Card Outer Border with Rounded Corners
        ctx.strokeStyle = 'rgba(0, 213, 236, 0.35)'
        ctx.lineWidth = 4
        drawRoundRect(ctx, 45, 45, width - 90, height - 90, 44)
        ctx.stroke()

        // Corner Viewfinder Brackets
        ctx.strokeStyle = '#00d5ec'
        ctx.lineWidth = 8
        drawCornerBrackets(ctx, 45, 45, width - 90, height - 90, 44, 70)

        // 4. Header: Shield Icon + Title + SOS Badge
        drawShield(ctx, 115, 125, 36, '#00d5ec')

        ctx.fillStyle = '#ffffff'
        ctx.font = '900 42px "Barlow", sans-serif, system-ui'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText('SAFESCAN', 170, 138)

        ctx.fillStyle = '#00d5ec'
        ctx.font = '700 19px "Barlow", sans-serif, system-ui'
        ctx.fillText('EMERGENCY MEDICAL ID • FIRST RESPONDER ACCESS', 172, 168)

        // SOS Badge (Top right)
        ctx.fillStyle = '#dc2626'
        drawRoundRect(ctx, width - 265, 105, 155, 48, 24)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = '800 20px "Barlow", sans-serif, system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('🚨 SOS / ICE', width - 188, 137)

        // Top Divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(95, 205)
        ctx.lineTo(width - 95, 205)
        ctx.stroke()

        // 5. Patient Profile Info Box
        const pBoxY = 230
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
        drawRoundRect(ctx, 90, pBoxY, width - 180, 225, 28)
        ctx.fill()
        ctx.strokeStyle = 'rgba(0, 213, 236, 0.28)'
        ctx.lineWidth = 2
        drawRoundRect(ctx, 90, pBoxY, width - 180, 225, 28)
        ctx.stroke()

        // Cardholder Name
        ctx.fillStyle = '#ffffff'
        ctx.font = '800 46px "Barlow", sans-serif, system-ui'
        ctx.textAlign = 'left'
        ctx.fillText(profile.name || 'Emergency Medical Profile', 130, pBoxY + 68)

        // Blood Group Pill
        const blood = profile.bloodType || 'Unknown'
        ctx.fillStyle = '#dc2626'
        drawRoundRect(ctx, 130, pBoxY + 98, 230, 48, 24)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = '800 22px "Barlow", sans-serif, system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(`🩸 BLOOD: ${blood}`, 245, pBoxY + 130)

        // Allergies Pill
        const allergyTxt = profile.allergies && profile.allergies.length > 0
          ? `⚠️ ${profile.allergies.slice(0, 2).join(', ')}`
          : '✓ No Known Allergies'
        ctx.fillStyle = profile.allergies && profile.allergies.length > 0 ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)'
        drawRoundRect(ctx, 380, pBoxY + 98, 310, 48, 24)
        ctx.fill()
        ctx.fillStyle = profile.allergies && profile.allergies.length > 0 ? '#fca5a5' : '#6ee7b7'
        ctx.font = '700 20px "Barlow", sans-serif, system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(allergyTxt, 535, pBoxY + 130)

        // Organ Donor Pill
        if (profile.organDonor) {
          ctx.fillStyle = 'rgba(0, 213, 236, 0.22)'
          drawRoundRect(ctx, 710, pBoxY + 98, 195, 48, 24)
          ctx.fill()
          ctx.fillStyle = '#38bdf8'
          ctx.font = '700 19px "Barlow", sans-serif, system-ui'
          ctx.textAlign = 'center'
          ctx.fillText('🫀 Organ Donor', 807, pBoxY + 130)
        }

        // Medical conditions note
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
        ctx.font = '500 20px "Barlow", sans-serif, system-ui'
        ctx.textAlign = 'left'
        if (profile.conditions) {
          ctx.fillText(`Conditions: ${profile.conditions}`, 130, pBoxY + 192)
        } else {
          ctx.fillText('Paramedics: Scan QR code below for medication history & physician notes', 130, pBoxY + 192)
        }

        // 6. Center QR Container (High contrast white inner card)
        const qrBoxY = 485
        const qrBoxHeight = 625
        ctx.fillStyle = 'rgba(10, 17, 30, 0.96)'
        drawRoundRect(ctx, 90, qrBoxY, width - 180, qrBoxHeight, 32)
        ctx.fill()
        ctx.strokeStyle = 'rgba(0, 213, 236, 0.32)'
        ctx.lineWidth = 2
        drawRoundRect(ctx, 90, qrBoxY, width - 180, qrBoxHeight, 32)
        ctx.stroke()

        const qrSize = 410
        const qrX = (width - qrSize) / 2
        const qrY = qrBoxY + 45

        // White background card for QR
        ctx.fillStyle = '#ffffff'
        drawRoundRect(ctx, qrX - 25, qrY - 25, qrSize + 50, qrSize + 50, 26)
        ctx.fill()

        // Draw the QR Code
        ctx.drawImage(qr, qrX, qrY, qrSize, qrSize)

        // Viewfinder corners around QR
        ctx.strokeStyle = '#00d5ec'
        ctx.lineWidth = 5
        drawCornerBrackets(ctx, qrX - 35, qrY - 35, qrSize + 70, qrSize + 70, 16, 36)

        // 'SCAN FOR MEDICAL INFO' badge pill
        ctx.fillStyle = '#00d5ec'
        drawRoundRect(ctx, (width - 280) / 2, qrY + qrSize + 36, 280, 48, 24)
        ctx.fill()
        ctx.fillStyle = '#000000'
        ctx.font = '900 22px "Barlow", sans-serif, system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('📷 SCAN FOR MEDICAL INFO', width / 2, qrY + qrSize + 68)

        // Instructions under pill
        ctx.fillStyle = '#94a3b8'
        ctx.font = '600 20px "Barlow", sans-serif, system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('Point any smartphone camera to open emergency profile instantly', width / 2, qrBoxY + qrBoxHeight - 26)

        // 7. Emergency Contact (ICE) Box
        const ecY = 1135
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)'
        drawRoundRect(ctx, 90, ecY, width - 180, 215, 28)
        ctx.fill()
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'
        ctx.lineWidth = 2
        drawRoundRect(ctx, 90, ecY, width - 180, 215, 28)
        ctx.stroke()

        ctx.fillStyle = '#ef4444'
        ctx.font = '800 22px "Barlow", sans-serif, system-ui'
        ctx.textAlign = 'left'
        ctx.fillText('📞 IN CASE OF EMERGENCY (ICE)', 130, ecY + 50)

        const primaryContact = profile.contacts && profile.contacts[0]
        if (primaryContact) {
          ctx.fillStyle = '#ffffff'
          ctx.font = '800 38px "Barlow", sans-serif, system-ui'
          ctx.fillText(`${primaryContact.name} ${primaryContact.rel ? `(${primaryContact.rel})` : ''}`, 130, ecY + 108)

          ctx.fillStyle = '#38bdf8'
          ctx.font = '800 36px "Barlow", sans-serif, system-ui'
          ctx.fillText(primaryContact.phone, 130, ecY + 162)
        } else {
          ctx.fillStyle = '#ffffff'
          ctx.font = '700 30px "Barlow", sans-serif, system-ui'
          ctx.fillText('Emergency Profile Active', 130, ecY + 120)
        }

        // 8. Footer Info
        ctx.fillStyle = '#94a3b8'
        ctx.font = '600 19px "Barlow", sans-serif, system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('📱 Perfect for Phone Lock Screen Wallpaper or Wallet Card', width / 2, 1420)

        ctx.fillStyle = 'rgba(0, 213, 236, 0.85)'
        ctx.font = '600 19px monospace'
        ctx.fillText(profile.url, width / 2, 1458)

        ctx.fillStyle = '#475569'
        ctx.font = '500 16px "Barlow", sans-serif, system-ui'
        ctx.fillText('SafeScan Universal Guardian Network • Open in App or Browser', width / 2, 1495)

        resolve(canvas.toDataURL('image/png'))
      }
      qr.onerror = () => resolve(qrDataUrl)
      qr.src = qrDataUrl
    } catch {
      resolve(qrDataUrl)
    }
  })
}

export default function CreatePage() {
  const [allergies,   setAllergies]   = useState<string[]>([])
  const [meds,        setMeds]        = useState<string[]>([])
  const [contacts,    setContacts]    = useState<Contact[]>([])
  const [showCM,      setShowCM]      = useState(false)
  const [cmName,      setCmName]      = useState('')
  const [cmPhone,     setCmPhone]     = useState('')
  const [cmRel,       setCmRel]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [success,     setSuccess]     = useState<SuccessProfile | null>(null)
  const [viewMode,    setViewMode]    = useState<'card' | 'qr'>('card')
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

      // Generate high-resolution QR pointing to the live profile URL with offline emergency payload
      const offlineParams = new URLSearchParams()
      if (name) offlineParams.set('n', name)
      if (blood) offlineParams.set('b', blood)
      if (allergies && allergies.length > 0) offlineParams.set('a', allergies.slice(0, 3).join(','))
      if (contacts && contacts.length > 0) {
        offlineParams.set('c', contacts.map((c: any) => `${c.name}:${c.phone}:${c.rel || ''}`).join(';'))
      }
      const profileUrl = `${window.location.origin}/p/${data.id}`
      const fullQrUrl = `${profileUrl}?${offlineParams.toString()}`

      const qrImg = await QRCode.toDataURL(fullQrUrl, {
        width: 500, margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      })

      // Generate the attractive high-resolution emergency ID card
      const cardImg = await generateStyledCard(qrImg, {
        name,
        bloodType: blood,
        allergies,
        contacts,
        conditions,
        organDonor: organ,
        url: profileUrl,
      })

      setSuccess({
        id: data.id,
        url: profileUrl,
        qrImg,
        cardImg,
        name,
        bloodType: blood,
        allergies,
        contacts,
        conditions,
        organDonor: organ,
      })
      try {
        localStorage.setItem('safescan_my_id', data.id)
        localStorage.setItem('safescan_my_name', name)
        localStorage.setItem('safescan_my_blood', blood || 'Unknown')
        localStorage.setItem('safescan_my_allergies', JSON.stringify(allergies))
        localStorage.setItem('safescan_my_contacts', JSON.stringify(contacts))
      } catch (err) {
        console.warn('Could not save to localStorage', err)
      }
      showToast('✅ Emergency Profile & Card Ready!', 'ok')
    } catch {
      showToast('Network error. Try again.', 'err')
    }
    setLoading(false)
  }

  // Download the attractive high-res emergency card (wallpaper / wallet)
  function downloadEmergencyCard() {
    if (!success) return
    const a = document.createElement('a')
    a.href = success.cardImg
    const slug = (success.name || 'emergency').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    a.download = `safescan-emergency-card-${slug}.png`
    a.click()
  }

  // Download raw QR code image
  function downloadRawQR() {
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
    window.scrollTo(0,0)
  }

  return (
    <>
      <nav className="top-nav">
        <Link href="/" className="nav-logo"><div className="logo-icon">🛡</div>SafeScan</Link>
        <ul className="nav-links">
          <li><Link href="/" className="btn-ghost" style={{padding:'6px 14px',fontSize:'.78rem'}}>← Back to Home</Link></li>
        </ul>
      </nav>

      <div style={{paddingTop:62,minHeight:'100vh',background:'var(--bg)'}}>
        <div className="ep-wrap">
          <div className="ep-hdr">
            <Link href="/" className="ep-back">←</Link>
            <h1>Emergency Profile</h1>
          </div>
          <p className="ep-subtitle">Saved to cloud — scan the QR from any device, anywhere.</p>

          {!success ? (
            <>
              {/* Basic Info */}
              <div className="ep-card">
                <div className="ep-card-hd"><span style={{color:'var(--red)'}}>👤</span> Basic Information</div>
                <div className="ep-field"><label className="ep-lbl">Full Name *</label><input className="ep-in" type="text" id="ep-name" placeholder="e.g. Kiran" /></div>
                <div className="ep-field">
                  <label className="ep-lbl">Blood Group *</label>
                  <select className="ep-in" id="ep-blood">
                    <option value="">Select blood group (e.g. B+)</option>
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
                  <label className="ep-lbl">Current Medications</label>
                  <div className="add-row">
                    <input ref={medRef} className="ep-in" type="text" placeholder="Add medication" value={medInp}
                      onChange={e => setMedInp(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('med'))} />
                    <button className="add-btn" onClick={() => addTag('med')}>+</button>
                  </div>
                  <div className="tags">{meds.map((t,i) => <span key={i} className="tag tag-med">{t}<button className="tag-x" onClick={() => setMeds(m => m.filter((_,j)=>j!==i))}>×</button></span>)}</div>
                </div>

                <div className="ep-field"><label className="ep-lbl">Medical Conditions</label><input className="ep-in" type="text" id="ep-conditions" placeholder="e.g. Asthma, Diabetes, Hypertension" /></div>
                <div className="ep-field"><label className="ep-lbl">Special Notes for Paramedics</label><input className="ep-in" type="text" id="ep-notes" placeholder="e.g. Pacemaker fitted, deaf in left ear" /></div>
              </div>

              {/* Emergency Contacts */}
              <div className="ep-card">
                <div className="ep-card-hd"><span style={{color:'var(--red)'}}>📞</span> Emergency Contacts *</div>
                <p style={{fontSize:'.78rem',color:'var(--muted)',marginBottom:14}}>Add at least one person who should be called in an emergency.</p>
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
            </>
          ) : (
            <div className="qr-success show">
              <div style={{fontSize:'2.5rem',marginBottom:10,animation:'fadeInScale .4s ease both'}}>🛡️</div>
              <h2 style={{fontSize:'1.6rem',fontWeight:800,marginBottom:6}}>Emergency ID Card Ready!</h2>
              <p style={{marginBottom:20,color:'var(--muted)'}}>Your profile is live. We generated a high-definition Emergency ID Card for you.</p>

              {/* Card / QR Toggle */}
              <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:18}}>
                <button
                  type="button"
                  style={{
                    padding:'7px 18px',
                    borderRadius:20,
                    fontSize:'.82rem',
                    fontWeight:700,
                    cursor:'pointer',
                    transition:'all .2s ease',
                    background: viewMode === 'card' ? 'var(--accent)' : 'var(--bg3)',
                    color: viewMode === 'card' ? '#000' : 'var(--text)',
                    border: '1px solid ' + (viewMode === 'card' ? 'var(--accent)' : 'var(--border)'),
                    boxShadow: viewMode === 'card' ? '0 0 14px rgba(0, 180, 200, 0.35)' : 'none'
                  }}
                  onClick={() => setViewMode('card')}>
                  🪪 Emergency ID Card
                </button>
                <button
                  type="button"
                  style={{
                    padding:'7px 18px',
                    borderRadius:20,
                    fontSize:'.82rem',
                    fontWeight:700,
                    cursor:'pointer',
                    transition:'all .2s ease',
                    background: viewMode === 'qr' ? 'var(--accent)' : 'var(--bg3)',
                    color: viewMode === 'qr' ? '#000' : 'var(--text)',
                    border: '1px solid ' + (viewMode === 'qr' ? 'var(--accent)' : 'var(--border)'),
                    boxShadow: viewMode === 'qr' ? '0 0 14px rgba(0, 180, 200, 0.35)' : 'none'
                  }}
                  onClick={() => setViewMode('qr')}>
                  🏁 QR Code Only
                </button>
              </div>

              {/* Display Preview */}
              {viewMode === 'card' ? (
                <div style={{maxWidth:360,margin:'0 auto 20px',borderRadius:22,overflow:'hidden',boxShadow:'0 16px 45px rgba(0, 180, 200, 0.22)',border:'2px solid rgba(0, 213, 236, 0.45)'}}>
                  <img src={success.cardImg} alt="Emergency ID Card" style={{width:'100%',display:'block',height:'auto'}} />
                </div>
              ) : (
                <div className="qr-box" style={{animation:'fadeInScale .5s .1s ease both'}}>
                  <div style={{position:'relative'}}>
                    <img src={success.qrImg} alt="QR Code" width={240} height={240} style={{borderRadius:12}} />
                    <div style={{position:'absolute',bottom:-8,left:'50%',transform:'translateX(-50%)',background:'var(--accent)',color:'#000',fontSize:'.65rem',fontWeight:800,padding:'3px 12px',borderRadius:100,letterSpacing:'.08em',whiteSpace:'nowrap'}}>SCAN ME</div>
                  </div>
                </div>
              )}
              
              <div className="qr-url-box" style={{marginTop:16}}>
                <span>{success.url}</span>
                <button className="btn-ghost" style={{padding:'4px 12px',fontSize:'.75rem',flexShrink:0}}
                  onClick={() => { navigator.clipboard.writeText(success.url); showToast('URL copied!','ok') }}>
                  Copy
                </button>
              </div>
              
              <div className="qr-btns" style={{marginBottom:20}}>
                <button className="btn-red" onClick={downloadEmergencyCard} style={{background:'var(--accent)',color:'#000',fontWeight:800,boxShadow:'0 0 18px rgba(0, 180, 200, 0.35)'}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  Download Emergency Card
                </button>
                <button className="btn-red" onClick={downloadRawQR} style={{background:'#162032',color:'#fff',border:'1px solid rgba(0,213,236,.3)'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="17" y="17" width="3" height="3"/></svg>
                  Download QR Only
                </button>
                <Link href={`/p/${success.id}`} className="btn-red" style={{background:'#1e293b',border:'1px solid rgba(255,255,255,.12)'}} target="_blank">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  Preview
                </Link>
                <button className="btn-ghost" onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'My SafeScan Emergency Profile', url: success.url }).catch(() => {})
                  } else {
                    navigator.clipboard.writeText(success.url); showToast('Link copied!','ok')
                  }
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Share
                </button>
              </div>

              {/* Lock Screen Wallpaper Tip */}
              <div style={{background:'rgba(0, 180, 200, 0.08)',border:'1px solid rgba(0, 213, 236, 0.3)',borderRadius:16,padding:'18px 20px',textAlign:'left',marginBottom:16}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                  <span style={{fontSize:'1.2rem'}}>📱</span>
                  <span style={{fontSize:'.86rem',fontWeight:800,color:'var(--accent)'}}>Pro Tip: Set as Lock Screen Wallpaper</span>
                </div>
                <ol style={{fontSize:'.8rem',color:'rgba(255,255,255,.75)',lineHeight:1.8,paddingLeft:18,margin:0}}>
                  <li>Tap <strong>Download Emergency Card</strong> above.</li>
                  <li>Open your phone <strong>Settings → Wallpaper</strong>.</li>
                  <li>Set the card as your <strong>Lock Screen Wallpaper</strong>.</li>
                  <li>First responders can read your emergency details & ICE contact immediately, or scan for complete history without unlocking your phone!</li>
                </ol>
              </div>

              {/* Sponsored Ad Banner */}
              <AdBanner slot="create-success" format="card" />

              <button className="btn-ghost" onClick={resetForm} style={{width:'100%',justifyContent:'center'}}>＋ Create Another Profile</button>
            </div>
          )}
        </div>

        {/* Fixed bottom bar */}
        {!success && (
          <div className="ep-bar" id="ep-bar">
            <div className="ep-bar-inner">
              <button className="ep-gen-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spin" />Saving...</> : 'Save & Generate QR Code'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      <div className={`cm-bg${showCM?' open':''}`} onClick={e => e.target === e.currentTarget && setShowCM(false)}>
        <div className="cm-box">
          <h3>Add Emergency Contact</h3>
          <div className="cm-f"><label>Name *</label><input ref={cmNameRef} type="text" placeholder="e.g. Ram" value={cmName} onChange={e=>setCmName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveContact()} /></div>
          <div className="cm-f"><label>Phone Number *</label><input type="tel" placeholder="e.g. +91 98765 43210" value={cmPhone} onChange={e=>setCmPhone(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveContact()} /></div>
          <div className="cm-f"><label>Relationship</label><input type="text" placeholder="e.g. Father, Mother, Doctor" value={cmRel} onChange={e=>setCmRel(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveContact()} /></div>
          <div className="cm-btns">
            <button className="cm-cancel" onClick={() => setShowCM(false)}>Cancel</button>
            <button className="cm-save" onClick={saveContact}>Add Contact</button>
          </div>
        </div>
      </div>

      {/* Native Bottom Navigation */}
      <BottomNav />

      {/* Toast */}
      {toast && <div className={`toast show ${toast.type}`}>{toast.msg}</div>}
    </>
  )
}
