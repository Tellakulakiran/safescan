'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface QRScannerModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasCamera, setHasCamera] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isOpen) {
      stopCamera()
      return
    }

    startCamera()

    return () => {
      stopCamera()
    }
  }, [isOpen])

  function stopCamera() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setScanning(false)
  }

  async function startCamera() {
    setErrorMsg(null)
    setScanning(true)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false)
        setErrorMsg('Camera access is not supported on this device.')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true')
        await videoRef.current.play()
        scanLoop()
      }
    } catch (err: any) {
      console.error('Camera error:', err)
      setHasCamera(false)
      setErrorMsg('Could not open camera. Please grant camera permission or upload a QR image.')
    }
  }

  function handleQRFound(rawText: string) {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
    stopCamera()

    // Parse the scanned code
    // Check if it's a URL like https://.../p/UUID
    const match = rawText.match(/\/p\/([a-zA-Z0-9_-]+)/)
    if (match && match[1]) {
      let search = ''
      try {
        const u = new URL(rawText, window.location.origin)
        search = u.search
      } catch {}
      router.push(`/p/${match[1]}${search}`)
      onClose()
      return
    }

    // Check if it's a raw UUID
    const uuidMatch = rawText.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)
    if (uuidMatch) {
      router.push(`/p/${uuidMatch[0]}`)
      onClose()
      return
    }

    // If it's another URL
    if (rawText.startsWith('http://') || rawText.startsWith('https://')) {
      window.location.href = rawText
      onClose()
      return
    }

    alert(`Scanned Emergency Info:\n\n${rawText}`)
    onClose()
  }

  async function scanLoop() {
    if (!videoRef.current || !streamRef.current) return

    // Try modern BarcodeDetector API (native in Android Chrome / PWA)
    if ('BarcodeDetector' in window) {
      try {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
        const detect = async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) {
            rafRef.current = requestAnimationFrame(detect)
            return
          }

          try {
            const barcodes = await detector.detect(videoRef.current)
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              handleQRFound(barcodes[0].rawValue)
              return
            }
          } catch {}

          rafRef.current = requestAnimationFrame(detect)
        }
        rafRef.current = requestAnimationFrame(detect)
        return
      } catch {}
    }

    // Fallback: poll every frame or let user upload image
    const fallbackPoll = () => {
      rafRef.current = requestAnimationFrame(fallbackPoll)
    }
    rafRef.current = requestAnimationFrame(fallbackPoll)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const img = new Image()
    img.onload = async () => {
      if ('BarcodeDetector' in window) {
        try {
          const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
          const barcodes = await detector.detect(img)
          if (barcodes.length > 0 && barcodes[0].rawValue) {
            handleQRFound(barcodes[0].rawValue)
            return
          }
        } catch {}
      }
      alert('Could not detect a valid QR code in this image. Please ensure the QR is clear and well-lit.')
    }
    img.src = URL.createObjectURL(file)
  }

  if (!isOpen) return null

  return (
    <div className="scanner-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="scanner-modal-sheet">
        {/* Top Header */}
        <div className="scanner-header">
          <div className="scanner-title">
            <span className="scanner-icon">📷</span>
            <h3>Scan Emergency QR</h3>
          </div>
          <button type="button" className="scanner-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Viewfinder Box */}
        <div className="scanner-viewfinder-wrapper">
          {hasCamera ? (
            <>
              <video ref={videoRef} className="scanner-video" autoPlay playsInline muted />
              <div className="scanner-reticle">
                <div className="reticle-corner tl" />
                <div className="reticle-corner tr" />
                <div className="reticle-corner bl" />
                <div className="reticle-corner br" />
                <div className="scanner-laser" />
              </div>
            </>
          ) : (
            <div className="scanner-fallback">
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📷</div>
              <p style={{ color: 'var(--muted)', fontSize: '.9rem', padding: '0 20px' }}>
                {errorMsg || 'Camera unavailable'}
              </p>
            </div>
          )}
        </div>

        <p className="scanner-hint">
          Point camera at the SafeScan QR code on the victim&apos;s phone or card
        </p>

        {/* Footer actions */}
        <div className="scanner-footer">
          <label className="scanner-upload-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Scan from Gallery Photo</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
    </div>
  )
}
