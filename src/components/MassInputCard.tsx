import { User, Users, Briefcase, Package } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MassItem } from '@/types/aircraft'
import { lbsToKg } from '@/lib/utils'

interface MassInputCardProps {
  item: MassItem
  onChange: (id: string, mass: number) => void
}

function getIcon(id: string) {
  switch (id) {
    case 'pilot':
    case 'front_pax':
    case 'row2_left':
    case 'row2_right':
    case 'row3_left':
    case 'row3_right':
      return <User className="h-4 w-4" />
    case 'baggage':
      return <Briefcase className="h-4 w-4" />
    case 'cargo_pod':
      return <Package className="h-4 w-4" />
    default:
      return <Package className="h-4 w-4" />
  }
}

// Check if item is a passenger (individual person)
function isPassengerItem(id: string): boolean {
  return ['pilot', 'front_pax', 'row2_left', 'row2_right', 'row3_left', 'row3_right'].includes(id)
}

// Short label for compact display
function getShortLabel(id: string): string {
  switch (id) {
    case 'pilot': return 'Pilot'
    case 'front_pax': return 'Front Pax'
    case 'row2_left': return 'Left'
    case 'row2_right': return 'Right'
    case 'row3_left': return 'Left'
    case 'row3_right': return 'Right'
    default: return ''
  }
}

export function MassInputCard({ item, onChange }: MassInputCardProps) {
  const moment = (item.mass * item.arm) / 1000
  const isOverMax = item.max !== undefined && item.mass > item.max
  const isOutOfRange = isOverMax
  const isCompact = isPassengerItem(item.id)

  if (isCompact) {
    // Compact layout for individual passengers with slider
    return (
      <div
        className={`p-3 rounded-lg bg-secondary/50 border transition-all ${
          isOutOfRange
            ? 'border-aviation-red/70'
            : 'border-border/50 hover:border-primary/30'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={isOutOfRange ? 'text-aviation-red' : 'text-primary'}>
              {getIcon(item.id)}
            </span>
            <Label className="text-sm font-medium">{getShortLabel(item.id)}</Label>
          </div>
          {item.mass > 0 && (
            <span className="text-xs text-muted-foreground">
              {lbsToKg(item.mass).toFixed(0)} kg
            </span>
          )}
        </div>

        {/* Slider */}
        <Slider
          value={[item.mass]}
          onValueChange={([v]) => onChange(item.id, v)}
          max={item.max ?? 250}
          min={item.min ?? 0}
          step={5}
          className="mb-2"
        />

        {/* Weight display and input */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={item.mass || ''}
            onChange={(e) => onChange(item.id, parseFloat(e.target.value) || 0)}
            min={item.min}
            max={item.max}
            placeholder="0"
            className={`flex-1 font-mono text-right h-8 text-sm ${
              isOutOfRange ? 'text-aviation-red border-aviation-red/50' : ''
            }`}
          />
          <span className="text-xs text-muted-foreground">lbs</span>
        </div>

        {isOutOfRange && (
          <div className="mt-1 text-xs text-aviation-red font-semibold">
            Max {item.max} lbs
          </div>
        )}
      </div>
    )
  }

  // Full layout for baggage items
  return (
    <div
      className={`p-4 rounded-lg bg-secondary/50 border transition-all ${
        isOutOfRange
          ? 'border-aviation-red/70 hover:border-aviation-red'
          : 'border-border/50 hover:border-primary/30'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={isOutOfRange ? 'text-aviation-red' : 'text-primary'}>
            {getIcon(item.id)}
          </span>
          <Label className="text-sm font-medium">{item.label}</Label>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          Arm: {item.arm}"
        </span>
      </div>

      {/* Dual input: Slider + Number Input */}
      <div className="flex items-center gap-3">
        <Slider
          value={[item.mass]}
          onValueChange={([v]) => onChange(item.id, v)}
          max={item.max ?? 500}
          min={item.min ?? 0}
          step={1}
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={item.mass || ''}
            onChange={(e) => onChange(item.id, parseFloat(e.target.value) || 0)}
            min={item.min}
            max={item.max}
            className={`w-20 sm:w-24 font-mono text-right ${
              isOutOfRange ? 'text-aviation-red border-aviation-red/50' : ''
            }`}
          />
          <span className="text-sm text-muted-foreground w-8">lbs</span>
        </div>
      </div>

      {/* Kg equivalent */}
      {item.mass > 0 && (
        <div className="mt-1 text-xs text-muted-foreground text-right">
          = {lbsToKg(item.mass).toFixed(0)} kg
        </div>
      )}

      {/* Display calculations and warnings */}
      <div className="mt-2 flex justify-between text-xs">
        <span
          className={
            isOutOfRange ? 'text-aviation-red font-semibold' : 'text-muted-foreground'
          }
        >
          Moment: {moment.toFixed(2)} lb·in/1000
        </span>
        {item.max && (
          <span
            className={
              isOverMax ? 'text-aviation-red font-semibold' : 'text-muted-foreground'
            }
          >
            Max: {item.max} lbs ({lbsToKg(item.max).toFixed(0)} kg)
          </span>
        )}
      </div>

      {isOutOfRange && (
        <div className="mt-2 text-xs text-aviation-red font-semibold">
          Warning: Exceeds maximum weight
        </div>
      )}
    </div>
  )
}
