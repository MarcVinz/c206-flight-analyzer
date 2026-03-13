import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, Clock, Fuel as FuelIcon, Plus, Trash2, ChevronUp, ChevronDown, Thermometer, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FuelData } from '@/types/aircraft'
import { formatTime } from '@/lib/utils'
import { aerodromes, getAerodromeByIcao, type Aerodrome } from '@/data/aerodromes'
import { RouteMap } from '@/components/RouteMap'

// ── Types ────────────────────────────────────────────────────────────────────

interface WaypointItem {
  id: string
  label: string       // display name
  lat: number
  lng: number
  elevation: string   // ft — auto-filled for aerodromes, editable
  temp: string        // °C
  qnh: string         // hPa
}

interface SearchResult {
  label: string
  lat: number
  lng: number
  elevation?: number  // only for aerodromes
  isAerodrome: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Haversine using decimal degrees → NM
function haversineNM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3440.065
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function parseCoordString(coord: string): number {
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

function aerodromeCoords(a: Aerodrome): [number, number] {
  return [parseCoordString(a.latitude), parseCoordString(a.longitude)]
}

function isaTemp(elevFt: number): number {
  return 15 - (elevFt / 1000) * 1.98
}

function formatDeltaISA(delta: number): string {
  const r = Math.round(delta)
  return r >= 0 ? `ISA+${r}` : `ISA${r}`
}

let wpCounter = 0

// ── WaypointSearch component ─────────────────────────────────────────────────

function WaypointSearch({ onSelect }: { onSelect: (r: SearchResult) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) { setResults([]); setOpen(false); return }

    debounceRef.current = setTimeout(async () => {
      const q = query.toLowerCase()

      // Local aerodrome matches (by ICAO or name)
      const localMatches: SearchResult[] = aerodromes
        .filter(a => a.icao.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
        .slice(0, 5)
        .map(a => {
          const [lat, lng] = aerodromeCoords(a)
          return { label: `${a.icao} — ${a.name} (${a.elevation} ft)`, lat, lng, elevation: a.elevation, isAerodrome: true }
        })

      // Nominatim geocoding
      setLoading(true)
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=en`
        const res = await fetch(url)
        const data: { display_name: string; lat: string; lon: string }[] = await res.json()
        const geoMatches: SearchResult[] = data.map(d => ({
          label: d.display_name,
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon),
          isAerodrome: false,
        }))
        setResults([...localMatches, ...geoMatches])
      } catch {
        setResults(localMatches)
      } finally {
        setLoading(false)
        setOpen(true)
      }
    }, 350)
  }, [query])

  const handleSelect = (r: SearchResult) => {
    onSelect(r)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        {loading && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />}
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search aerodrome or location…"
          className="pl-8 pr-8 h-8 text-sm"
          onFocus={() => results.length > 0 && setOpen(true)}
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-[1300] w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors border-b border-border/30 last:border-0"
              onMouseDown={() => handleSelect(r)}
            >
              <span className={`mr-1.5 text-[10px] font-semibold uppercase ${r.isAerodrome ? 'text-primary' : 'text-muted-foreground'}`}>
                {r.isAerodrome ? 'ARPT' : 'LOC'}
              </span>
              <span className="line-clamp-2">{r.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Trip data exported for PDF ────────────────────────────────────────────────

export interface TripPointData {
  label: string
  elevation?: number
  temp: string
  qnh: string
}

export interface TripPlanningData {
  from?: TripPointData
  waypoints: (TripPointData & { lat: number; lng: number })[]
  to?: TripPointData
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface DestinationPanelProps {
  tripDistance: number
  setTripDistance: (distance: number) => void
  tripFuelBurn: number
  fuelData: FuelData
  fuelBurnRate: number
  routeFrom: string
  setRouteFrom: (icao: string) => void
  routeTo: string
  setRouteTo: (icao: string) => void
  onTripDataChange?: (data: TripPlanningData) => void
}

// ── Main component ────────────────────────────────────────────────────────────

export function DestinationPanel({
  tripDistance,
  setTripDistance,
  tripFuelBurn,
  fuelData,
  fuelBurnRate,
  routeFrom,
  setRouteFrom,
  routeTo,
  setRouteTo,
  onTripDataChange,
}: DestinationPanelProps) {
  const [manualDistance, setManualDistance] = useState<string>('')
  const [waypoints, setWaypoints] = useState<WaypointItem[]>([])
  const [fromTemp, setFromTemp] = useState('')
  const [fromQnh, setFromQnh] = useState('')
  const [toTemp, setToTemp] = useState('')
  const [toQnh, setToQnh] = useState('')

  const fromAerodrome = routeFrom ? getAerodromeByIcao(routeFrom) : undefined
  const toAerodrome = routeTo ? getAerodromeByIcao(routeTo) : undefined

  // Expose trip data for PDF
  useEffect(() => {
    if (!onTripDataChange) return
    onTripDataChange({
      from: fromAerodrome ? { label: `${fromAerodrome.icao} – ${fromAerodrome.name}`, elevation: fromAerodrome.elevation, temp: fromTemp, qnh: fromQnh } : undefined,
      waypoints: waypoints.map(wp => ({ label: wp.label, lat: wp.lat, lng: wp.lng, elevation: parseFloat(wp.elevation) || undefined, temp: wp.temp, qnh: wp.qnh })),
      to: toAerodrome ? { label: `${toAerodrome.icao} – ${toAerodrome.name}`, elevation: toAerodrome.elevation, temp: toTemp, qnh: toQnh } : undefined,
    })
  }, [fromAerodrome, fromTemp, fromQnh, toAerodrome, toTemp, toQnh, waypoints, onTripDataChange])

  // All route coords in order
  const allCoords: [number, number][] = [
    ...(fromAerodrome ? [aerodromeCoords(fromAerodrome)] : []),
    ...waypoints.map(wp => [wp.lat, wp.lng] as [number, number]),
    ...(toAerodrome ? [aerodromeCoords(toAerodrome)] : []),
  ]

  // Recalculate total route distance across all legs
  useEffect(() => {
    if (allCoords.length >= 2) {
      let total = 0
      for (let i = 1; i < allCoords.length; i++) {
        total += haversineNM(allCoords[i - 1][0], allCoords[i - 1][1], allCoords[i][0], allCoords[i][1])
      }
      const rounded = Math.round(total)
      setTripDistance(rounded)
      setManualDistance(String(rounded))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeFrom, routeTo, waypoints])

  const handleManualDistanceChange = (value: string) => {
    setManualDistance(value)
    const parsed = parseInt(value)
    if (!isNaN(parsed) && parsed >= 0) setTripDistance(parsed)
    else if (value === '') setTripDistance(0)
  }

  const addWaypoint = (r: SearchResult) => {
    setWaypoints(prev => [...prev, {
      id: String(++wpCounter),
      label: r.label,
      lat: r.lat,
      lng: r.lng,
      elevation: r.elevation !== undefined ? String(r.elevation) : '',
      temp: '',
      qnh: '',
    }])
  }

  const removeWaypoint = (id: string) => setWaypoints(prev => prev.filter(wp => wp.id !== id))

  const updateWaypoint = (id: string, field: keyof Omit<WaypointItem, 'id' | 'label' | 'lat' | 'lng'>, value: string) => {
    setWaypoints(prev => prev.map(wp => wp.id === id ? { ...wp, [field]: value } : wp))
  }

  const moveWaypoint = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir
    if (newIndex < 0 || newIndex >= waypoints.length) return
    setWaypoints(prev => {
      const next = [...prev]
      ;[next[index], next[newIndex]] = [next[newIndex], next[index]]
      return next
    })
  }

  const [blockSpeed, setBlockSpeed] = useState(100)
  const tripTimeMinutes = tripDistance > 0 ? (tripDistance / blockSpeed) * 60 : 0
  const fuelRemaining = fuelData.weight - tripFuelBurn
  const isInsufficientFuel = fuelRemaining < 0

  const groupedAerodromes = {
    ZA: aerodromes.filter(a => a.country === 'ZA'),
    NA: aerodromes.filter(a => a.country === 'NA'),
    BW: aerodromes.filter(a => a.country === 'BW'),
  }

  const AerodromeSelect = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="font-mono">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] z-[1000]">
        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted">South Africa</div>
        {groupedAerodromes.ZA.map(a => <SelectItem key={a.icao} value={a.icao} className="font-mono text-sm">{a.icao} - {a.name}</SelectItem>)}
        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted">Namibia</div>
        {groupedAerodromes.NA.map(a => <SelectItem key={a.icao} value={a.icao} className="font-mono text-sm">{a.icao} - {a.name}</SelectItem>)}
        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted">Botswana</div>
        {groupedAerodromes.BW.map(a => <SelectItem key={a.icao} value={a.icao} className="font-mono text-sm">{a.icao} - {a.name}</SelectItem>)}
      </SelectContent>
    </Select>
  )

  return (
    <div className="aviation-card p-5">
      <div className="section-header flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Trip Planning</h3>
      </div>

      {/* Departure */}
      <div className="mb-3">
        <Label className="text-xs text-muted-foreground mb-1 block">From (ICAO)</Label>
        <AerodromeSelect value={routeFrom} onChange={setRouteFrom} placeholder="Select departure" />
        {fromAerodrome && (
          <>
            <p className="text-xs text-muted-foreground mt-1">Elev: {fromAerodrome.elevation} ft</p>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Temp (°C)</div>
                <Input type="number" value={fromTemp} onChange={e => setFromTemp(e.target.value)} placeholder="15" className="h-7 text-xs font-mono px-2" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">QNH (hPa)</div>
                <Input type="number" value={fromQnh} onChange={e => setFromQnh(e.target.value)} placeholder="1013" className="h-7 text-xs font-mono px-2" />
              </div>
            </div>
            {(() => {
              const t = parseFloat(fromTemp)
              if (isNaN(t)) return null
              const delta = t - isaTemp(fromAerodrome.elevation)
              return (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Thermometer className="h-3 w-3 text-muted-foreground" />
                  <span className={`text-xs font-mono font-semibold ${delta > 0 ? 'text-orange-500' : delta < 0 ? 'text-blue-500' : 'text-green-500'}`}>
                    {formatDeltaISA(delta)}
                  </span>
                  <span className="text-xs text-muted-foreground">(ISA std: {Math.round(isaTemp(fromAerodrome.elevation))}°C)</span>
                </div>
              )
            })()}
          </>
        )}
      </div>

      {/* Waypoints */}
      {waypoints.length > 0 && (
        <div className="space-y-2 mb-3">
          {waypoints.map((wp, index) => {
            const elevNum = parseFloat(wp.elevation)
            const tempNum = parseFloat(wp.temp)
            const deltaISA = !isNaN(elevNum) && !isNaN(tempNum) ? tempNum - isaTemp(elevNum) : null

            return (
              <div key={wp.id} className="border border-border/50 rounded-lg p-2.5 bg-muted/20 space-y-2">
                {/* Header: label + reorder + delete */}
                <div className="flex items-start gap-1.5">
                  <Navigation className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" title={wp.label}>{wp.label}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{wp.lat.toFixed(4)}° {wp.lng.toFixed(4)}°</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button type="button" onClick={() => moveWaypoint(index, -1)} disabled={index === 0}
                      className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground">
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => moveWaypoint(index, 1)} disabled={index === waypoints.length - 1}
                      className="p-1 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => removeWaypoint(wp.id)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Elev + Temp + QNH */}
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <div>
                    <div className="text-muted-foreground mb-1">Elev (ft)</div>
                    <Input
                      type="number"
                      value={wp.elevation}
                      onChange={(e) => updateWaypoint(wp.id, 'elevation', e.target.value)}
                      placeholder="0"
                      className="h-7 text-xs font-mono px-2"
                    />
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Temp (°C)</div>
                    <Input
                      type="number"
                      value={wp.temp}
                      onChange={(e) => updateWaypoint(wp.id, 'temp', e.target.value)}
                      placeholder="15"
                      className="h-7 text-xs font-mono px-2"
                    />
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">QNH (hPa)</div>
                    <Input
                      type="number"
                      value={wp.qnh}
                      onChange={(e) => updateWaypoint(wp.id, 'qnh', e.target.value)}
                      placeholder="1013"
                      className="h-7 text-xs font-mono px-2"
                    />
                  </div>
                </div>

                {/* Delta ISA */}
                {deltaISA !== null && (
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="h-3 w-3 text-muted-foreground" />
                    <span className={`text-xs font-mono font-semibold ${deltaISA > 0 ? 'text-orange-500' : deltaISA < 0 ? 'text-blue-500' : 'text-green-500'}`}>
                      {formatDeltaISA(deltaISA)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (ISA std: {Math.round(isaTemp(elevNum))}°C)
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add waypoint search */}
      <div className="mb-3">
        <Label className="text-xs text-muted-foreground mb-1 block">Add Waypoint</Label>
        <WaypointSearch onSelect={addWaypoint} />
      </div>

      {/* Destination */}
      <div className="mb-4">
        <Label className="text-xs text-muted-foreground mb-1 block">To (ICAO)</Label>
        <AerodromeSelect value={routeTo} onChange={setRouteTo} placeholder="Select destination" />
        {toAerodrome && (
          <>
            <p className="text-xs text-muted-foreground mt-1">Elev: {toAerodrome.elevation} ft</p>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Temp (°C)</div>
                <Input type="number" value={toTemp} onChange={e => setToTemp(e.target.value)} placeholder="15" className="h-7 text-xs font-mono px-2" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">QNH (hPa)</div>
                <Input type="number" value={toQnh} onChange={e => setToQnh(e.target.value)} placeholder="1013" className="h-7 text-xs font-mono px-2" />
              </div>
            </div>
            {(() => {
              const t = parseFloat(toTemp)
              if (isNaN(t)) return null
              const delta = t - isaTemp(toAerodrome.elevation)
              return (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Thermometer className="h-3 w-3 text-muted-foreground" />
                  <span className={`text-xs font-mono font-semibold ${delta > 0 ? 'text-orange-500' : delta < 0 ? 'text-blue-500' : 'text-green-500'}`}>
                    {formatDeltaISA(delta)}
                  </span>
                  <span className="text-xs text-muted-foreground">(ISA std: {Math.round(isaTemp(toAerodrome.elevation))}°C)</span>
                </div>
              )
            })()}
          </>
        )}
      </div>

      {/* Route Map */}
      <div className="mb-4">
        <RouteMap
          fromAerodrome={fromAerodrome}
          toAerodrome={toAerodrome}
          waypointCoords={waypoints.map(wp => [wp.lat, wp.lng])}
          distance={tripDistance}
        />
      </div>

      {/* Distance input */}
      <div className="mb-4">
        <Label className="text-sm text-muted-foreground mb-2 block">Trip Distance (NM)</Label>
        <Input
          type="number"
          value={manualDistance}
          onChange={(e) => handleManualDistanceChange(e.target.value)}
          placeholder="Enter distance or select route"
          className="font-mono"
        />
      </div>

      {/* Block speed slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-sm text-muted-foreground">Block Speed</Label>
          <span className="font-mono font-semibold text-sm text-primary">{blockSpeed} kt</span>
        </div>
        <input
          type="range"
          min={60}
          max={180}
          step={5}
          value={blockSpeed}
          onChange={e => setBlockSpeed(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>60 kt</span>
          <span>120 kt</span>
          <span>180 kt</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Fuel burn: {fuelBurnRate} gal/h</p>
      </div>

      {tripDistance > 0 && (
        <>
          <div className="section-divider my-4" />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Flight Time</span>
              </div>
              <span className="font-mono text-xl font-bold text-primary">
                {formatTime(Math.round(tripTimeMinutes))}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <FuelIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Fuel Required</span>
              </div>
              <span className={`font-mono text-xl font-bold ${isInsufficientFuel ? 'text-aviation-red' : 'text-aviation-green'}`}>
                {tripFuelBurn.toFixed(0)} lbs
              </span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Fuel Loaded</span>
              <span className="font-mono">{fuelData.weight.toFixed(0)} lbs</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Trip Fuel Burn</span>
              <span className="font-mono">-{tripFuelBurn.toFixed(0)} lbs</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Fuel Remaining</span>
              <span className={`font-mono font-semibold ${isInsufficientFuel ? 'text-aviation-red' : 'text-aviation-green'}`}>
                {fuelRemaining.toFixed(0)} lbs
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Remaining Endurance</span>
              <span className={`font-mono font-semibold ${isInsufficientFuel ? 'text-aviation-red' : ''}`}>
                {fuelRemaining > 0 ? formatTime(Math.round((fuelRemaining / 6 / fuelBurnRate) * 60)) : '0:00'}
              </span>
            </div>
          </div>

          {isInsufficientFuel && (
            <div className="mt-4 p-3 rounded-lg bg-aviation-red/10 border border-aviation-red/30">
              <div className="flex items-center gap-2 text-aviation-red">
                <FuelIcon className="h-4 w-4" />
                <span className="text-sm font-semibold">INSUFFICIENT FUEL</span>
              </div>
              <p className="text-xs text-aviation-red mt-1">
                Add {Math.abs(fuelRemaining).toFixed(0)} lbs more fuel for this trip
              </p>
            </div>
          )}
        </>
      )}

      {tripDistance === 0 && (
        <div className="text-center text-muted-foreground text-sm py-4">
          Enter trip distance to calculate fuel requirements
        </div>
      )}
    </div>
  )
}
