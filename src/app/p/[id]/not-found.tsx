import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <nav className="top-nav">
        <Link href="/" className="nav-logo"><div className="logo-icon">🛡</div>SafeScan</Link>
      </nav>
      <div style={{paddingTop:62,minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'62px 20px'}}>
        <div>
          <div style={{fontSize:'3rem',marginBottom:16}}>🔍</div>
          <h1 style={{fontSize:'1.4rem',fontWeight:900,marginBottom:10}}>Profile Not Found</h1>
          <p style={{color:'var(--muted)',marginBottom:28,maxWidth:320,margin:'0 auto 28px'}}>
            This QR profile doesn't exist or has been deactivated.
          </p>
          <Link href="/create" className="btn-red">Create Your Own Profile</Link>
        </div>
      </div>
    </>
  )
}
