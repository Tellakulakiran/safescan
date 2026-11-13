'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import QRScannerModal from './QRScannerModal'
import NearbyModal from './NearbyModal'
import BottomNav from './BottomNav'
import AdBanner from './AdBanner'

export default function MobileAppHome() {
  const [profile, setProfile] = useState<{
    id: string
    name: string
    bloodType: string
    allergies?: string[]
    contactName?: string
    contactPhone?: string
  } | null>(null)

  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isNearbyOpen, setIsNearbyOpen] = useState(false)
  const [showWallpaperGuide, setShowWallpaperGuide] = useState(false)

  useEffect(() => {
    try {
      const savedId = localStorage.getItem('safescan_my_id')
      if (savedId) {
        const name = localStorage.getItem('safescan_my_name') || 'Emergency Profile'
        const bloodType = localStorage.getItem('safescan_my_blood') || 'Unknown'
        let allergies: string[] = []
        try {
          const a = localStorage.getItem('safescan_my_allergies')
          if (a) allergies = JSON.parse(a)
        } catch {}
        setProfile({ id: savedId, name, bloodType, allergies })
      }
    } catch {}
  }, [])

  return (
    <div className="native-mobile-container">
      {/* Native App Top Header */}
      <header className="native-app-header">
        <div className="header-left">
          <div className="header-logo-icon">🛡️</div>
          <div>
            <h1 className="header-app-title">SafeScan</h1>
            <div className="header-status-pill">
              <span className="live-pulse-dot" />
              <span>EMERGENCY READY</span>
            </div>
          </div>
        </div>
        <a href="tel:112" className="header-sos-btn" aria-label="Call 112 Emergency">
          <span className="sos-icon">🚨</span>
          <span className="sos-text">SOS 112</span>
        </a>
      </header>

      {/* Main Content Area */}
      <main className="native-main-content">
        {/* HERO CARD: Active Medical ID or Create Prompt */}
        {profile ? (
          <div className="active-id-card">
            <div className="id-card-glow" />
            <div className="id-card-top">
              <div className="id-card-badge">ACTIVE MEDICAL ID</div>
              <div className="id-card-chip">🪪 VERIFIED</div>
            </div>

            <div className="id-card-body">
              <h2 className="id-card-name">{profile.name}</h2>
              <div className="id-card-tags">
                <span className="id-tag blood">🩸 {profile.bloodType}</span>
                {profile.allergies && profile.allergies.length > 0 ? (
                  <span className="id-tag allergy">⚠️ {profile.allergies.join(', ')}</span>
                ) : (
                  <span className="id-tag safe">✓ No Allergies</span>
                )}
              </div>
            </div>

            <div className="id-card-actions">
              <Link href={`/p/${profile.id}`} className="btn-id-view">
                <span>View Full Emergency QR & Card</span>
                <span className="btn-arrow">→</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="setup-id-card">
            <div className="setup-card-glow" />
            <div className="setup-badge">⚠️ NO EMERGENCY ID FOUND</div>
            <h2 className="setup-title">Protect Your Life in Seconds</h2>
            <p className="setup-desc">
              When an accident happens, paramedics scan your phone to check your blood group and emergency contacts.
            </p>
            <Link href="/create" className="btn-setup-create">
              <span className="btn-icon">＋</span>
              <span>Create My Emergency Medical ID</span>
            </Link>
            <div className="setup-footer-note">✓ 100% Free • No Account Needed • Works Offline</div>
          </div>
        )}

        {/* QUICK EMERGENCY SOS DIALER ROW */}
        <section className="emergency-dialers-section">
          <div className="section-label">INSTANT EMERGENCY DISPATCH (24/7)</div>
          <div className="dialers-grid">
            <a href="tel:108" className="dialer-chip ambulance">
              <span className="dialer-icon">🚑</span>
              <div className="dialer-meta">
                <span className="dialer-num">108</span>
                <span className="dialer-desc">Ambulance</span>
              </div>
            </a>
            <a href="tel:112" className="dialer-chip national">
              <span className="dialer-icon">🚨</span>
              <div className="dialer-meta">
                <span className="dialer-num">112</span>
                <span className="dialer-desc">National SOS</span>
              </div>
            </a>
            <a href="tel:100" className="dialer-chip police">
              <span className="dialer-icon">🚓</span>
              <div className="dialer-meta">
                <span className="dialer-num">100</span>
                <span className="dialer-desc">Police</span>
              </div>
            </a>
            <a href="tel:101" className="dialer-chip fire">
              <span className="dialer-icon">🚒</span>
              <div className="dialer-meta">
                <span className="dialer-num">101</span>
                <span className="dialer-desc">Fire</span>
              </div>
            </a>
          </div>
        </section>

        {/* 2X2 CORE ACTION GRID */}
        <section className="app-actions-section">
          <div className="section-label">QUICK TOOLS</div>
          <div className="actions-2x2-grid">
            {/* Scan QR */}
            <div 
              className="action-tile scan-tile"
              onClick={() => setIsScannerOpen(true)}
              role="button"
              tabIndex={0}
            >
              <div className="action-tile-icon-wrap scan">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                  <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                  <rect x="7" y="7" width="10" height="10" rx="1"/>
                </svg>
              </div>
              <h3 className="action-tile-title">Scan QR Code</h3>
              <p className="action-tile-sub">Scan someone else&apos;s medical profile</p>
              <div className="action-tile-tag">Instant Camera</div>
            </div>

            {/* Nearby Care */}
            <div 
              className="action-tile nearby-tile"
              onClick={() => setIsNearbyOpen(true)}
              role="button"
              tabIndex={0}
            >
              <div className="action-tile-icon-wrap nearby">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h3 className="action-tile-title">Nearby Care</h3>
              <p className="action-tile-sub">Hospitals, trauma & medical stores</p>
              <div className="action-tile-tag">Live GPS</div>
            </div>

            {/* Lock Screen Wallpaper Guide */}
            <div 
              className="action-tile wallpaper-tile"
              onClick={() => setShowWallpaperGuide(true)}
              role="button"
              tabIndex={0}
            >
              <div className="action-tile-icon-wrap wallpaper">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
              </div>
              <h3 className="action-tile-title">Lock Screen ID</h3>
              <p className="action-tile-sub">Save QR as your lockscreen wallpaper</p>
              <div className="action-tile-tag">Life Saver</div>
            </div>

            {/* Offline Safety */}
            <div 
              className="action-tile offline-tile"
              onClick={() => alert('SafeScan encodes all vital medical info directly into your QR code and caches your data offline. Even with ZERO internet or cellular coverage, emergency services can read your medical data!')}
              role="button"
              tabIndex={0}
            >
              <div className="action-tile-icon-wrap offline">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01"/>
                </svg>
              </div>
              <h3 className="action-tile-title">Offline Ready</h3>
              <p className="action-tile-sub">Works 100% without internet</p>
              <div className="action-tile-tag">Protected</div>
            </div>
          </div>
        </section>

        {/* Sponsor Banner */}
        <div style={{ marginTop: 20, marginBottom: 80 }}>
          <AdBanner slot="mobile-app-footer" />
        </div>
      </main>

      {/* Lockscreen Guide Modal */}
      {showWallpaperGuide && (
        <div className="scanner-modal-backdrop" onClick={e => e.target === e.currentTarget && setShowWallpaperGuide(false)}>
          <div className="guide-modal-sheet">
            <div className="scanner-header">
              <div className="scanner-title">
                <span className="scanner-icon">📱</span>
                <h3>Set As Lock Screen Wallpaper</h3>
              </div>
              <button type="button" className="scanner-close-btn" onClick={() => setShowWallpaperGuide(false)}>✕</button>
            </div>
            <div className="guide-modal-body">
              <div className="guide-step">
                <span className="step-num">1</span>
                <div>
                  <h4>Create or Open Your Medical ID</h4>
                  <p>Click &quot;View Full Emergency QR&quot; above to see your generated emergency card.</p>
                </div>
              </div>
              <div className="guide-step">
                <span className="step-num">2</span>
                <div>
                  <h4>Download Wallpaper / Take Screenshot</h4>
                  <p>Tap the &quot;Download Emergency Card&quot; button or take a screenshot of your QR code.</p>
                </div>
              </div>
              <div className="guide-step">
                <span className="step-num">3</span>
                <div>
                  <h4>Set as Phone Lock Screen</h4>
                  <p>Go to your phone&apos;s Settings → Wallpaper → Set as Lock Screen. First responders can now scan your phone without unlocking it!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
      <NearbyModal isOpen={isNearbyOpen} onClose={() => setIsNearbyOpen(false)} />

      {/* Native Bottom Navigation Bar */}
      <BottomNav 
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenNearby={() => setIsNearbyOpen(true)}
      />
    </div>
  )
}
