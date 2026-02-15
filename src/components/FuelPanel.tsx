import { Fuel, Clock } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FuelData } from '@/types/aircraft'
import { formatTime, lbsToKg } from '@/lib/utils'

interface FuelPanelProps {
  fuelGallons: number
  setFuelGallons: (gallons: number) => void
  fuelData: FuelData
  reserveMinutes: number
  setReserveMinutes: (minutes: number) => void
  maxFuelGallons: number
  fuelArm: number
}

export function FuelPanel({
  fuelGallons,
  setFuelGallons,
  fuelData,
  reserveMinutes,
  setReserveMinutes,
  maxFuelGallons,
  fuelArm,
}: FuelPanelProps) {
  const fuelPercentage = (fuelGallons / maxFuelGallons) * 100
  const isLowFuel = fuelData.flightTime < 30

  return (
    <div className="aviation-card p-5">
      <div className="section-header flex items-center gap-2 mb-5">
        <Fuel className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Fuel</h3>
      </div>

      {/* Fuel gauge visualization */}
      <div className="relative h-8 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
          style={{
            width: `${fuelPercentage}%`,
            background: isLowFuel
              ? 'linear-gradient(90deg, var(--color-aviation-red), var(--color-aviation-amber))'
              : 'linear-gradient(90deg, var(--color-aviation-green), var(--color-primary))',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-xs sm:text-sm font-semibold text-foreground drop-shadow-lg">
            {fuelGallons} gal / {fuelData.weight.toFixed(0)} lbs ({lbsToKg(fuelData.weight).toFixed(0)} kg)
          </span>
        </div>
      </div>

      {/* Input controls */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">
            Fuel Quantity (Max {maxFuelGallons} gal usable)
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[fuelGallons]}
              onValueChange={([v]) => setFuelGallons(v)}
              max={maxFuelGallons}
              min={0}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={fuelGallons}
              onChange={(e) =>
                setFuelGallons(
                  Math.min(maxFuelGallons, Math.max(0, parseInt(e.target.value) || 0))
                )
              }
              className="w-20 font-mono text-right"
            />
            <span className="text-sm text-muted-foreground w-8">gal</span>
          </div>
        </div>

        <div>
          <Label className="text-sm text-muted-foreground mb-2 block">Reserve</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[reserveMinutes]}
              onValueChange={([v]) => setReserveMinutes(v)}
              max={60}
              min={0}
              step={5}
              className="flex-1"
            />
            <Input
              type="number"
              value={reserveMinutes}
              onChange={(e) =>
                setReserveMinutes(Math.min(60, Math.max(0, parseInt(e.target.value) || 0)))
              }
              className="w-20 font-mono text-right"
            />
            <span className="text-sm text-muted-foreground w-8">min</span>
          </div>
        </div>
      </div>

      {/* Fuel info */}
      <div className="section-divider my-4" />
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Weight:</span>
          <span className="font-mono">{fuelData.weight.toFixed(0)} lbs ({lbsToKg(fuelData.weight).toFixed(0)} kg)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Arm:</span>
          <span className="font-mono">{fuelArm}"</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Moment:</span>
          <span className="font-mono">{fuelData.moment.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Burn rate:</span>
          <span className="font-mono">{fuelData.consumption} gal/h</span>
        </div>
      </div>

      {/* Time calculations */}
      <div className="section-divider my-4" />
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Flight Time</span>
          </div>
          <span
            className={`font-mono text-xl font-bold ${
              isLowFuel ? 'status-warning' : 'status-ok'
            }`}
          >
            {formatTime(fuelData.flightTime)}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <Fuel className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Endurance</span>
          </div>
          <span className="font-mono text-xl font-bold text-primary">
            {formatTime(fuelData.endurance)}
          </span>
        </div>
      </div>
    </div>
  )
}
