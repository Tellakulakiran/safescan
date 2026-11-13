import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — SafeScan',
  description: 'Privacy Policy for SafeScan Emergency Medical Profile App.',
}

export default function PrivacyPage() {
  return (
    <>
      <nav className="top-nav">
        <Link href="/" className="nav-logo">
          <div className="logo-icon">🛡</div>SafeScan
        </Link>
        <ul className="nav-links">
          <li><Link href="/" className="nav-cta">Home</Link></li>
        </ul>
      </nav>

      <div style={{ paddingTop: 80, paddingBottom: 60, minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ marginBottom: 30 }}>
            <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Legal & Compliance
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: 8, marginBottom: 8, color: '#fff' }}>
              Privacy Policy
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 18, padding: '30px 28px', color: 'rgba(255,255,255,.85)', lineHeight: 1.8, fontSize: '.95rem' }}>
            
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>1. Overview</h2>
              <p>
                SafeScan (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) provides an emergency medical identification service designed to deliver vital health details to first responders, emergency medical personnel, and bystanders when you need assistance. Your privacy and trust are our top priorities.
              </p>
            </section>

            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>2. Information We Collect</h2>
              <p>When you create an emergency profile on SafeScan, you voluntarily provide:</p>
              <ul style={{ paddingLeft: 22, marginTop: 8 }}>
                <li><strong>Identification Details:</strong> Full Name, Date of Birth / Age, and Organ Donor preference.</li>
                <li><strong>Medical Information:</strong> Blood group, allergies, current medications, existing medical conditions, and instructions for paramedics.</li>
                <li><strong>Emergency Contacts:</strong> Names, phone numbers, and relationships of individuals to be contacted in an emergency.</li>
              </ul>
            </section>

            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>3. How Information is Used & Shared</h2>
              <p>
                The primary purpose of SafeScan is emergency medical accessibility. The information you provide is linked to a unique QR code and web address (<code>/p/[id]</code>).
              </p>
              <p style={{ marginTop: 8 }}>
                Anyone who scans your SafeScan QR code or accesses your designated link can view this emergency medical information to assist you in an emergency. We do not sell, rent, or monetize your personal health data to third-party advertisers.
              </p>
            </section>

            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>4. Device Permissions & Location</h2>
              <p>
                The SafeScan application may request approximate location access solely to locate nearby hospitals, medical clinics, and police stations when the user requests emergency services nearby. Your location is processed in real time and is never stored on our servers or tracked.
              </p>
            </section>

            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>5. Data Security & Storage</h2>
              <p>
                All communications between your device and SafeScan are encrypted using industry-standard Transport Layer Security (HTTPS / TLS). Emergency profiles are securely hosted on cloud infrastructure.
              </p>
            </section>

            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>6. Data Deletion & Retention</h2>
              <p>
                You have full control over your emergency profile data. If you wish to delete your emergency medical profile or request removal of your data at any time, please email us directly with your profile name or link at:
              </p>
              <p style={{ marginTop: 8, fontWeight: 700, color: 'var(--accent)' }}>
                tellakulakiran@gmail.com
              </p>
              <p style={{ marginTop: 8, fontSize: '.88rem', color: 'var(--muted)' }}>
                Upon receipt of your request, your profile record and associated QR data will be permanently deleted from our servers within 48 hours.
              </p>
            </section>

            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>7. Contact & Developer Details</h2>
              <p>
                Developer: Tellakula Durga Sai Kiran (SafeScan)<br />
                Email: tellakulakiran@gmail.com
              </p>
            </section>

          </div>

          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <Link href="/" style={{ color: 'var(--muted)', fontSize: '.85rem', textDecoration: 'none' }}>
              ← Return to SafeScan Home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
