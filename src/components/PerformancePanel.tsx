import { useState, useMemo, useEffect } from 'react'
import { Activity, Thermometer, Gauge } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/contexts/LanguageContext'

export type PerfData = {
  altitude: number; qnh: number; oat: number
  pressureAltitude: number; densityAltitude: number; isaDeviation: number
}

export interface PerfAutoFill {
  altitude?: number
  qnh?: number
  oat?: number
}

interface PerformancePanelProps {
  onDataChange?: (data: PerfData) => void
  autoFill?: PerfAutoFill
}

export function PerformancePanel({ onDataChange, autoFill }: PerformancePanelProps = {}) {
  const { t } = useLanguage()
  const [altitudeStr, setAltitudeStr] = useState('0')
  const [qnhStr, setQnhStr] = useState('1013')
  const [oatStr, setOatStr] = useState('15')

  useEffect(() => {
    if (autoFill?.altitude !== undefined) setAltitudeStr(String(autoFill.altitude))
    if (autoFill?.qnh !== undefined) setQnhStr(String(autoFill.qnh))
    if (autoFill?.oat !== undefined) setOatStr(String(autoFill.oat))
  }, [autoFill?.altitude, autoFill?.qnh, autoFill?.oat])

  const altitude = parseInt(altitudeStr) || 0
  const qnh = parseInt(qnhStr) || 1013
  const oat = oatStr === '' || oatStr === '-' ? 0 : parseInt(oatStr) || 0

  const performanceData = useMemo(() => {
    const pressureAltitude = Math.round(altitude + (1013 - qnh) * 30)
    const isaTemp = 15 - (pressureAltitude * 0.00198)
    const isaDeviation = Math.round(oat - isaTemp)
    const densityAltitude = Math.round(pressureAltitude + (120 * isaDeviation))
    return { pressureAltitude, densityAltitude, isaDeviation }
  }, [altitude, qnh, oat])

  useEffect(() => {
    onDataChange?.({ altitude, qnh, oat, ...performanceData })
  }, [altitude, qnh, oat, performanceData, onDataChange])

  return (
    <div className="aviation-card p-5">
      <div className="section-header flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">{t('performance')}</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">{t('altitudeFt')}</Label>
          <Input
            type="number"
            value={altitudeStr}
            onChange={(e) => setAltitudeStr(e.target.value)}
            onBlur={() => {
              if (altitudeStr === '' || isNaN(parseInt(altitudeStr))) setAltitudeStr('0')
            }}
            placeholder="0"
            className="font-mono text-right"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">{t('qnh')}</Label>
          <Input
            type="number"
            value={qnhStr}
            onChange={(e) => setQnhStr(e.target.value)}
            onBlur={() => {
              if (qnhStr === '' || isNaN(parseInt(qnhStr))) setQnhStr('1013')
            }}
            placeholder="1013"
            className="font-mono text-right"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">{t('oat')}</Label>
          <Input
            type="number"
            value={oatStr}
            onChange={(e) => setOatStr(e.target.value)}
            onBlur={() => {
              if (oatStr !== '-' && (oatStr === '' || isNaN(parseInt(oatStr)))) setOatStr('15')
            }}
            placeholder="15"
            className="font-mono text-right"
          />
        </div>
      </div>

      <div className="section-divider my-4" />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{t('pressureAlt')}</span>
          </div>
          <span className="font-mono text-lg font-bold text-foreground">
            {performanceData.pressureAltitude.toLocaleString()} ft
          </span>
        </div>

        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{t('densityAlt')}</span>
          </div>
          <span className="font-mono text-lg font-bold text-foreground">
            {performanceData.densityAltitude.toLocaleString()} ft
          </span>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-secondary/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t('isaDeviation')}</span>
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
