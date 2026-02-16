import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { type Aerodrome } from '@/data/aerodromes'

// Fix for default marker icons in Leaflet with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Custom icons for departure and arrival
const departureIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background-color: #22c55e; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

const arrivalIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
      <path d="M12 5v14M5 12l7 7 7-7"/>
    </svg>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

interface RouteMapProps {
  fromAerodrome?: Aerodrome
  toAerodrome?: Aerodrome
  distance?: number
}

// Parse coordinate string to decimal degrees
function parseCoord(coord: string): number {
  const parts = coord.match(/([NSEW])(\d+)\s+(\d+)\s+([\d.]+)/)
  if (!parts) return 0
  const dir = parts[1]
  const deg = parseInt(parts[2])
  const min = parseInt(parts[3])
  const sec = parseFloat(parts[4])
  let decimal = deg + min / 60 + sec / 3600
  if (dir === 'S' || dir === 'W') decimal = -decimal
  return decimal
}

// Component to fit map bounds to route
function FitBounds({ from, to }: { from: [number, number]; to: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    const bounds = L.latLngBounds([from, to])
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 8 })
  }, [map, from, to])

  return null
}

export function RouteMap({ fromAerodrome, toAerodrome, distance }: RouteMapProps) {
  // Parse coordinates
  const fromCoords = useMemo((): [number, number] | null => {
    if (!fromAerodrome) return null
    return [parseCoord(fromAerodrome.latitude), parseCoord(fromAerodrome.longitude)]
  }, [fromAerodrome])

  const toCoords = useMemo((): [number, number] | null => {
    if (!toAerodrome) return null
    return [parseCoord(toAerodrome.latitude), parseCoord(toAerodrome.longitude)]
  }, [toAerodrome])

  // Default center (Southern Africa)
  const defaultCenter: [number, number] = [-22, 20]

  // Calculate center between two points
  const center = useMemo((): [number, number] => {
    if (fromCoords && toCoords) {
      return [(fromCoords[0] + toCoords[0]) / 2, (fromCoords[1] + toCoords[1]) / 2]
    }
    if (fromCoords) return fromCoords
    if (toCoords) return toCoords
    return defaultCenter
  }, [fromCoords, toCoords])

  // Show placeholder if no selection
  if (!fromCoords && !toCoords) {
    return (
      <div className="h-48 bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
        Select departure and destination to view route
      </div>
    )
  }

  return (
    <div className="h-48 rounded-lg overflow-hidden border border-border/50">
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Departure marker */}
        {fromCoords && (
          <Marker position={fromCoords} icon={departureIcon} />
        )}

        {/* Arrival marker */}
        {toCoords && (
          <Marker position={toCoords} icon={arrivalIcon} />
        )}

        {/* Route line */}
        {fromCoords && toCoords && (
          <>
            <Polyline
              positions={[fromCoords, toCoords]}
              pathOptions={{
                color: '#f97316',
                weight: 3,
                opacity: 0.8,
                dashArray: '10, 10',
              }}
            />
            <FitBounds from={fromCoords} to={toCoords} />
          </>
        )}
      </MapContainer>

      {/* Distance overlay */}
      {distance && distance > 0 && (
        <div className="relative">
          <div className="absolute bottom-2 right-2 bg-background/90 px-2 py-1 rounded text-xs font-mono border border-border/50">
            {distance} NM
          </div>
        </div>
      )}
    </div>
  )
}
