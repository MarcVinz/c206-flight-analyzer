import { MapPin, Navigation, Clock, Fuel as FuelIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FuelData } from '@/types/aircraft'
import { formatTime } from '@/lib/utils'

interface DestinationPanelProps {
  tripDistance: number
  setTripDistance: (distance: number) => void
  tripFuelBurn: number
  fuelData: FuelData
  fuelBurnRate: number
}

export function DestinationPanel({
  tripDistance,
  setTripDistance,
  tripFuelBurn,
  fuelData,
  fuelBurnRate,
}: DestinationPanelProps) {
  // Assume 100 kt block speed
  const blockSpeed = 100
  const tripTimeMinutes = tripDistance > 0 ? (tripDistance / blockSpeed) * 60 : 0
  const fuelRemaining = fuelData.weight - tripFuelBurn
  const isInsufficientFuel = fuelRemaining < 0

  return (
    <div className="aviation-card p-5">
      <div className="section-header flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Trip Planning</h3>
      </div>

      {/* Distance input */}
      <div className="mb-4">
        <Label className="text-sm text-muted-foreground mb-2 block">
          Trip Distance (NM)
        </Label>
        <Input
          type="number"
          value={tripDistance || ''}
          onChange={(e) => setTripDistance(Math.max(0, parseInt(e.target.value) || 0))}
          placeholder="Enter distance"
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Block speed: {blockSpeed} kt • Fuel burn: {fuelBurnRate} gal/h
        </p>
      </div>

      {tripDistance > 0 && (
        <>
          <div className="section-divider my-4" />

          {/* Trip calculations */}
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

          {/* Fuel status */}
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
