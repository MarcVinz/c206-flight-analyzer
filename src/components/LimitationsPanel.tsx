import { AlertTriangle, Thermometer, Gauge, Droplet } from 'lucide-react'
import type { LimitationData, AircraftConfig } from '@/types/aircraft'

interface LimitationsPanelProps {
  limitations: LimitationData
  engine: AircraftConfig['engine']
}

export function LimitationsPanel({ limitations, engine }: LimitationsPanelProps) {
  return (
    <div className="aviation-card p-5">
      <div className="section-header flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-aviation-amber" />
        <h3 className="text-lg font-semibold">Limitations</h3>
      </div>

      {/* Engine Info */}
      <div className="p-3 rounded-lg bg-muted/50 mb-4">
        <div className="font-medium mb-1">{engine.model}</div>
        <div className="text-sm text-muted-foreground">
          {engine.hp} HP @ {engine.maxRPM} RPM (5 min)
          <br />
          {engine.hp - 15} HP @ {engine.continuousRPM} RPM (continuous)
        </div>
      </div>

      <div className="space-y-4 text-sm">
        {/* Temperature Limits */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="h-4 w-4 text-aviation-red" />
            <h4 className="font-medium">Temperatures (°F)</h4>
          </div>
          <div className="grid grid-cols-1 gap-1 ml-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">CHT Min (Run-up)</span>
              <span className="font-mono">{limitations.cht.min}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CHT Max</span>
              <span className="font-mono text-aviation-red font-semibold">{limitations.cht.max}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">EGT Max</span>
              <span className="font-mono text-aviation-red font-semibold">{limitations.egt.max}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Oil Temp Min (Run-up)</span>
              <span className="font-mono">{limitations.oilTemp.min}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Oil Temp Max</span>
              <span className="font-mono text-aviation-red font-semibold">{limitations.oilTemp.max}°</span>
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* Pressure Limits */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="h-4 w-4 text-aviation-blue" />
            <h4 className="font-medium">Oil Pressure (PSI)</h4>
          </div>
          <div className="grid grid-cols-1 gap-1 ml-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minimum</span>
              <span className="font-mono text-aviation-red font-semibold">{limitations.oilPressure.min}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Normal Range</span>
              <span className="font-mono text-aviation-green">
                {limitations.oilPressure.normal.min}-{limitations.oilPressure.normal.max}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Maximum</span>
              <span className="font-mono text-aviation-red font-semibold">{limitations.oilPressure.max}</span>
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* RPM Limits */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="h-4 w-4 text-aviation-green" />
            <h4 className="font-medium">RPM</h4>
          </div>
          <div className="grid grid-cols-1 gap-1 ml-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Normal Operating</span>
              <span className="font-mono text-aviation-green">
                {limitations.rpm.normalMin}-{limitations.rpm.normalMax}
              </span>
            </div>
            {limitations.rpm.cautionMax && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cautionary</span>
                <span className="font-mono text-aviation-amber">
                  {limitations.rpm.normalMax}-{limitations.rpm.cautionMax}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Do Not Exceed</span>
              <span className="font-mono text-aviation-red font-semibold">{limitations.rpm.max}</span>
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* Manifold Pressure */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Manifold Pressure (inHg)</h4>
          </div>
          <div className="grid grid-cols-1 gap-1 ml-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Normal Operating</span>
              <span className="font-mono text-aviation-green">
                {limitations.manifoldPressure.normalMin}-{limitations.manifoldPressure.normalMax}"
              </span>
            </div>
            <p className="text-xs text-aviation-amber italic mt-1">
              Note: Keep MAP at or below RPM (in hundreds)
            </p>
          </div>
        </div>

        <div className="section-divider" />

        {/* Load Factors */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-aviation-amber" />
            <h4 className="font-medium">Load Factors @ 3600 lbs</h4>
          </div>
          <div className="grid grid-cols-1 gap-1 ml-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Flaps Up (positive)</span>
              <span className="font-mono">+{limitations.loadFactor.positive}G</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Flaps Up (negative)</span>
              <span className="font-mono">{limitations.loadFactor.negative}G</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Flaps Down</span>
              <span className="font-mono">+{limitations.loadFactor.flapsDown}G</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
