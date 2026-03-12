import { useState, useEffect } from 'react'
import { Plane, User, CalendarDays, MapPin, MapPinOff, Sunrise, Sunset, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getSunTimes, formatSunTime } from '@/lib/sunCalc'
import { AIRCRAFT_CONFIGS } from '@/data/aircraftConfigs'

const PILOT_NAMES = ['Alex', 'Juris', 'Marc']

interface FlightInfoPanelProps {
  selectedAircraft: string
  onAircraftChange: (reg: string) => void
  pilotName: string
  onPilotNameChange: (name: string) => void
  flightDate: string
  onFlightDateChange: (date: string) => void
  flightType: 'private' | 'instruction'
  onFlightTypeChange: (type: 'private' | 'instruction') => void
  instructorName: string
  onInstructorNameChange: (name: string) => void
  onCoordsChange?: (coords: { lat: number; lng: number } | null) => void
}

export function FlightInfoPanel({
  selectedAircraft,
  onAircraftChange,
  pilotName,
  onPilotNameChange,
  flightDate,
  onFlightDateChange,
  flightType,
  onFlightTypeChange,
  instructorName,
  onInstructorNameChange,
  onCoordsChange,
}: FlightInfoPanelProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [geoStatus, setGeoStatus] = useState<'pending' | 'ok' | 'denied'>('pending')

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('denied')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(c)
        setGeoStatus('ok')
        onCoordsChange?.(c)
      },
      () => setGeoStatus('denied'),
      { timeout: 10000 }
    )
  }, [])

  const sunTimes = (() => {
    if (!coords || !flightDate) return null
    const date = new Date(flightDate)
    if (isNaN(date.getTime())) return null
    return getSunTimes(date, coords.lat, coords.lng)
  })()

  const aircraftConfig = AIRCRAFT_CONFIGS[selectedAircraft]

  return (
    <div className="aviation-card p-5">
      {/* Header */}
      <div className="section-header flex items-center gap-2 mb-4">
        <Plane className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Flight Info</h3>
        <div className="ml-auto flex items-center gap-1.5">
          {geoStatus === 'pending' && (
            <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
          )}
          {geoStatus === 'ok' && (
            <MapPin className="h-3.5 w-3.5 text-green-500" aria-label="GPS acquired" />
          )}
          {geoStatus === 'denied' && (
            <MapPinOff className="h-3.5 w-3.5 text-muted-foreground" aria-label="GPS unavailable" />
          )}
          <span className="text-xs text-muted-foreground">
            {geoStatus === 'ok' && 'GPS'}
            {geoStatus === 'denied' && 'Default'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Aircraft */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Aircraft</div>
          <Select value={selectedAircraft} onValueChange={onAircraftChange}>
            <SelectTrigger className="h-9 w-full">
              <div className="flex items-center gap-2">
                <Plane className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Select aircraft" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.keys(AIRCRAFT_CONFIGS).map((reg) => (
                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {aircraftConfig && (
            <div className="text-xs text-muted-foreground mt-1 pl-0.5">
              {aircraftConfig.model} · {aircraftConfig.engine.model} · {aircraftConfig.engine.hp} HP
            </div>
          )}
        </div>

        {/* Pilot */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Pilot</div>
          <div className="relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              list="fp-pilot-names"
              placeholder="Pilot name"
              value={pilotName}
              onChange={(e) => onPilotNameChange(e.target.value)}
              className="pl-8 h-9"
            />
            <datalist id="fp-pilot-names">
              {PILOT_NAMES.map((name) => <option key={name} value={name} />)}
            </datalist>
          </div>
        </div>

        {/* Flight Type */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Flight Type</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={flightType === 'private' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFlightTypeChange('private')}
              className="w-full"
            >
              Private
            </Button>
            <Button
              variant={flightType === 'instruction' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFlightTypeChange('instruction')}
              className="w-full"
            >
              Instruction
            </Button>
          </div>
          {flightType === 'instruction' && (
            <div className="relative mt-2">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Instructor name"
                value={instructorName}
                onChange={(e) => onInstructorNameChange(e.target.value)}
                className="pl-8"
              />
            </div>
          )}
        </div>

        {/* Flight Date */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Flight Date</div>
          <div className="relative">
            <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={flightDate}
              onChange={(e) => onFlightDateChange(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        {/* Sunrise / Sunset */}
        {sunTimes ? (
          <div className="flex items-center justify-around p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2">
              <Sunrise className="h-5 w-5 text-amber-400" />
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Sunrise</div>
                <div className="font-mono font-semibold text-sm">{formatSunTime(sunTimes.sunrise)}</div>
              </div>
            </div>
            <div className="w-px h-8 bg-border/60" />
            <div className="flex items-center gap-2">
              <Sunset className="h-5 w-5 text-orange-400" />
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Sunset</div>
                <div className="font-mono font-semibold text-sm">{formatSunTime(sunTimes.sunset)}</div>
              </div>
            </div>
          </div>
        ) : flightDate && geoStatus === 'denied' && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50 text-xs text-muted-foreground">
            <MapPinOff className="h-3.5 w-3.5 shrink-0" />
            Enable GPS to display sunrise/sunset times
          </div>
        )}
      </div>
    </div>
  )
}
