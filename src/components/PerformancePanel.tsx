import { useState, useMemo, useEffect } from 'react'
import { Activity, Thermometer, Gauge } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type PerfData = {
  altitude: number; qnh: number; oat: number
  pressureAltitude: number; densityAltitude: number; isaDeviation: number
}

interface PerformancePanelProps {
  onDataChange?: (data: PerfData) => void
}

export function PerformancePanel({ onDataChange }: PerformancePanelProps = {}) {
  // Use string state for better keyboard input handling
  const [altitudeStr, setAltitudeStr] = useState('0')
  const [qnhStr, setQnhStr] = useState('1013')
  const [oatStr, setOatStr] = useState('15')

  // Parse to numbers for calculations
  const altitude = parseInt(altitudeStr) || 0
  const qnh = parseInt(qnhStr) || 1013
  const oat = oatStr === '' || oatStr === '-' ? 0 : parseInt(oatStr) || 0

  const performanceData = useMemo(() => {
    // Pressure Altitude = Indicated Altitude + ((1013 - QNH) × 30)
    const pressureAltitude = Math.round(altitude + (1013 - qnh) * 30)

    // ISA temperature at altitude: 15°C - (altitude × 0.00198°C/ft)
    const isaTemp = 15 - (pressureAltitude * 0.00198)
    const isaDeviation = Math.round(oat - isaTemp)

    // Density Altitude = Pressure Altitude + (120 × ISA deviation)
    const densityAltitude = Math.round(pressureAltitude + (120 * isaDeviation))

    return {
      pressureAltitude,
      densityAltitude,
      isaDeviation,
    }
  }, [altitude, qnh, oat])

  useEffect(() => {
    onDataChange?.({ altitude, qnh, oat, ...performanceData })
  }, [altitude, qnh, oat, performanceData, onDataChange])

  return (
    <div className="aviation-card p-5">
      <div className="section-header flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Performance</h3>
      </div>

      {/* Input fields */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Altitude (ft)</Label>
          <Input
            type="number"
            value={altitudeStr}
            onChange={(e) => setAltitudeStr(e.target.value)}
            onBlur={() => {
              if (altitudeStr === '' || isNaN(parseInt(altitudeStr))) {
                setAltitudeStr('0')
              }
            }}
            placeholder="0"
            className="font-mono text-right"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">QNH (hPa)</Label>
          <Input
            type="number"
            value={qnhStr}
            onChange={(e) => setQnhStr(e.target.value)}
            onBlur={() => {
              if (qnhStr === '' || isNaN(parseInt(qnhStr))) {
                setQnhStr('1013')
              }
            }}
            placeholder="1013"
            className="font-mono text-right"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">OAT (°C)</Label>
          <Input
            type="number"
            value={oatStr}
            onChange={(e) => setOatStr(e.target.value)}
            onBlur={() => {
              if (oatStr === '' || (oatStr !== '-' && isNaN(parseInt(oatStr)))) {
                setOatStr('15')
              }
            }}
            placeholder="15"
            className="font-mono text-right"
          />
        </div>
      </div>

      <div className="section-divider my-4" />

      {/* Calculated altitudes */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Pressure Alt.</span>
          </div>
          <span className="font-mono text-lg font-bold text-foreground">
            {performanceData.pressureAltitude.toLocaleString()} ft
          </span>
        </div>

        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Density Alt.</span>
          </div>
          <span className="font-mono text-lg font-bold text-foreground">
            {performanceData.densityAltitude.toLocaleString()} ft
          </span>
        </div>
      </div>

      {/* ISA Deviation */}
      <div className="p-3 rounded-lg bg-secondary/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">ISA Deviation</span>
          <span className={`font-mono font-bold ${
            performanceData.isaDeviation >= 0 ? 'text-aviation-amber' : 'text-aviation-blue'
          }`}>
            {performanceData.isaDeviation > 0 ? '+' : ''}{performanceData.isaDeviation}°C
          </span>
        </div>
      </div>
    </div>
  )
}
