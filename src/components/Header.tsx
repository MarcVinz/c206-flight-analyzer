import { Printer } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AIRCRAFT_CONFIGS } from '@/data/aircraftConfigs'
import type { AircraftConfig } from '@/types/aircraft'

const PILOT_NAMES = ['Alex', 'Juris', 'Marc']

interface HeaderProps {
  selectedAircraft: string
  onAircraftChange: (registration: string) => void
  aircraftConfig: AircraftConfig
  pilotName: string
  onPilotNameChange: (name: string) => void
  flightDate: string
  onFlightDateChange: (date: string) => void
}

export function Header({
  selectedAircraft,
  onAircraftChange,
  aircraftConfig,
  pilotName,
  onPilotNameChange,
  flightDate,
  onFlightDateChange,
}: HeaderProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 no-print">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        {/* Mobile layout */}
        <div className="flex flex-col gap-3 lg:hidden">
          {/* Row 1: Logo + Aircraft selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Africa Bushpilot"
                className="h-[3.6rem] w-[3.6rem] rounded-full"
              />
              <div>
                <h1 className="text-lg font-bold text-foreground">Flight Analyzer</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedAircraft} onValueChange={onAircraftChange}>
                <SelectTrigger className="w-[110px] h-9">
                  <SelectValue placeholder="Aircraft" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(AIRCRAFT_CONFIGS).map((reg) => (
                    <SelectItem key={reg} value={reg}>
                      {reg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrint}
                title="Print"
                className="h-9 w-9"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Row 2: Pilot + Date */}
          <div className="flex items-center gap-2">
            <Input
              type="text"
              list="pilot-names"
              placeholder="Pilot name"
              value={pilotName}
              onChange={(e) => onPilotNameChange(e.target.value)}
              className="flex-1 h-9"
            />
            <datalist id="pilot-names">
              {PILOT_NAMES.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <Input
              type="date"
              value={flightDate}
              onChange={(e) => onFlightDateChange(e.target.value)}
              className="w-[130px] h-9"
            />
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:flex items-center justify-between gap-4">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Africa Bushpilot"
              className="h-20 w-20 rounded-full"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">Flight Analyzer</h1>
              <p className="text-xs text-muted-foreground">Africa Bushpilot Adventures</p>
            </div>
          </div>

          {/* Aircraft selector and info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Aircraft:</span>
              <Select value={selectedAircraft} onValueChange={onAircraftChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select aircraft" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(AIRCRAFT_CONFIGS).map((reg) => (
                    <SelectItem key={reg} value={reg}>
                      {reg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{aircraftConfig.model}</span>
              <span>•</span>
              <span>{aircraftConfig.engine.model}</span>
              <span>•</span>
              <span>{aircraftConfig.engine.hp} HP</span>
            </div>
          </div>

          {/* Pilot and date */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Pilot:</span>
              <Input
                type="text"
                list="pilot-names-desktop"
                placeholder="Pilot name"
                value={pilotName}
                onChange={(e) => onPilotNameChange(e.target.value)}
                className="w-32 h-9"
              />
              <datalist id="pilot-names-desktop">
                {PILOT_NAMES.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Date:</span>
              <Input
                type="date"
                value={flightDate}
                onChange={(e) => onFlightDateChange(e.target.value)}
                className="w-36 h-9"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handlePrint}
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
