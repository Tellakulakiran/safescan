'use client'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem('install-dismissed')) return

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show banner after a 3-second delay so it doesn't feel intrusive
      setTimeout(() => setShow(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  function handleDismiss() {
    setShow(false)
    setDismissed(true)
    sessionStorage.setItem('install-dismissed', '1')
  }

  if (dismissed || !deferredPrompt) return null

  return (
    <div className={`install-banner${show ? ' show' : ''}`}>
      <div className="ib-icon">🛡</div>
      <div className="ib-text">
        <h4>Install SafeScan</h4>
        <p>Add to home screen for instant access</p>
      </div>
      <button className="ib-btn" onClick={handleInstall}>Install</button>
      <button className="ib-close" onClick={handleDismiss}>✕</button>
    </div>
  )
}
