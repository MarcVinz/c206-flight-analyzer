import { useState, useEffect } from 'react'
import { Plane, User, CalendarDays, MapPin, MapPinOff, Sunrise, Sunset, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getSunTimes, formatSunTime } from '@/lib/sunCalc'
import { AIRCRAFT_CONFIGS } from '@/data/aircraftConfigs'
import { useLanguage } from '@/contexts/LanguageContext'

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
  const { t } = useLanguage()
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [geoStatus, setGeoStatus] = useState<'pending' | 'ok' | 'denied' | 'error'>('pending')

  const requestGPS = () => {
    if (!navigator.geolocation) {
      setGeoStatus('denied')
      return
    }
    setGeoStatus('pending')

    const onSuccess = (pos: GeolocationPosition) => {
      const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      setCoords(c)
      setGeoStatus('ok')
      onCoordsChange?.(c)
    }

    const onError = (err: GeolocationPositionError) => {
      if (err.code === 1) {
        // Permission refusée — inutile de réessayer en mode réseau
        setGeoStatus('denied')
        return
      }
      // GPS hardware indisponible ou timeout → fallback réseau/WiFi
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        (err2) => setGeoStatus(err2.code === 1 ? 'denied' : 'error'),
        { timeout: 15000, maximumAge: 60000, enableHighAccuracy: false }
      )
    }

    // Essai 1 : GPS hardware (fonctionne sans réseau)
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      timeout: 10000,
      maximumAge: 60000,
      enableHighAccuracy: true,
    })
  }

  useEffect(() => {
    requestGPS()
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
      <div className="section-header flex items-center gap-2 mb-4">
        <Plane className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">{t('flightInfo')}</h3>
        <div className="ml-auto flex items-center gap-1.5">
          {geoStatus === 'pending' && (
            <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
          )}
          {geoStatus === 'ok' && (
            <MapPin className="h-3.5 w-3.5 text-green-500" />
          )}
          {(geoStatus === 'denied' || geoStatus === 'error') && (
            <button onClick={requestGPS} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors" title="Réessayer la géolocalisation">
              <MapPinOff className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          )}
          {geoStatus === 'ok' && (
            <span className="text-xs text-muted-foreground">{t('gps')}</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Aircraft */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">{t('aircraft')}</div>
          <Select value={selectedAircraft} onValueChange={onAircraftChange}>
            <SelectTrigger className="h-9 w-full">
              <div className="flex items-center gap-2">
                <Plane className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder={t('selectAircraft')} />
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
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">{t('pilot')}</div>
          <div className="relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              list="fp-pilot-names"
              placeholder={t('pilotName')}
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
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">{t('flightType')}</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={flightType === 'private' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFlightTypeChange('private')}
              className="w-full"
            >
              {t('private')}
            </Button>
            <Button
              variant={flightType === 'instruction' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFlightTypeChange('instruction')}
              className="w-full"
            >
              {t('instruction')}
            </Button>
          </div>
          {flightType === 'instruction' && (
            <div className="relative mt-2">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder={t('instructorName')}
                value={instructorName}
                onChange={(e) => onInstructorNameChange(e.target.value)}
                className="pl-8"
              />
            </div>
          )}
        </div>

        {/* Flight Date */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">{t('flightDate')}</div>
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
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('sunrise')}</div>
                <div className="font-mono font-semibold text-sm">{formatSunTime(sunTimes.sunrise)}</div>
              </div>
            </div>
            <div className="w-px h-8 bg-border/60" />
            <div className="flex items-center gap-2">
              <Sunset className="h-5 w-5 text-orange-400" />
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('sunset')}</div>
                <div className="font-mono font-semibold text-sm">{formatSunTime(sunTimes.sunset)}</div>
              </div>
            </div>
          </div>
        ) : flightDate && (geoStatus === 'denied' || geoStatus === 'error') && (
          <button
            onClick={requestGPS}
            className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50 text-xs text-muted-foreground hover:bg-muted transition-colors w-full text-left"
          >
            <MapPinOff className="h-3.5 w-3.5 shrink-0" />
            {geoStatus === 'denied' ? t('enableGPS') : 'GPS indisponible — cliquer pour réessayer'}
          </button>
        )}
      </div>
    </div>
  )
}
