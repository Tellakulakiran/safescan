'use client'
import { useState, useEffect } from 'react'

interface AdBannerProps {
  slot?: string
  format?: 'banner' | 'card'
}

export default function AdBanner({ slot = 'emergency-banner', format = 'banner' }: AdBannerProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <div className={`ad-wrapper ${format === 'card' ? 'ad-card-style' : 'ad-banner-style'}`} style={{
      maxWidth: 720,
      margin: '24px auto',
      padding: format === 'card' ? '20px' : '12px 18px',
      background: 'rgba(15, 23, 42, 0.75)',
      border: '1px solid rgba(0, 213, 236, 0.2)',
      borderRadius: 16,
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ad Label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        fontSize: '.68rem',
        color: 'var(--muted)',
      }}>
        <span style={{
          background: 'rgba(255,255,255,.08)',
          padding: '2px 8px',
          borderRadius: 6,
          fontWeight: 700,
          letterSpacing: '.05em',
          textTransform: 'uppercase',
        }}>
          Sponsored
        </span>
        <span style={{ fontSize: '.7rem', color: 'var(--muted)' }}>
          Health & Safety Partner
        </span>
      </div>

      {/* Ad Content / Fallback Sponsored Health Partner */}
      <div style={{
        minHeight: format === 'card' ? 90 : 60,
        display: 'flex',
        flexDirection: format === 'card' ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '8px 12px',
        background: 'rgba(6, 11, 19, 0.6)',
        borderRadius: 12,
        border: '1px dashed rgba(255,255,255,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #00b4c8 0%, #0077b6 100%)',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1.3rem',
            flexShrink: 0,
          }}>
            💊
          </div>
          <div>
            <div style={{ fontSize: '.88rem', fontWeight: 800, color: '#fff' }}>
              First Aid & Medicine Delivery in 10 Mins
            </div>
            <div style={{ fontSize: '.76rem', color: 'var(--muted)' }}>
              Get verified emergency medical kits, pain relief & supplies delivered 24/7.
            </div>
          </div>
        </div>

        <a
          href="https://www.google.com/search?q=24+hour+pharmacy+near+me"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'var(--accent)',
            color: '#000',
            fontWeight: 800,
            fontSize: '.78rem',
            padding: '8px 18px',
            borderRadius: 10,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            boxShadow: '0 0 12px rgba(0, 180, 200, 0.3)',
          }}
        >
          Check Offers →
        </a>
      </div>

      {/* Google AdMob / AdSense Hook (Activates automatically when publisher ID is supplied) */}
      <div id={`admob-slot-${slot}`} style={{ display: 'none' }}></div>
    </div>
  )
}
