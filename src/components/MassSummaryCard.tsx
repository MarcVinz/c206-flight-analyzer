import { Scale, AlertTriangle, CheckCircle } from 'lucide-react'
import type { WeightBalance, AircraftConfig } from '@/types/aircraft'
import { lbsToKg } from '@/lib/utils'

interface MassSummaryCardProps {
  weightBalance: WeightBalance
  aircraftConfig: AircraftConfig
  usefulLoad: number
  remainingPayload: number
}

export function MassSummaryCard({
  weightBalance,
  aircraftConfig,
  usefulLoad,
  remainingPayload,
}: MassSummaryCardProps) {
  const {
    totalWeight,
    cg,
    isWithinLimits,
    zfwWeight,
    landingWeight,
  } = weightBalance

  const isOverweight = totalWeight > aircraftConfig.maxGross
  const percentOfMax = (totalWeight / aircraftConfig.maxGross) * 100

  return (
    <div className="aviation-card p-5">
      <div className="section-header flex items-center gap-2 mb-4">
        <Scale className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Weight Summary</h3>
      </div>

      {/* Main weight display */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground">Total Weight</span>
          <div className="text-right">
            <span
              className={`text-2xl font-mono font-bold ${
                isOverweight ? 'status-danger' : 'status-ok'
              }`}
            >
              {totalWeight.toFixed(0)} lbs
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              ({lbsToKg(totalWeight).toFixed(0)} kg)
            </span>
          </div>
        </div>

        {/* Weight bar */}
        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
              isOverweight ? 'bg-aviation-red' : 'bg-aviation-green'
            }`}
            style={{ width: `${Math.min(100, percentOfMax)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-muted-foreground">0</span>
          <span className={isOverweight ? 'text-aviation-red font-semibold' : 'text-muted-foreground'}>
            Max: {aircraftConfig.maxGross} lbs ({lbsToKg(aircraftConfig.maxGross).toFixed(0)} kg)
          </span>
        </div>
      </div>

      {/* Status */}
      <div
        className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
          isWithinLimits ? 'bg-aviation-green/10' : 'bg-aviation-red/10'
        }`}
      >
        {isWithinLimits ? (
          <>
            <CheckCircle className="h-5 w-5 text-aviation-green" />
            <span className="text-sm font-medium text-aviation-green">
              Weight & CG within limits
            </span>
          </>
        ) : (
          <>
            <AlertTriangle className="h-5 w-5 text-aviation-red" />
            <span className="text-sm font-medium text-aviation-red">
              WEIGHT OR CG OUT OF LIMITS
            </span>
          </>
        )}
      </div>

      {/* Details table */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between py-1 border-b border-border/50">
          <span className="text-muted-foreground">Empty Weight</span>
          <span className="font-mono">
            {aircraftConfig.emptyWeight.toFixed(0)} lbs ({lbsToKg(aircraftConfig.emptyWeight).toFixed(0)} kg)
          </span>
        </div>
        <div className="flex justify-between py-1 border-b border-border/50">
          <span className="text-muted-foreground">Zero Fuel Weight</span>
          <span className="font-mono">{zfwWeight.toFixed(0)} lbs ({lbsToKg(zfwWeight).toFixed(0)} kg)</span>
        </div>
        <div className="flex justify-between py-1 border-b border-border/50">
          <span className="text-muted-foreground">Takeoff Weight</span>
          <span className={`font-mono font-semibold ${isOverweight ? 'text-aviation-red' : ''}`}>
            {totalWeight.toFixed(0)} lbs ({lbsToKg(totalWeight).toFixed(0)} kg)
          </span>
        </div>
        <div className="flex justify-between py-1 border-b border-border/50">
          <span className="text-muted-foreground">CG</span>
          <span className="font-mono">{cg.toFixed(2)}"</span>
        </div>
        <div className="flex justify-between py-1 border-b border-border/50">
          <span className="text-muted-foreground">Landing Weight</span>
          <span className="font-mono">{landingWeight.toFixed(0)} lbs ({lbsToKg(landingWeight).toFixed(0)} kg)</span>
        </div>
      </div>

      <div className="section-divider my-4" />

      {/* Useful load info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-muted/50">
          <span className="text-xs text-muted-foreground block mb-1">Useful Load</span>
          <span className="font-mono text-lg font-semibold">{usefulLoad.toFixed(0)} lbs</span>
          <span className="text-xs text-muted-foreground block">({lbsToKg(usefulLoad).toFixed(0)} kg)</span>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <span className="text-xs text-muted-foreground block mb-1">Remaining</span>
          <span
            className={`font-mono text-lg font-semibold ${
              remainingPayload < 0 ? 'text-aviation-red' : 'text-aviation-green'
            }`}
          >
            {remainingPayload.toFixed(0)} lbs
          </span>
          <span className="text-xs text-muted-foreground block">({lbsToKg(remainingPayload).toFixed(0)} kg)</span>
        </div>
      </div>
    </div>
  )
}
