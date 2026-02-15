import { Gauge } from 'lucide-react'
import type { SpeedData } from '@/types/aircraft'
import { STALL_SPEEDS } from '@/types/aircraft'

interface SpeedsPanelProps {
  speeds: SpeedData
}

export function SpeedsPanel({ speeds }: SpeedsPanelProps) {
  return (
    <div className="aviation-card p-5">
      <div className="section-header flex items-center gap-2 mb-4">
        <Gauge className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Speeds (mph)</h3>
      </div>

      <div className="space-y-2 text-sm">
        {/* Critical speeds */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between p-2 rounded bg-aviation-red/10">
            <span className="text-aviation-red font-medium">Vne</span>
            <span className="font-mono font-bold text-aviation-red">{speeds.neverExceed}</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-aviation-amber/10">
            <span className="text-aviation-amber font-medium">Vno</span>
            <span className="font-mono font-bold text-aviation-amber">{speeds.maxStructural}</span>
          </div>
        </div>

        <div className="section-divider my-3" />

        {/* Operational speeds */}
        <div className="space-y-1">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Rotate</span>
            <span className="font-mono">{speeds.rotate}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Best Angle (Vx)</span>
            <span className="font-mono">{speeds.bestAngle}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Best Rate (Vy)</span>
            <span className="font-mono">{speeds.bestRate}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Cruise Climb</span>
            <span className="font-mono">{speeds.cruiseClimb}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Manoeuvring (Va)</span>
            <span className="font-mono font-semibold">{speeds.manoeuvring}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Best Glide</span>
            <span className="font-mono">{speeds.bestGlide}</span>
          </div>
        </div>

        <div className="section-divider my-3" />

        {/* Flap speeds */}
        <div className="space-y-1">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Flaps 10°</span>
            <span className="font-mono">{speeds.flaps10}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Flaps 20°-Full</span>
            <span className="font-mono">{speeds.flaps20Full}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Approach Full Flaps</span>
            <span className="font-mono">{speeds.approachFull}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Over the Fence</span>
            <span className="font-mono">{speeds.overFence}</span>
          </div>
        </div>

        <div className="section-divider my-3" />

        {/* Stall speeds */}
        <h4 className="font-medium text-sm mb-2">Stall Speeds (Power Off)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1 text-muted-foreground">Config</th>
                <th className="text-center py-1 text-muted-foreground">0°</th>
                <th className="text-center py-1 text-muted-foreground">20°</th>
                <th className="text-center py-1 text-muted-foreground">40°</th>
                <th className="text-center py-1 text-muted-foreground">60°</th>
              </tr>
            </thead>
            <tbody>
              {STALL_SPEEDS.map((row) => (
                <tr key={row.configuration} className="border-b border-border/50">
                  <td className="py-1 text-muted-foreground">{row.configuration}</td>
                  <td className="text-center py-1 font-mono">{row.bankAngle[0]}</td>
                  <td className="text-center py-1 font-mono">{row.bankAngle[20]}</td>
                  <td className="text-center py-1 font-mono">{row.bankAngle[40]}</td>
                  <td className="text-center py-1 font-mono text-aviation-amber font-semibold">
                    {row.bankAngle[60]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
