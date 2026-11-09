'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ProPage() {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  function handleSubscribe(planName: string, price: string) {
    setCheckoutLoading(true)
    setTimeout(() => {
      setCheckoutLoading(false)
      setShowSuccessModal(true)
    }, 1200)
  }

  return (
    <>
      {/* Top Nav */}
      <nav className="top-nav">
        <Link href="/" className="nav-logo">
          <div className="logo-icon">🛡</div>SafeScan
        </Link>
        <ul className="nav-links">
          <li><Link href="/" className="hide-sm">Home</Link></li>
          <li><Link href="/create" className="hide-sm">Create Profile</Link></li>
          <li><Link href="/pro" className="nav-cta" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#000', fontWeight: 900 }}>👑 PRO</Link></li>
        </ul>
      </nav>

      <div style={{ paddingTop: 85, paddingBottom: 80, minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px' }}>
          
          {/* Hero Banner */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 100,
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#f59e0b',
              fontSize: '.82rem',
              fontWeight: 800,
              marginBottom: 16,
              letterSpacing: '.05em',
            }}>
              <span>👑 UPGRADE TO SAFESCAN PRO</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: 16, color: '#fff' }}>
              Ultimate Protection For<br /><span style={{ color: 'var(--accent)' }}>You & Your Family</span>
            </h1>

            <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
              Get instant SMS & WhatsApp alerts with live GPS location the moment someone scans your QR code, plus family multi-profiles and document storage.
            </p>

            {/* Monthly / Annual Toggle */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 100,
              padding: '4px',
              marginTop: 28,
            }}>
              <button
                onClick={() => setBillingCycle('annual')}
                style={{
                  padding: '9px 22px',
                  borderRadius: 100,
                  fontSize: '.86rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: 'none',
                  background: billingCycle === 'annual' ? 'var(--accent)' : 'transparent',
                  color: billingCycle === 'annual' ? '#000' : 'var(--muted)',
                  transition: 'all .2s ease',
                  boxShadow: billingCycle === 'annual' ? '0 0 16px rgba(0, 180, 200, 0.35)' : 'none',
                }}
              >
                Annual (Save 50% 🔥)
              </button>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '9px 22px',
                  borderRadius: 100,
                  fontSize: '.86rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: 'none',
                  background: billingCycle === 'monthly' ? 'var(--accent)' : 'transparent',
                  color: billingCycle === 'monthly' ? '#000' : 'var(--muted)',
                  transition: 'all .2s ease',
                  boxShadow: billingCycle === 'monthly' ? '0 0 16px rgba(0, 180, 200, 0.35)' : 'none',
                }}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
            marginBottom: 60,
          }}>
            {/* Free Plan */}
            <div style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: 24,
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Basic Plan
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginTop: 4, marginBottom: 10 }}>Free Forever</h3>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', marginBottom: 16 }}>
                  ₹0 <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 500 }}>/ life</span>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '.86rem', marginBottom: 24 }}>
                  Essential medical emergency profile for individual use.
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: '.88rem' }}>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: '#22c55e', fontWeight: 900 }}>✓</span> 1 Emergency Medical Profile
                  </li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: '#22c55e', fontWeight: 900 }}>✓</span> High-Resolution QR Code & Pass
                  </li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: '#22c55e', fontWeight: 900 }}>✓</span> Up to 2 Emergency Contacts
                  </li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: '#22c55e', fontWeight: 900 }}>✓</span> Nearby Hospitals & Police Finder
                  </li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--muted)' }}>
                    <span>✕</span> No Instant Scan GPS Alerts
                  </li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--muted)' }}>
                    <span>✕</span> No Family Multi-Profiles
                  </li>
                </ul>
              </div>

              <Link href="/create" className="btn-ghost" style={{ marginTop: 32, textAlign: 'center', justifyContent: 'center' }}>
                Continue Free
              </Link>
            </div>

            {/* PRO Plan (Featured) */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(8, 14, 25, 0.98))',
              border: '2px solid rgba(0, 213, 236, 0.5)',
              borderRadius: 24,
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0, 180, 200, 0.15)',
            }}>
              {/* Badge */}
              <div style={{
                position: 'absolute',
                top: -14,
                right: 28,
                background: 'linear-gradient(135deg, #00d5ec 0%, #0284c7 100%)',
                color: '#000',
                fontWeight: 900,
                fontSize: '.74rem',
                padding: '4px 14px',
                borderRadius: 100,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                boxShadow: '0 4px 14px rgba(0, 213, 236, 0.4)',
              }}>
                MOST POPULAR
              </div>

              <div>
                <span style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Complete Guardian
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginTop: 4, marginBottom: 10 }}>SafeScan PRO</h3>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', marginBottom: 16 }}>
                  {billingCycle === 'annual' ? (
                    <>₹599 <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 500 }}>/ year (₹49/mo)</span></>
                  ) : (
                    <>₹99 <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 500 }}>/ month</span></>
                  )}
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '.86rem', marginBottom: 24 }}>
                  Maximum safety with real-time GPS scanner notifications and family security.
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: '.88rem' }}>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#fff' }}>
                    <span style={{ color: '#00d5ec', fontWeight: 900 }}>⚡</span>
                    <strong>Instant Scan SMS & WhatsApp Alert to Family with GPS</strong>
                  </li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#fff' }}>
                    <span style={{ color: '#00d5ec', fontWeight: 900 }}>👨‍👩‍👧</span>
                    <strong>Family Pack:</strong> Up to 5 Profiles (Kids & Parents)
                  </li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#fff' }}>
                    <span style={{ color: '#00d5ec', fontWeight: 900 }}>📁</span>
                    <strong>Medical Vault:</strong> Upload Prescriptions & Insurance Card
                  </li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: '#00d5ec', fontWeight: 900 }}>✓</span> Unlimited Emergency Contacts & Doctors
                  </li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: '#00d5ec', fontWeight: 900 }}>🚫</span> 100% Ad-Free Clean Interface
                  </li>
                  <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: '#00d5ec', fontWeight: 900 }}>⭐</span> Priority First Responder Assistance
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe('PRO', billingCycle === 'annual' ? '₹599/yr' : '₹99/mo')}
                disabled={checkoutLoading}
                className="btn-red"
                style={{
                  marginTop: 32,
                  width: '100%',
                  background: 'var(--accent)',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: '.95rem',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(0, 180, 200, 0.4)',
                }}
              >
                {checkoutLoading ? 'Connecting Gateway...' : 'Upgrade to SafeScan PRO'}
              </button>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div style={{ textAlign: 'center', marginTop: 40, marginBottom: 50 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 12 }}>Why SafeScan PRO Saves Lives</h2>
            <p style={{ color: 'var(--muted)', fontSize: '.92rem', maxWidth: 520, margin: '0 auto 36px' }}>
              Advanced emergency features engineered for accidents, elder care, and outdoor sports.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
              textAlign: 'left',
            }}>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 18, padding: '24px' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>📍</div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Instant GPS Scan Alert</h4>
                <p style={{ color: 'var(--muted)', fontSize: '.84rem', lineHeight: 1.6 }}>
                  If you have an accident and a bystander scans your helmet or phone QR, your family immediately receives an automated WhatsApp and SMS containing the exact Google Maps location of where you were scanned.
                </p>
              </div>

              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 18, padding: '24px' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>👨‍👩‍👧‍👦</div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Family Protection Pack</h4>
                <p style={{ color: 'var(--muted)', fontSize: '.84rem', lineHeight: 1.6 }}>
                  Manage multiple emergency passes for your elderly parents, spouse, school-going children, and even pets under one simple, synchronized account.
                </p>
              </div>

              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 18, padding: '24px' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>📑</div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Digital Medical Vault</h4>
                <p style={{ color: 'var(--muted)', fontSize: '.84rem', lineHeight: 1.6 }}>
                  Paramedics and emergency doctors can view your cash-less health insurance card image, doctor prescriptions, and ECG history without delay.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Success Modal Simulation */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'grid',
          placeItems: 'center',
          padding: 20,
          zIndex: 9999,
        }}>
          <div style={{
            background: 'var(--bg2)',
            border: '2px solid var(--accent)',
            borderRadius: 24,
            padding: '36px 30px',
            maxWidth: 440,
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0, 180, 200, 0.25)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 14 }}>🎉</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: 8 }}>SafeScan PRO Activated!</h3>
            <p style={{ color: 'var(--muted)', fontSize: '.88rem', lineHeight: 1.6, marginBottom: 24 }}>
              Your account has been upgraded to <strong>SafeScan PRO</strong>. Live SMS alerts and Family Vault are now enabled on all your emergency QR codes!
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="btn-red"
              style={{ width: '100%', background: 'var(--accent)', color: '#000', fontWeight: 900, justifyContent: 'center' }}
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  )
}
