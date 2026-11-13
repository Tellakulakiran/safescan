'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BottomNavProps {
  onOpenScanner?: () => void
  onOpenNearby?: () => void
}

export default function BottomNav({ onOpenScanner, onOpenNearby }: BottomNavProps) {
  const pathname = usePathname()

  // Check if user has saved profile ID
  const [profileId, setProfileId] = React.useState<string | null>(null)

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('safescan_my_id')
      if (saved) setProfileId(saved)
    } catch {}
  }, [])

  const myIdLink = profileId ? `/p/${profileId}` : '/create'

  return (
    <nav className="native-bottom-nav">
      <Link href="/" className={`bnav-item ${pathname === '/' ? 'active' : ''}`}>
        <div className="bnav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span className="bnav-label">Home</span>
      </Link>

      <Link href={myIdLink} className={`bnav-item ${pathname?.startsWith('/p/') || pathname === '/create' ? 'active' : ''}`}>
        <div className="bnav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="3"/>
            <circle cx="9" cy="10" r="2.5"/>
            <line x1="15" y1="8" x2="17" y2="8"/>
            <line x1="15" y1="12" x2="17" y2="12"/>
            <line x1="7" y1="16" x2="17" y2="16"/>
          </svg>
        </div>
        <span className="bnav-label">{profileId ? 'My ID' : 'Create ID'}</span>
      </Link>

      {/* Center QR Scanner Action Button */}
      <button 
        type="button" 
        className="bnav-center-btn"
        onClick={onOpenScanner}
        aria-label="Scan QR Code"
      >
        <div className="bnav-center-circle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
            <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
            <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
            <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
            <rect x="7" y="7" width="10" height="10" rx="1"/>
            <line x1="10" y1="12" x2="14" y2="12"/>
          </svg>
        </div>
        <span className="bnav-label">Scan</span>
      </button>

      <button 
        type="button" 
        className="bnav-item"
        onClick={onOpenNearby}
      >
        <div className="bnav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <span className="bnav-label">Nearby</span>
      </button>

      <a href="tel:112" className="bnav-item bnav-sos">
        <div className="bnav-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>
        <span className="bnav-label">SOS 112</span>
      </a>
    </nav>
  )
}
