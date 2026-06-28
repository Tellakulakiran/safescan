import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const amenity = searchParams.get('amenity')

    if (!lat || !lon || !amenity) {
      return NextResponse.json({ error: 'lat, lon, and amenity are required' }, { status: 400 })
    }

    const radius = 5000
    // Query nodes, ways, and relations around the coordinate
    const query = `[out:json][timeout:12];(node["amenity"="${amenity}"](around:${radius},${lat},${lon});way["amenity"="${amenity}"](around:${radius},${lat},${lon});relation["amenity"="${amenity}"](around:${radius},${lat},${lon}););out center 10;`
    
    // Multiple public Overpass API servers for failover
    const endpoints = [
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      `https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`,
      `https://overpass.osm.ch/api/interpreter?data=${encodeURIComponent(query)}`
    ]

    let data = null
    let lastError = null

    // Attempt queries sequentially with automatic failover
    for (const url of endpoints) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8-second timeout per server

        const res = await fetch(url, {
          headers: {
            'User-Agent': 'SafeScanEmergencyApp/1.0 (https://github.com/Tellakulakiran/safescan; tellakulakiran@gmail.com)',
            'Accept': 'application/json'
          },
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (res.ok) {
          data = await res.json()
          break
        } else {
          lastError = `Server responded with status ${res.status}`
        }
      } catch (err: any) {
        lastError = err.name === 'AbortError' ? 'Timeout' : err.message
      }
    }

    if (data) {
      return NextResponse.json(data)
    }

    console.error('All Overpass servers failed. Last error:', lastError)
    return NextResponse.json({ error: `Failed to load services: ${lastError}` }, { status: 500 })
  } catch (error: any) {
    console.error('Server error handling nearby request:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
