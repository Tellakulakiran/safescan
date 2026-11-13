'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import MobileAppHome from './MobileAppHome'
import AdBanner from './AdBanner'

export default function HomeClient() {
  const [isMobileOrApp, setIsMobileOrApp] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [manualView, setManualView] = useState<'auto' | 'mobile' | 'desktop'>('auto')

  useEffect(() => {
    setMounted(true)
    const checkIsMobileOrApp = () => {
      // Check if installed PWA / TWA (standalone)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           (window.navigator as any).standalone === true ||
                           document.referrer.includes('android-app://')

      // Check if mobile viewport or touch device
      const isMobileScreen = window.innerWidth <= 768

      setIsMobileOrApp(isStandalone || isMobileScreen)
    }

    checkIsMobileOrApp()
    window.addEventListener('resize', checkIsMobileOrApp)
    return () => window.removeEventListener('resize', checkIsMobileOrApp)
  }, [])

  // If not mounted yet, render standard content to avoid hydration mismatch
  if (!mounted) {
    return <MobileAppHome />
  }

  const showMobile = manualView === 'mobile' || (manualView === 'auto' && isMobileOrApp)

  if (showMobile) {
    return (
      <>
        {/* If user is testing on desktop, show a subtle switch to web mode pill */}
        {!isMobileOrApp && (
          <div style={{
            position: 'fixed',
            top: 12,
            right: 12,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.8)',
            border: '1px solid rgba(0, 213, 236, 0.4)',
            borderRadius: 100,
            padding: '4px 12px',
            fontSize: '.75rem',
            color: '#fff',
            cursor: 'pointer',
          }} onClick={() => setManualView('desktop')}>
            💻 Switch to Website View
          </div>
        )}
        <MobileAppHome />
      </>
    )
  }

  // Desktop Web Marketing Landing Page
  return (
    <>
      {/* Switch to App View Pill on Desktop */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #e8302a, #ff4d4d)',
        borderRadius: 100,
        padding: '12px 20px',
        fontSize: '.85rem',
        fontWeight: 700,
        color: '#fff',
        boxShadow: '0 8px 30px rgba(232, 48, 42, 0.5)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }} onClick={() => setManualView('mobile')}>
        <span>📱 Open Mobile App Mode</span>
      </div>

      {/* NAV */}
      <nav className="top-nav">
        <Link href="/" className="nav-logo">
          <div className="logo-icon">🛡</div>SafeScan
        </Link>
        <ul className="nav-links">
          <li className="hide-sm"><a href="#process">The Process</a></li>
          <li className="hide-sm"><a href="#features">Features</a></li>
          <li className="hide-sm"><a href="#howitworks">How It Works</a></li>
          <li><Link href="/create" className="nav-cta">Create Profile</Link></li>
        </ul>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="glow-l" /><div className="glow-r" />
        <div className="hero-l">
          <div className="badge-pill"><div className="bdot" />Emergency Ready</div>
          <h1 className="h1">Your <span className="red">Silent</span><br />Guardian</h1>
          <p className="hsub">When you can&apos;t speak, your phone speaks for you. One QR scan gives first responders everything they need.</p>
          <svg className="hb" style={{display:'block',width:220,height:36,marginBottom:32}} viewBox="0 0 220 36" fill="none">
            <path d="M0 18 L45 18 L52 18 L60 4 L70 32 L78 10 L85 26 L91 18 L220 18" stroke="#e8302a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.65"/>
          </svg>
          <div className="hbtns">
            <Link href="/create" className="btn-red">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="17" y="17" width="3" height="3"/></svg>
              Create Emergency Profile
            </Link>
          </div>
          <div className="htrust">
            <div className="ti"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3a3" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>No Account Needed</div>
            <div className="ti"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4af" strokeWidth="2"><path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01"/></svg>Works Offline</div>
            <div className="ti"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>Free Forever</div>
          </div>
        </div>
        <div className="hero-r">
          <div className="ph-shell">
            <div className="ph-glow" />
            <div className="ph-body">
              <div className="notch" />
              <div className="pht"><div className="t">9:41</div><div className="d">Wednesday, 18 February</div></div>
              <div className="qrc">
                <div className="beam" />
                <div className="qrw">
                  <svg width="128" height="128" viewBox="0 0 130 130" style={{background:'white',borderRadius:5,display:'block'}}>
                    <rect x="7" y="7" width="33" height="33" fill="#111" rx="3"/><rect x="12" y="12" width="23" height="23" fill="white"/><rect x="16" y="16" width="15" height="15" fill="#111" rx="1"/>
                    <rect x="90" y="7" width="33" height="33" fill="#111" rx="3"/><rect x="95" y="12" width="23" height="23" fill="white"/><rect x="99" y="16" width="15" height="15" fill="#111" rx="1"/>
                    <rect x="7" y="90" width="33" height="33" fill="#111" rx="3"/><rect x="12" y="95" width="23" height="23" fill="white"/><rect x="16" y="99" width="15" height="15" fill="#111" rx="1"/>
                    <rect x="46" y="7" width="5" height="5" fill="#111"/><rect x="56" y="7" width="5" height="5" fill="#111"/><rect x="71" y="7" width="5" height="5" fill="#111"/>
                    <rect x="7" y="46" width="5" height="5" fill="#111"/><rect x="17" y="46" width="5" height="5" fill="#111"/><rect x="46" y="46" width="5" height="5" fill="#111"/><rect x="61" y="46" width="5" height="5" fill="#111"/>
                    <rect x="7" y="56" width="5" height="5" fill="#111"/><rect x="46" y="56" width="5" height="5" fill="#111"/><rect x="66" y="56" width="5" height="5" fill="#111"/>
                    <rect x="46" y="86" width="5" height="5" fill="#111"/><rect x="61" y="86" width="5" height="5" fill="#111"/><rect x="76" y="86" width="5" height="5" fill="#111"/>
                    <rect x="46" y="96" width="5" height="5" fill="#111"/><rect x="61" y="96" width="5" height="5" fill="#111"/>
                    <rect x="51" y="106" width="5" height="5" fill="#111"/><rect x="71" y="106" width="5" height="5" fill="#111"/>
                  </svg>
                </div>
                <div className="phl"><span className="s1">Scan for Emergency</span><span className="s2">Protected • Always available</span></div>
              </div>
              <div className="hbar" />
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="hsec" id="process" style={{textAlign:'center'}}>
        <div className="eyebrow">The Process</div>
        <h2 className="stitle">3 Seconds. <span className="red">Infinite Impact.</span></h2>
        <p className="sdesc">When every second counts, SafeScan eliminates every barrier between a first responder and the information they need.</p>
        <div className="pcards">
          <span className="arr arr1">→</span><span className="arr arr2">→</span>
          <div className="pcard"><div className="pnum">01</div><div className="pico">📱</div><h3>Scan the QR</h3><p>Any smartphone camera scans the QR on the victim&apos;s locked screen. No app needed. Works offline too.</p></div>
          <div className="pcard"><div className="pnum">02</div><div className="pico">🪪</div><h3>View Profile</h3><p>An instant emergency profile opens — blood type, allergies, medications, and contacts with one-tap call buttons.</p></div>
          <div className="pcard"><div className="pnum">03</div><div className="pico">🚨</div><h3>Help Arrives</h3><p>First responders have everything they need to act fast — no delay, no guessing, no language barrier.</p></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="hsec alt" id="features" style={{textAlign:'center'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div className="eyebrow">Features</div>
          <h2 className="stitle">Built for the <span className="red">Worst Moments</span></h2>
          <p className="sdesc">Every feature designed with one goal: get the right information to the right people in the fastest time possible.</p>
          <div className="fgrid">
            <div className="fcard"><span className="fico">🔗</span><h4>Real URL per Profile</h4><p>Every profile gets a unique public URL. Scanning the QR opens a full, beautifully designed page — on any device.</p></div>
            <div className="fcard"><span className="fico">📵</span><h4>Works Offline Too</h4><p>No internet? The QR still shows your full emergency info as plain readable text. Nothing is hidden.</p></div>
            <div className="fcard"><span className="fico">👤</span><h4>No Account Needed</h4><p>Set up in 60 seconds. No email, no password, no sign-up — just fill and generate your QR.</p></div>
            <div className="fcard"><span className="fico">📲</span><h4>Instant App & Web Sync</h4><p>Works seamlessly as an app or web link. First responders can access vital info in seconds on any device.</p></div>
            <div className="fcard"><span className="fico">💊</span><h4>Full Medical Profile</h4><p>Blood type, allergies, medications, conditions, and emergency contacts — everything in one scan.</p></div>
            <div className="fcard"><span className="fico">📞</span><h4>One-Tap Call Buttons</h4><p>Emergency contacts appear with instant call buttons. Tapping calls directly from the page.</p></div>
          </div>
        </div>
      </section>

      {/* Ad Placement */}
      <div style={{padding:'0 20px'}}>
        <AdBanner slot="home-footer" />
      </div>

      {/* CTA */}
      <section className="ctasec">
        <h2>Don&apos;t Wait for an<br /><span className="red">Emergency</span></h2>
        <p>Set up your free emergency profile in 60 seconds. It costs nothing and could save everything.</p>
        <Link href="/create" className="btn-red" style={{fontSize:'1rem',padding:'17px 34px',margin:'0 auto'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="17" y="17" width="3" height="3"/></svg>
          Create Emergency Profile — Free
        </Link>
      </section>

      <footer className="sfooter">
        <Link href="/" className="flogo"><div className="logo-icon">🛡</div>SafeScan</Link>
        <p>© {new Date().getFullYear()} SafeScan. Your data is safe. • <Link href="/privacy" style={{color:'var(--accent)',textDecoration:'none'}}>Privacy Policy</Link></p>
        <p>Made with ❤ for emergency preparedness</p>
      </footer>
    </>
  )
}
