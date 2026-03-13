import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Maximize2, Minimize2, Satellite, Map } from 'lucide-react'
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
  waypointCoords?: [number, number][]
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

// Component to fit map bounds to all route points
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length < 2) return
    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 8 })
  }, [map, points])

  return null
}

const TILE_OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_SAT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

// Waypoint icon (orange dot)
const waypointIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background-color: #f97316; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

export function RouteMap({ fromAerodrome, toAerodrome, waypointCoords = [], distance }: RouteMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSatellite, setIsSatellite] = useState(false)

  // Escape key closes fullscreen
  useEffect(() => {
    if (!isFullscreen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFullscreen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isFullscreen])

  // Lock body scroll + hide header when fullscreen
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? 'hidden' : ''
    document.body.classList.toggle('map-fullscreen', isFullscreen)
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('map-fullscreen')
    }
  }, [isFullscreen])

  // Parse coordinates
  const fromCoords = useMemo((): [number, number] | null => {
    if (!fromAerodrome) return null
    return [parseCoord(fromAerodrome.latitude), parseCoord(fromAerodrome.longitude)]
  }, [fromAerodrome])

  const toCoords = useMemo((): [number, number] | null => {
    if (!toAerodrome) return null
    return [parseCoord(toAerodrome.latitude), parseCoord(toAerodrome.longitude)]
  }, [toAerodrome])

  // All route points for polyline and bounds
  const allPoints = useMemo((): [number, number][] => [
    ...(fromCoords ? [fromCoords] : []),
    ...waypointCoords,
    ...(toCoords ? [toCoords] : []),
  ], [fromCoords, waypointCoords, toCoords])

  // Default center (Southern Africa)
  const defaultCenter: [number, number] = [-22, 20]

  // Center on all points
  const center = useMemo((): [number, number] => {
    if (allPoints.length > 0) {
      const lat = allPoints.reduce((s, p) => s + p[0], 0) / allPoints.length
      const lng = allPoints.reduce((s, p) => s + p[1], 0) / allPoints.length
      return [lat, lng]
    }
    return defaultCenter
  }, [allPoints])

  // Show placeholder if no selection
  if (allPoints.length === 0) {
    return (
      <div className="h-48 bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
        Select departure and destination to view route
      </div>
    )
  }

  // Button style shared
  const btnClass = 'z-[1000] p-1.5 rounded bg-background/90 border border-border/50 text-muted-foreground hover:text-foreground transition-colors'

  const mapContent = (
    <MapContainer
      key={`${isFullscreen ? 'fullscreen' : 'inline'}-${isSatellite ? 'sat' : 'osm'}`}
      center={center}
      zoom={5}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer url={isSatellite ? TILE_SAT : TILE_OSM} crossOrigin="anonymous" />

      {fromCoords && <Marker position={fromCoords} icon={departureIcon} />}
      {waypointCoords.map((pos, i) => (
        <Marker key={i} position={pos} icon={waypointIcon} />
      ))}
      {toCoords && <Marker position={toCoords} icon={arrivalIcon} />}

      {allPoints.length >= 2 && (
        <>
          <Polyline
            positions={allPoints}
            pathOptions={{ color: '#f97316', weight: 3, opacity: 0.8, dashArray: '10, 10' }}
          />
          <FitBounds points={allPoints} />
        </>
      )}
    </MapContainer>
  )

  const toggleBtn = (
    <button
      type="button"
      onClick={() => setIsFullscreen(v => !v)}
      className={`absolute top-2 right-2 ${btnClass}`}
      title={isFullscreen ? 'Réduire' : 'Agrandir'}
    >
      {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
    </button>
  )

  const satelliteBtn = (
    <button
      type="button"
      onClick={() => setIsSatellite(v => !v)}
      className={`absolute bottom-2 left-2 ${btnClass}`}
      title={isSatellite ? 'Vue carte' : 'Vue satellite'}
    >
      {isSatellite ? <Map className="h-3.5 w-3.5" /> : <Satellite className="h-3.5 w-3.5" />}
    </button>
  )

  const distanceOverlay = distance && distance > 0 && (
    <div className="absolute bottom-2 right-2 z-[1000] bg-background/90 px-2 py-1 rounded text-xs font-mono border border-border/50">
      {distance} NM
    </div>
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-40 bg-background">
        {mapContent}
        {toggleBtn}
        {satelliteBtn}
        {distanceOverlay}
      </div>
    )
  }

  return (
    <div className="relative h-48 rounded-lg overflow-hidden border border-border/50">
      {mapContent}
      {toggleBtn}
      {satelliteBtn}
      {distanceOverlay}
    </div>
  )
}
