import { Target } from 'lucide-react'
import type { WeightBalance, CGEnvelopePoint } from '@/types/aircraft'
import { CG_ENVELOPE } from '@/types/aircraft'

interface CGEnvelopeProps {
  weightBalance: WeightBalance
  maxGross: number
  envelope?: CGEnvelopePoint[]
}

export function CGEnvelope({ weightBalance, maxGross, envelope }: CGEnvelopeProps) {
  // Use provided envelope or default to C206
  const cgEnvelope = envelope || CG_ENVELOPE
  const {
    totalWeight,
    totalMoment,
    zfwWeight,
    zfwMoment,
    landingWeight,
    landingMoment,
    isWithinLimits,
  } = weightBalance

  // Chart dimensions
  const chartWidth = 400
  const chartHeight = 300
  const padding = { top: 30, right: 30, bottom: 50, left: 60 }
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  // Calculate scale ranges dynamically from envelope
  const moments = cgEnvelope.map(p => p.moment)
  const weights = cgEnvelope.map(p => p.weight)
  const momentMin = Math.min(...moments)
  const momentMax = Math.max(...moments)
  const weightMin = Math.min(...weights)
  const weightMax = Math.max(...weights)

  // Add padding to ranges
  const momentRange = { min: Math.floor(momentMin - 10), max: Math.ceil(momentMax + 10) }
  const weightRange = { min: Math.floor(weightMin - 200), max: Math.ceil(weightMax + 200) }

  // Scale functions
  const scaleMoment = (moment: number) => {
    return (
      padding.left +
      ((moment - momentRange.min) / (momentRange.max - momentRange.min)) * innerWidth
    )
  }

  const scaleWeight = (weight: number) => {
    return (
      padding.top +
      innerHeight -
      ((weight - weightRange.min) / (weightRange.max - weightRange.min)) * innerHeight
    )
  }

  // Build SVG path from envelope points
  const envelopePath = cgEnvelope.map(
    (point, i) =>
      `${i === 0 ? 'M' : 'L'} ${scaleMoment(point.moment)} ${scaleWeight(point.weight)}`
  ).join(' ')

  // Generate grid lines dynamically
  const momentStep = Math.round((momentRange.max - momentRange.min) / 5 / 10) * 10
  const weightStep = Math.round((weightRange.max - weightRange.min) / 5 / 100) * 100
  const momentGridLines = Array.from({ length: 5 }, (_, i) => momentRange.min + 10 + momentStep * i)
  const weightGridLines = Array.from({ length: 5 }, (_, i) => weightRange.min + 100 + weightStep * i)

  return (
    <div className="aviation-card p-5">
      <div className="section-header flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">CG Envelope</h3>
        <span
          className={`ml-auto text-sm font-semibold ${
            isWithinLimits ? 'status-ok' : 'status-danger'
          }`}
        >
          {isWithinLimits ? 'Within Limits' : 'OUT OF LIMITS'}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto"
      >
        {/* Background */}
        <rect
          x={padding.left}
          y={padding.top}
          width={innerWidth}
          height={innerHeight}
          fill="hsl(152 25% 8%)"
          opacity={0.9}
        />

        {/* Grid lines - horizontal (weight) */}
        {weightGridLines.map((weight) => (
          <g key={`weight-${weight}`}>
            <line
              x1={padding.left}
              y1={scaleWeight(weight)}
              x2={chartWidth - padding.right}
              y2={scaleWeight(weight)}
              stroke="hsl(152 20% 30%)"
              strokeWidth="0.75"
              strokeDasharray="4,4"
            />
            <text
              x={padding.left - 8}
              y={scaleWeight(weight)}
              textAnchor="end"
              alignmentBaseline="middle"
              className="text-[10px] fill-muted-foreground"
            >
              {weight}
            </text>
          </g>
        ))}

        {/* Grid lines - vertical (moment) */}
        {momentGridLines.map((moment) => (
          <g key={`moment-${moment}`}>
            <line
              x1={scaleMoment(moment)}
              y1={padding.top}
              x2={scaleMoment(moment)}
              y2={chartHeight - padding.bottom}
              stroke="hsl(152 20% 30%)"
              strokeWidth="0.75"
              strokeDasharray="4,4"
            />
            <text
              x={scaleMoment(moment)}
              y={chartHeight - padding.bottom + 20}
              textAnchor="middle"
              className="text-[10px] fill-muted-foreground"
            >
              {moment}
            </text>
          </g>
        ))}

        {/* Max gross line */}
        <line
          x1={padding.left}
          y1={scaleWeight(maxGross)}
          x2={chartWidth - padding.right}
          y2={scaleWeight(maxGross)}
          stroke="hsl(var(--aviation-red))"
          strokeWidth="1.5"
          strokeDasharray="6,3"
        />
        <text
          x={chartWidth - padding.right - 5}
          y={scaleWeight(maxGross) - 5}
          textAnchor="end"
          className="text-[9px] fill-aviation-red font-semibold"
        >
          Max {maxGross} lbs
        </text>

        {/* Envelope boundary */}
        <path
          d={envelopePath}
          fill="hsl(152 50% 40%)"
          fillOpacity={0.25}
          stroke="hsl(152 50% 50%)"
          strokeWidth="3"
        />

        {/* ZFW point (without fuel) */}
        {zfwWeight > 0 && (
          <>
            <circle
              cx={scaleMoment(zfwMoment)}
              cy={scaleWeight(zfwWeight)}
              r="6"
              fill="none"
              stroke="hsl(var(--aviation-blue))"
              strokeWidth="2"
            />
            <text
              x={scaleMoment(zfwMoment) + 10}
              y={scaleWeight(zfwWeight) - 8}
              className="text-[9px] fill-aviation-blue font-semibold"
            >
              ZFW
            </text>
          </>
        )}

        {/* Takeoff point */}
        {totalWeight > 0 && (
          <>
            <circle
              cx={scaleMoment(totalMoment)}
              cy={scaleWeight(totalWeight)}
              r="6"
              fill="hsl(var(--aviation-amber))"
              stroke="hsl(var(--aviation-amber))"
              strokeWidth="2"
            />
            <text
              x={scaleMoment(totalMoment) + 10}
              y={scaleWeight(totalWeight) + 4}
              className="text-[9px] fill-aviation-amber font-semibold"
            >
              T/O
            </text>
          </>
        )}

        {/* Landing point */}
        {landingWeight > 0 && landingWeight !== totalWeight && (
          <>
            <circle
              cx={scaleMoment(landingMoment)}
              cy={scaleWeight(landingWeight)}
              r="6"
              fill="none"
              stroke="hsl(var(--aviation-cyan))"
              strokeWidth="2"
            />
            <text
              x={scaleMoment(landingMoment) + 10}
              y={scaleWeight(landingWeight) + 4}
              className="text-[9px] fill-aviation-cyan font-semibold"
            >
              LDG
            </text>
          </>
        )}

        {/* Line connecting T/O to LDG (fuel burn) */}
        {landingWeight > 0 && landingWeight !== totalWeight && (
          <line
            x1={scaleMoment(totalMoment)}
            y1={scaleWeight(totalWeight)}
            x2={scaleMoment(landingMoment)}
            y2={scaleWeight(landingWeight)}
            stroke="hsl(var(--foreground))"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity={0.5}
          />
        )}

        {/* Axis labels */}
        <text
          x={chartWidth / 2}
          y={chartHeight - 5}
          textAnchor="middle"
          className="text-[11px] fill-foreground font-medium"
        >
          Moment (lb·in/1000)
        </text>
        <text
          x={15}
          y={chartHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90, 15, ${chartHeight / 2})`}
          className="text-[11px] fill-foreground font-medium"
        >
          Weight (lbs)
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full border-2 border-aviation-blue" />
          <span>ZFW</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-aviation-amber" />
          <span>Take-off</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full border-2 border-aviation-cyan" />
          <span>Landing</span>
        </div>
      </div>
    </div>
  )
}
