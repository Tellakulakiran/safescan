'use client'
import React, { useEffect, useState } from 'react'

interface NearbyModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Place {
  id: string | number
  name: string
  lat: number
  lon: number
  distance: number
  phone?: string | null
  address?: string
}

type Category = 'hospital' | 'pharmacy' | 'police'

function formatDist(m: number): string {
  if (m === 0) return 'Immediate Dispatch'
  return m < 1000 ? `${Math.round(m)}m away` : `${(m / 1000).toFixed(1)} km away`
}

export default function NearbyModal({ isOpen, onClose }: NearbyModalProps) {
  const [category, setCategory] = useState<Category>('hospital')
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    if (!isOpen) return

    // Fetch user location
    if (!userCoords) {
      if (navigator.geolocation) {
        setLoading(true)
        navigator.geolocation.getCurrentPosition(
          pos => {
            const c = { lat: pos.coords.latitude, lon: pos.coords.longitude }
            setUserCoords(c)
            fetchPlaces(c.lat, c.lon, category)
          },
          err => {
            console.warn('Geolocation error:', err)
            // Fallback: Default to emergency dispatch numbers
            setError('Please enable GPS location to see nearby hospitals.')
            setLoading(false)
          },
          { enableHighAccuracy: true, timeout: 10000 }
        )
      } else {
        setError('Geolocation is not supported by your browser.')
      }
    } else {
      fetchPlaces(userCoords.lat, userCoords.lon, category)
    }
  }, [isOpen, category])

  async function fetchPlaces(lat: number, lon: number, cat: Category) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/nearby?lat=${lat}&lon=${lon}&amenity=${cat}`)
      if (!res.ok) throw new Error('Failed to load places')
      const data = await res.json()
      setPlaces(data.elements || [])
    } catch (err: any) {
      console.error(err)
      setError('Could not fetch real-time places. Quick emergency dialers are available below.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="scanner-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="nearby-modal-sheet">
        {/* Header */}
        <div className="scanner-header">
          <div className="scanner-title">
            <span className="scanner-icon">🏥</span>
            <h3>Nearby Emergency Care</h3>
          </div>
          <button type="button" className="scanner-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Quick Emergency Dispatch Bar */}
        <div className="nearby-sos-bar">
          <a href="tel:108" className="nearby-sos-pill ambulance">
            <span>🚑 Call 108 Ambulance</span>
          </a>
          <a href="tel:112" className="nearby-sos-pill emergency">
            <span>🚨 Call 112 SOS</span>
          </a>
        </div>

        {/* Category Tabs */}
        <div className="nearby-tabs">
          <button 
            type="button" 
            className={`nearby-tab-btn ${category === 'hospital' ? 'active' : ''}`}
            onClick={() => setCategory('hospital')}
          >
            🏥 Hospitals (24/7)
          </button>
          <button 
            type="button" 
            className={`nearby-tab-btn ${category === 'pharmacy' ? 'active' : ''}`}
            onClick={() => setCategory('pharmacy')}
          >
            💊 Medical Stores
          </button>
          <button 
            type="button" 
            className={`nearby-tab-btn ${category === 'police' ? 'active' : ''}`}
            onClick={() => setCategory('police')}
          >
            🚓 Police
          </button>
        </div>

        {/* Place List */}
        <div className="nearby-list-container">
          {loading ? (
            <div className="nearby-loading">
              <div className="nearby-spinner" />
              <p>Locating verified emergency facilities near you...</p>
            </div>
          ) : error ? (
            <div className="nearby-error">
              <p>{error}</p>
              <div style={{ marginTop: 12 }}>
                <a href="tel:108" className="btn-red" style={{ display: 'inline-block', padding: '10px 20px', fontSize: '.9rem' }}>
                  📞 Call 108 (24/7 Free Ambulance)
                </a>
              </div>
            </div>
          ) : places.length === 0 ? (
            <div className="nearby-empty">
              <p>No facilities found within immediate GPS range.</p>
              <a href="tel:108" className="btn-red" style={{ marginTop: 10, display: 'inline-block' }}>
                Call 108 Emergency Dispatch
              </a>
            </div>
          ) : (
            <div className="nearby-cards-stack">
              {places.map((place, idx) => (
                <div key={place.id || idx} className="nearby-place-card">
                  <div className="place-info">
                    <h4 className="place-name">{place.name}</h4>
                    <div className="place-meta">
                      <span className="place-dist">📍 {formatDist(place.distance)}</span>
                      {place.address && <span className="place-addr">{place.address}</span>}
                    </div>
                  </div>
                  <div className="place-actions">
                    {place.phone && (
                      <a href={`tel:${place.phone.replace(/[^0-9+]/g, '')}`} className="place-call-btn">
                        📞 Call
                      </a>
                    )}
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="place-dir-btn"
                    >
                      🧭 Map
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
