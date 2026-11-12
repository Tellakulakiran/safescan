import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface ElementItem {
  id: number | string
  lat: number
  lon: number
  distance: number
  name: string
  phone: string | null
  address?: string
  tags: {
    name: string
    phone?: string | null
    'contact:phone'?: string | null
    [key: string]: any
  }
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Built-in verified 24/7 emergency dispatch centers if no physical building is tagged nearby
function getEmergencyFallback(amenity: string, lat: number, lon: number): ElementItem[] {
  if (amenity === 'hospital') {
    return [
      {
        id: 'dispatch-108',
        lat,
        lon,
        distance: 0,
        name: '108 Emergency Ambulance & Trauma Dispatch',
        phone: '108',
        address: 'All-India 24/7 Emergency Dispatch',
        tags: {
          name: '108 Emergency Ambulance & Trauma Dispatch',
          phone: '108',
        },
      },
      {
        id: 'dispatch-112',
        lat,
        lon,
        distance: 0,
        name: '112 National Unified Emergency Service',
        phone: '112',
        address: 'National Emergency Response System',
        tags: {
          name: '112 National Unified Emergency Service',
          phone: '112',
        },
      },
      {
        id: 'dispatch-102',
        lat,
        lon,
        distance: 0,
        name: '102 Maternity & Infant Emergency Ambulance',
        phone: '102',
        address: 'Government Free Emergency Ambulance',
        tags: {
          name: '102 Maternity & Infant Emergency Ambulance',
          phone: '102',
        },
      },
    ]
  }

  if (amenity === 'pharmacy') {
    return [
      {
        id: 'dispatch-med-108',
        lat,
        lon,
        distance: 0,
        name: '24/7 Emergency Medical & Pharmacy Helpline',
        phone: '108',
        address: 'State Emergency Medical Guidance',
        tags: {
          name: '24/7 Emergency Medical & Pharmacy Helpline',
          phone: '108',
        },
      },
      {
        id: 'dispatch-apollo',
        lat,
        lon,
        distance: 0,
        name: 'Apollo 24/7 Emergency Pharmacy Hotline',
        phone: '1860-500-0101',
        address: 'Nationwide 24/7 Emergency Medicines',
        tags: {
          name: 'Apollo 24/7 Emergency Pharmacy Hotline',
          phone: '1860-500-0101',
        },
      },
      {
        id: 'dispatch-medplus',
        lat,
        lon,
        distance: 0,
        name: 'MedPlus 24/7 Emergency Pharmacy Care',
        phone: '040-67006700',
        address: '24/7 Critical Prescription Dispatch',
        tags: {
          name: 'MedPlus 24/7 Emergency Pharmacy Care',
          phone: '040-67006700',
        },
      },
    ]
  }

  // Police
  return [
    {
      id: 'dispatch-pol-100',
      lat,
      lon,
      distance: 0,
      name: 'Police Emergency Response Centre',
      phone: '100',
      address: 'Direct Emergency Police Control Room',
      tags: {
        name: 'Police Emergency Response Centre',
        phone: '100',
      },
    },
    {
      id: 'dispatch-pol-112',
      lat,
      lon,
      distance: 0,
      name: '112 National Emergency Police Helpline',
      phone: '112',
      address: 'Pan-India Single Emergency Police Support',
      tags: {
        name: '112 National Emergency Police Helpline',
        phone: '112',
      },
    },
    {
      id: 'dispatch-pol-1033',
      lat,
      lon,
      distance: 0,
      name: 'National Highway Patrol & Emergency (NHAI)',
      phone: '1033',
      address: 'Highway Accident & Patrol Assistance',
      tags: {
        name: 'National Highway Patrol & Emergency (NHAI)',
        phone: '1033',
      },
    },
  ]
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const latStr = searchParams.get('lat')
  const lonStr = searchParams.get('lon')
  const amenity = searchParams.get('amenity') || 'hospital'

  if (!latStr || !lonStr) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 })
  }

  const lat = parseFloat(latStr)
  const lon = parseFloat(lonStr)

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: 'invalid coordinates' }, { status: 400 })
  }

  // 1. Calculate geographic bounding box strictly centered on the user's GPS (~10km box)
  // 1 deg lat ≈ 111.32 km -> 10km ≈ 0.09 degrees
  const dLat = 0.09
  const cosLat = Math.cos((lat * Math.PI) / 180)
  const dLon = 0.09 / Math.max(Math.abs(cosLat), 0.1)

  const left = (lon - dLon).toFixed(6)
  const top = (lat + dLat).toFixed(6)
  const right = (lon + dLon).toFixed(6)
  const bottom = (lat - dLat).toFixed(6)

  let elements: ElementItem[] = []
  const seenIds = new Set<string | number>()

  // 2. Fetch directly from OpenStreetMap Nominatim with strict bounded box
  // Notice: 'bounded=1' GUARANTEES results are ONLY inside the user's 10km area, NEVER worldwide!
  try {
    const urls: string[] = []

    if (amenity === 'hospital') {
      urls.push(
        `https://nominatim.openstreetmap.org/search?format=json&amenity=hospital&viewbox=${left},${top},${right},${bottom}&bounded=1&limit=12&extratags=1`,
        `https://nominatim.openstreetmap.org/search?format=json&amenity=clinic&viewbox=${left},${top},${right},${bottom}&bounded=1&limit=8&extratags=1`
      )
    } else if (amenity === 'pharmacy') {
      urls.push(
        `https://nominatim.openstreetmap.org/search?format=json&amenity=pharmacy&viewbox=${left},${top},${right},${bottom}&bounded=1&limit=12&extratags=1`,
        `https://nominatim.openstreetmap.org/search?format=json&q=pharmacy&viewbox=${left},${top},${right},${bottom}&bounded=1&limit=8&extratags=1`
      )
    } else {
      urls.push(
        `https://nominatim.openstreetmap.org/search?format=json&amenity=police&viewbox=${left},${top},${right},${bottom}&bounded=1&limit=12&extratags=1`
      )
    }

    const responses = await Promise.allSettled(
      urls.map(async (url) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 4500)
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'SafeScanEmergencyApp/3.0 (tellakulakiran@gmail.com)',
            'Accept': 'application/json',
          },
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return (await res.json()) as any[]
      })
    )

    for (const r of responses) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        for (const item of r.value) {
          const itemLat = parseFloat(item.lat)
          const itemLon = parseFloat(item.lon)
          if (isNaN(itemLat) || isNaN(itemLon)) continue

          const dist = haversineDistance(lat, lon, itemLat, itemLon)
          // STRICT FILTER: Discard any result further than 20km
          if (dist > 20000) continue

          const id = item.place_id || `${itemLat}_${itemLon}`
          if (seenIds.has(id)) continue
          seenIds.add(id)

          const cleanName =
            item.name ||
            item.display_name?.split(',')[0] ||
            (amenity === 'hospital'
              ? 'Emergency Hospital / Clinic'
              : amenity === 'pharmacy'
              ? 'Medical Store / Pharmacy'
              : 'Police Station')

          const phone =
            item.extratags?.phone ||
            item.extratags?.['contact:phone'] ||
            item.extratags?.['contact:mobile'] ||
            (amenity === 'hospital' ? '108' : amenity === 'police' ? '100' : null)

          elements.push({
            id,
            lat: itemLat,
            lon: itemLon,
            distance: Math.round(dist),
            name: cleanName,
            phone,
            address: item.display_name?.split(',').slice(1, 4).join(',').trim() || undefined,
            tags: {
              name: cleanName,
              phone,
            },
          })
        }
      }
    }
  } catch (err) {
    console.error('Nominatim query error:', err)
  }

  // 3. Fallback to Overpass API if Nominatim returned 0 items
  if (elements.length === 0) {
    try {
      const radius = 10000 // 10km
      let amenityQuery = `node["amenity"="${amenity}"](around:${radius},${lat},${lon});way["amenity"="${amenity}"](around:${radius},${lat},${lon});`
      if (amenity === 'hospital') {
        amenityQuery = `node["amenity"~"hospital|clinic"](around:${radius},${lat},${lon});way["amenity"~"hospital|clinic"](around:${radius},${lat},${lon});`
      }

      const overpassQuery = `[out:json][timeout:4];(${amenityQuery});out center 15;`
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3500)
      const opRes = await fetch(overpassUrl, {
        headers: { 'User-Agent': 'SafeScanEmergencyApp/3.0 (tellakulakiran@gmail.com)' },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (opRes.ok) {
        const opData = await opRes.json()
        if (Array.isArray(opData.elements)) {
          for (const el of opData.elements) {
            const itemLat = el.lat ?? el.center?.lat
            const itemLon = el.lon ?? el.center?.lon
            if (itemLat === undefined || itemLon === undefined) continue

            const dist = haversineDistance(lat, lon, itemLat, itemLon)
            if (dist > 20000) continue // Strict filter

            const id = el.id
            if (seenIds.has(id)) continue
            seenIds.add(id)

            const cleanName =
              el.tags?.name ||
              el.tags?.['name:en'] ||
              (amenity === 'hospital' ? 'Emergency Hospital' : amenity === 'pharmacy' ? 'Pharmacy' : 'Police Station')

            const phone =
              el.tags?.phone ||
              el.tags?.['contact:phone'] ||
              (amenity === 'hospital' ? '108' : amenity === 'police' ? '100' : null)

            elements.push({
              id,
              lat: itemLat,
              lon: itemLon,
              distance: Math.round(dist),
              name: cleanName,
              phone,
              tags: {
                name: cleanName,
                phone,
              },
            })
          }
        }
      }
    } catch {
      // Overpass failed or timed out
    }
  }

  // 4. Strict distance sort: Always show the nearest location first!
  elements.sort((a, b) => a.distance - b.distance)

  // 5. If still empty (e.g. remote area or all APIs offline), provide verified 24/7 dispatch hotlines
  if (elements.length === 0) {
    elements = getEmergencyFallback(amenity, lat, lon)
  }

  // Return up to 8 closest places
  return NextResponse.json({ elements: elements.slice(0, 8) })
}
