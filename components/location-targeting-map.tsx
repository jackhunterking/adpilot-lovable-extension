"use client"

/**
 * Feature: Location Targeting Map
 * Purpose: Interactive map for visualizing location targeting with radius and area coverage
 * References:
 *  - Leaflet: https://leafletjs.com/reference.html
 *  - OpenStreetMap: https://www.openstreetmap.org/
 */

import { useRef, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useLeafletReady } from '@/lib/hooks/use-leaflet-ready'
import type { LocationTargeting } from '@/lib/context/location-targeting-context'

interface LocationTargetingMapProps {
  locations: LocationTargeting[]
  highlightLocationId?: string // For animation when location is added
}

interface LeafletMap {
  remove(): void
  setView(center: [number, number], zoom: number): void
  fitBounds(bounds: [[number, number], [number, number]], options?: unknown): void
}

interface LeafletLayer {
  addTo(map: LeafletMap): LeafletLayer
  remove(): void
  bindPopup?(content: string): LeafletLayer
  openPopup?(): void
}

let mapInstanceCounter = 0

export function LocationTargetingMap({ locations, highlightLocationId }: LocationTargetingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const layersRef = useRef<LeafletLayer[]>([])
  const mapIdRef = useRef(`location-targeting-map-${++mapInstanceCounter}`)
  
  const { isReady, getLeaflet } = useLeafletReady()
  const [error, setError] = useState<string | null>(null)

  // Initialize map
  useEffect(() => {
    if (!isReady || !mapContainerRef.current || mapRef.current) return

    try {
      const L = getLeaflet()
      if (!L) {
        setError('Leaflet failed to load')
        return
      }

      const map = L.map(mapIdRef.current).setView([39.8283, -98.5795], 4) // Center of US

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map as unknown as LeafletMap
      console.log('[LocationTargetingMap] ✅ Map initialized')
    } catch (err) {
      console.error('[LocationTargetingMap] Initialization error:', err)
      setError('Failed to initialize map')
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [isReady, getLeaflet])

  // Update markers and coverage areas
  useEffect(() => {
    const map = mapRef.current
    const L = getLeaflet()
    
    if (!map || !L || !isReady) return

    // Clear existing layers
    layersRef.current.forEach(layer => layer.remove())
    layersRef.current = []

    if (locations.length === 0) {
      // Reset to default view
      map.setView([39.8283, -98.5795], 4)
      return
    }

    // Add markers and coverage areas for each location
    locations.forEach(loc => {
      const lat = loc.coordinates[1]
      const lng = loc.coordinates[0]
      
      // Determine color based on mode
      const color = loc.mode === 'include' ? '#10b981' : '#ef4444' // green or red
      const iconColor = loc.mode === 'include' ? 'green' : 'red'

      // Create custom icon
      const iconHtml = `
        <div style="
          width: 30px;
          height: 30px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
          ${loc.id === highlightLocationId ? 'animation: pulse 1s ease-in-out;' : ''}
        ">
          ${loc.mode === 'include' ? '✓' : '✗'}
        </div>
      `

      const icon = L.divIcon({
        html: iconHtml,
        className: 'custom-location-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })

      // Add marker
      const marker = L.marker([lat, lng], { icon }).addTo(map) as LeafletLayer
      
      // Add popup
      const popupContent = `
        <div style="text-align: center;">
          <strong>${loc.name}</strong><br/>
          <span style="color: ${color};">${loc.mode === 'include' ? '✓ Included' : '✗ Excluded'}</span><br/>
          <span style="font-size: 12px; color: #666;">${getCoverageLabel(loc)}</span>
        </div>
      `
      if (marker.bindPopup) {
        marker.bindPopup(popupContent)
      }

      // Open popup if this is the highlighted location
      if (loc.id === highlightLocationId && marker.openPopup) {
        marker.openPopup()
      }

      layersRef.current.push(marker)

      // Add coverage visualization
      if (loc.coverage === 'radius' && loc.radius) {
        // Radius circle
        const radiusInMeters = loc.radius * 1609.34 // miles to meters
        const circle = L.circle([lat, lng], {
          radius: radiusInMeters,
          fillColor: color,
          fillOpacity: 0.15,
          color: color,
          weight: 2,
          opacity: 0.6,
        }).addTo(map) as LeafletLayer
        layersRef.current.push(circle)
      } else if (loc.coverage === 'full' && loc.bbox) {
        // Bounding box for full area
        const bounds: [[number, number], [number, number]] = [
          [loc.bbox[1], loc.bbox[0]], // [lat, lng]
          [loc.bbox[3], loc.bbox[2]]
        ]
        const rectangle = (L as any).rectangle(bounds, {
          fillColor: color,
          fillOpacity: 0.15,
          color: color,
          weight: 2,
          opacity: 0.6,
        }).addTo(map) as LeafletLayer
        
        if (rectangle.bindPopup) {
          rectangle.bindPopup(popupContent)
        }
        
        layersRef.current.push(rectangle)
      }
    })

    // Fit bounds to show all locations
    if (locations.length > 0) {
      const bounds = locations.map(loc => {
        const lat = loc.coordinates[1]
        const lng = loc.coordinates[0]
        
        // If radius, expand bounds to include circle
        if (loc.coverage === 'radius' && loc.radius) {
          const radiusInDegrees = loc.radius / 69 // Approximate miles to degrees
          return [
            [lat - radiusInDegrees, lng - radiusInDegrees],
            [lat + radiusInDegrees, lng + radiusInDegrees]
          ]
        }
        
        // If bbox, use bbox
        if (loc.bbox) {
          return [
            [loc.bbox[1], loc.bbox[0]],
            [loc.bbox[3], loc.bbox[2]]
          ]
        }
        
        // Default: just the point
        return [[lat, lng], [lat, lng]]
      }).flat() as [number, number][]

      const latitudes = bounds.map(b => b[0])
      const longitudes = bounds.map(b => b[1])
      
      const mapBounds: [[number, number], [number, number]] = [
        [Math.min(...latitudes), Math.min(...longitudes)],
        [Math.max(...latitudes), Math.max(...longitudes)]
      ]
      
      map.fitBounds(mapBounds, { padding: [50, 50] })
    }
  }, [locations, highlightLocationId, isReady, getLeaflet])

  if (error) {
    return (
      <div className="w-full h-[400px] rounded-lg border border-border bg-muted flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-destructive font-medium">{error}</p>
          <p className="text-sm text-muted-foreground">Please refresh the page</p>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="w-full h-[400px] rounded-lg border border-border bg-muted flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading map...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <div 
        id={mapIdRef.current}
        ref={mapContainerRef}
        className="w-full h-[400px] rounded-lg border border-border overflow-hidden shadow-sm"
      />
      
      {/* Add pulse animation CSS */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

// Helper function
function getCoverageLabel(loc: LocationTargeting): string {
  if (loc.coverage === 'radius' && loc.radius) {
    return `${loc.radius} mile radius`
  }
  return `Full ${loc.type}`
}

