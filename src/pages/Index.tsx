import { useState, useCallback, useRef } from 'react'
import { jsPDF } from 'jspdf'
import { Weight, Target, Fuel, Scale, ClipboardList, Gauge, AlertTriangle, MapPin, BookOpen, Activity } from 'lucide-react'
import { Header } from '@/components/Header'
import { MassInputCard } from '@/components/MassInputCard'
import { FuelPanel } from '@/components/FuelPanel'
import { CGEnvelope } from '@/components/CGEnvelope'
import { MassSummaryCard } from '@/components/MassSummaryCard'
import { SpeedsPanel } from '@/components/SpeedsPanel'
import { LimitationsPanel } from '@/components/LimitationsPanel'
import { DestinationPanel } from '@/components/DestinationPanel'
import { ChecklistPanel } from '@/components/ChecklistPanel'
import { LogBookPanel } from '@/components/LogBookPanel'
import { PerformancePanel, type PerfData } from '@/components/PerformancePanel'
import { CollapsibleSection } from '@/components/CollapsibleSection'
import { useWeightBalance } from '@/hooks/useWeightBalance'
import { isC182, getCGEnvelopeForAircraft } from '@/types/aircraft'

export default function Index() {
  const [pilotName, setPilotName] = useState('')
  const [flightDate, setFlightDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [routeFrom, setRouteFrom] = useState('')
  const [routeTo, setRouteTo] = useState('')

  const {
    selectedAircraft,
    selectAircraft,
    aircraftConfig,
    massItems,
    updateMassItem,
    fuelGallons,
    setFuelGallons,
    fuelData,
    reserveMinutes,
    setReserveMinutes,
    tripDistance,
    setTripDistance,
    tripFuelBurn,
    weightBalance,
    usefulLoad,
    remainingPayload,
    maxFuelGallons,
  } = useWeightBalance('ZS-DIT')

  const perfDataRef = useRef<PerfData>({
    altitude: 0, qnh: 1013, oat: 15,
    pressureAltitude: 0, densityAltitude: 0, isaDeviation: 0,
  })
  const handlePerfDataChange = useCallback((data: PerfData) => {
    perfDataRef.current = data
  }, [])

  const generateBriefingPdf = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a5' })
    const W = 148
    const H = doc.internal.pageSize.getHeight()

    const GREEN:  [number,number,number] = [26, 47, 36]
    const LIGHT:  [number,number,number] = [241, 245, 249]
    const SLATE:  [number,number,number] = [100, 116, 139]
    const DARK:   [number,number,number] = [15, 23, 42]
    const WHITE:  [number,number,number] = [255, 255, 255]

    // ── Header ──────────────────────────────────────────────────────
    doc.setFillColor(...GREEN)
    doc.rect(0, 0, W, 22, 'F')
    doc.setTextColor(...WHITE)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(`${selectedAircraft}  ·  Pilot Briefing`, W / 2, 10, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(`${aircraftConfig.model}  ·  ${aircraftConfig.engine.model}  ·  ${aircraftConfig.engine.hp} HP`, W / 2, 17, { align: 'center' })

    let y = 25

    const sectionTitle = (title: string) => {
      doc.setFillColor(...GREEN)
      doc.rect(8, y, W - 16, 6, 'F')
      doc.setTextColor(...WHITE)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.text(title, 11, y + 4.2)
      y += 9
    }

    const row = (label: string, value: string, shade = false) => {
      if (shade) {
        doc.setFillColor(...LIGHT)
        doc.rect(8, y - 4, W - 16, 7, 'F')
      }
      doc.setTextColor(...SLATE)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.text(label, 12, y)
      doc.setTextColor(...DARK)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text(value, W - 12, y, { align: 'right' })
      y += 7
    }

    // ── Flight Info ──────────────────────────────────────────────────
    sectionTitle('FLIGHT INFO')
    row('Date', flightDate || '--', false)
    row('Pilot', pilotName || '--', true)
    if (routeFrom || routeTo) {
      row('Route', [routeFrom, routeTo].filter(Boolean).join(' → '), false)
    }
    if (tripDistance > 0) {
      row('Trip Distance', `${tripDistance} nm`, !!(routeFrom || routeTo))
    }
    y += 3

    // ── Weight & Balance ─────────────────────────────────────────────
    sectionTitle('WEIGHT & BALANCE')
    row('Take-Off Weight / Max Gross', `${weightBalance.totalWeight.toFixed(0)} / ${aircraftConfig.maxGross} lbs`, false)

    // CG row with status badge
    doc.setFillColor(...LIGHT)
    doc.rect(8, y - 4, W - 16, 7, 'F')
    doc.setTextColor(...SLATE)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.text('CG', 12, y)
    doc.setTextColor(...DARK)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text(`${weightBalance.cg.toFixed(2)}"`, W - 52, y, { align: 'right' })
    const badgeColor: [number,number,number] = weightBalance.isWithinLimits ? [34, 197, 94] : [239, 68, 68]
    doc.setFillColor(...badgeColor)
    doc.roundedRect(W - 46, y - 3.5, 34, 5.5, 1.5, 1.5, 'F')
    doc.setTextColor(...WHITE)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6)
    doc.text(weightBalance.isWithinLimits ? 'IN LIMITS' : 'OUT OF LIMITS', W - 29, y + 0.5, { align: 'center' })
    y += 7

    const remaining = aircraftConfig.maxGross - weightBalance.totalWeight
    row('Remaining Payload', remaining >= 0 ? `+${remaining.toFixed(0)} lbs` : `${remaining.toFixed(0)} lbs`, false)
    y += 3

    // ── Fuel ─────────────────────────────────────────────────────────
    sectionTitle('FUEL')
    row('Loaded', `${fuelData.gallons.toFixed(1)} gal  (${fuelData.weight.toFixed(0)} lbs)`, false)
    const endH = Math.floor(fuelData.endurance / 60)
    const endM = fuelData.endurance % 60
    const ftH = Math.floor(fuelData.flightTime / 60)
    const ftM = fuelData.flightTime % 60
    row('Endurance (total)', `${endH}h${String(endM).padStart(2, '0')}`, true)
    row(`Flight Time (excl. ${fuelData.reserve} min reserve)`, `${ftH}h${String(ftM).padStart(2, '0')}`, false)
    if (tripDistance > 0) {
      const tripGal = tripFuelBurn / 6
      row('Est. Trip Fuel', `${tripGal.toFixed(1)} gal`, true)
    }
    y += 3

    // ── Key Speeds ───────────────────────────────────────────────────
    sectionTitle('KEY SPEEDS  (mph)')
    const s = aircraftConfig.speeds
    row('Rotate (Vr)',          `${s.rotate} mph`,      false)
    row('Best Angle (Vx)',      `${s.bestAngle} mph`,   true)
    row('Best Rate (Vy)',       `${s.bestRate} mph`,    false)
    row('Manoeuvring (Va)',     `${s.manoeuvring} mph`, true)
    row('Never Exceed (Vne)',   `${s.neverExceed} mph`, false)
    row('Stall Clean (Vs)',     `${s.stallClean} mph`,  true)
    row('Stall Flaps Full (Vs0)', `${s.stallFlaps40} mph`, false)

    // ── Footer ───────────────────────────────────────────────────────
    doc.setFillColor(...LIGHT)
    doc.rect(0, H - 12, W, 12, 'F')
    doc.setTextColor(...SLATE)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.text(
      `Generated ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}  ·  For planning purposes only. Always verify with official POH.`,
      W / 2, H - 5, { align: 'center' }
    )

    // ══════════════════════════════════════════════════════════════════
    // ── Page 2 : CG Envelope + Performance ───────────────────────────
    // ══════════════════════════════════════════════════════════════════
    doc.addPage()

    // Mini header
    doc.setFillColor(...GREEN)
    doc.rect(0, 0, W, 8, 'F')
    doc.setTextColor(...WHITE)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.text(`${selectedAircraft}  —  Pilot Briefing  ·  p.2`, W / 2, 5.5, { align: 'center' })

    y = 12

    // ── Section title helper (same closure, now draws on page 2) ─────
    sectionTitle('CG ENVELOPE')

    // ── Chart setup ──────────────────────────────────────────────────
    const cgEnv = getCGEnvelopeForAircraft(selectedAircraft)
    const mVals = cgEnv.map((p) => p.moment)
    const wVals = cgEnv.map((p) => p.weight)
    const mMin = Math.floor(Math.min(...mVals) - 5)
    const mMax = Math.ceil(Math.max(...mVals) + 5)
    const wMin = Math.floor(Math.min(...wVals) - 200)
    const wMax = Math.ceil(Math.max(...wVals) + 200)

    const chartH = 78
    const cy2 = y
    const pL = 17, pR = 5, pT = 4, pB = 10
    const iL = 8 + pL
    const iT2 = cy2 + pT
    const iW2 = W - 16 - pL - pR
    const iH2 = chartH - pT - pB

    const sm = (m: number) => iL + ((m - mMin) / (mMax - mMin)) * iW2
    const sw = (w: number) => iT2 + iH2 - ((w - wMin) / (wMax - wMin)) * iH2

    // Chart background + border (light)
    doc.setFillColor(250, 252, 250)
    doc.setDrawColor(180, 200, 190)
    doc.setLineWidth(0.4)
    doc.rect(8, cy2, W - 16, chartH, 'FD')

    // Weight grid lines (horizontal)
    const wStep = Math.max(Math.round((wMax - wMin) / 5 / 100) * 100, 100)
    for (let w = Math.ceil(wMin / wStep) * wStep; w <= wMax; w += wStep) {
      const gy = sw(w)
      if (gy < iT2 || gy > iT2 + iH2) continue
      doc.setDrawColor(200, 215, 205)
      doc.setLineWidth(0.2)
      doc.setLineDashPattern([2, 2], 0)
      doc.line(iL, gy, iL + iW2, gy)
      doc.setLineDashPattern([], 0)
      doc.setTextColor(...SLATE)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(5.5)
      doc.text(String(w), iL - 1, gy + 1, { align: 'right' })
    }

    // Moment grid lines (vertical)
    const mStep = Math.max(Math.round((mMax - mMin) / 5 / 10) * 10, 10)
    for (let m = Math.ceil(mMin / mStep) * mStep; m <= mMax; m += mStep) {
      const gx = sm(m)
      if (gx < iL || gx > iL + iW2) continue
      doc.setDrawColor(200, 215, 205)
      doc.setLineWidth(0.2)
      doc.setLineDashPattern([2, 2], 0)
      doc.line(gx, iT2, gx, iT2 + iH2)
      doc.setLineDashPattern([], 0)
      doc.setTextColor(...SLATE)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(5.5)
      doc.text(String(m), gx, iT2 + iH2 + 4.5, { align: 'center' })
    }

    // Max gross line (dashed red)
    const mgY = sw(aircraftConfig.maxGross)
    if (mgY >= iT2 && mgY <= iT2 + iH2) {
      doc.setLineWidth(0.8)
      doc.setDrawColor(220, 50, 50)
      doc.setLineDashPattern([3, 2], 0)
      doc.line(iL, mgY, iL + iW2, mgY)
      doc.setLineDashPattern([], 0)
      doc.setTextColor(200, 40, 40)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(5.5)
      doc.text(`Max ${aircraftConfig.maxGross}`, iL + iW2 - 1, mgY - 1.5, { align: 'right' })
    }

    // Envelope polygon (light green fill + darker green border)
    const relLines = cgEnv.slice(1).map((pt, idx) => [
      sm(pt.moment) - sm(cgEnv[idx].moment),
      sw(pt.weight) - sw(cgEnv[idx].weight),
    ])
    doc.setFillColor(170, 220, 185)
    doc.setDrawColor(34, 120, 65)
    doc.setLineWidth(0.9)
    doc.lines(relLines, sm(cgEnv[0].moment), sw(cgEnv[0].weight), [1, 1], 'FD', true)

    // T/O → LDG dashed line
    if (weightBalance.landingWeight > 0 && weightBalance.landingWeight !== weightBalance.totalWeight) {
      doc.setLineWidth(0.4)
      doc.setDrawColor(120, 120, 120)
      doc.setLineDashPattern([2, 2], 0)
      doc.line(sm(weightBalance.totalMoment), sw(weightBalance.totalWeight),
               sm(weightBalance.landingMoment), sw(weightBalance.landingWeight))
      doc.setLineDashPattern([], 0)
    }

    // ZFW point (hollow blue)
    if (weightBalance.zfwWeight > 0) {
      doc.setDrawColor(37, 99, 235)
      doc.setLineWidth(0.8)
      doc.circle(sm(weightBalance.zfwMoment), sw(weightBalance.zfwWeight), 2, 'D')
      doc.setTextColor(37, 99, 235)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(5.5)
      doc.text('ZFW', sm(weightBalance.zfwMoment) + 3, sw(weightBalance.zfwWeight) + 1)
    }

    // T/O point (filled amber)
    if (weightBalance.totalWeight > 0) {
      doc.setFillColor(217, 119, 6)
      doc.setDrawColor(217, 119, 6)
      doc.circle(sm(weightBalance.totalMoment), sw(weightBalance.totalWeight), 2.5, 'F')
      doc.setTextColor(180, 90, 0)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(5.5)
      doc.text('T/O', sm(weightBalance.totalMoment) + 3.5, sw(weightBalance.totalWeight) + 1.5)
    }

    // LDG point (hollow teal)
    if (weightBalance.landingWeight > 0 && weightBalance.landingWeight !== weightBalance.totalWeight) {
      doc.setDrawColor(13, 148, 136)
      doc.setLineWidth(0.8)
      doc.circle(sm(weightBalance.landingMoment), sw(weightBalance.landingWeight), 2, 'D')
      doc.setTextColor(13, 148, 136)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(5.5)
      doc.text('LDG', sm(weightBalance.landingMoment) + 3, sw(weightBalance.landingWeight) + 1.5)
    }

    // Axis label (X)
    doc.setTextColor(...SLATE)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.text('Moment (lb·in / 1000)', 8 + (W - 16) / 2, cy2 + chartH + 5, { align: 'center' })

    // Legend
    y = cy2 + chartH + 9
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...SLATE)

    doc.setDrawColor(37, 99, 235)
    doc.setLineWidth(0.8)
    doc.circle(16, y, 2, 'D')
    doc.text('ZFW', 20, y + 1)

    doc.setFillColor(217, 119, 6)
    doc.circle(40, y, 2.5, 'F')
    doc.text('T/O', 45, y + 1)

    if (weightBalance.landingWeight > 0 && weightBalance.landingWeight !== weightBalance.totalWeight) {
      doc.setDrawColor(13, 148, 136)
      doc.circle(65, y, 2, 'D')
      doc.text('LDG', 69, y + 1)
    }
    y += 10

    // ── Performance ──────────────────────────────────────────────────
    const perf = perfDataRef.current
    sectionTitle('PERFORMANCE  (Density Altitude)')
    row('Airport Altitude', `${perf.altitude.toLocaleString()} ft`, false)
    row('QNH', `${perf.qnh} hPa`, true)
    row('OAT', `${perf.oat >= 0 ? '+' : ''}${perf.oat}°C`, false)
    row('Pressure Altitude', `${perf.pressureAltitude.toLocaleString()} ft`, true)
    row('Density Altitude', `${perf.densityAltitude.toLocaleString()} ft`, false)
    row('ISA Deviation', `${perf.isaDeviation > 0 ? '+' : ''}${perf.isaDeviation}°C`, true)

    // Footer page 2
    doc.setFillColor(...LIGHT)
    doc.rect(0, H - 12, W, 12, 'F')
    doc.setTextColor(...SLATE)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.text(
      `Generated ${new Date().toLocaleDateString()} · For planning purposes only. Always verify with official POH.`,
      W / 2, H - 5, { align: 'center' }
    )

    const dateStr = (flightDate || 'unknown').replace(/-/g, '')
    doc.save(`briefing-${selectedAircraft}-${dateStr}.pdf`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        selectedAircraft={selectedAircraft}
        onAircraftChange={selectAircraft}
        aircraftConfig={aircraftConfig}
        pilotName={pilotName}
        onPilotNameChange={setPilotName}
        flightDate={flightDate}
        onFlightDateChange={setFlightDate}
        onPrint={generateBriefingPdf}
      />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Desktop: 3-column layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {/* Column 1: Loading */}
          <div className="space-y-6">
            <div className="aviation-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Weight className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Payload</h3>
              </div>
              <div className="space-y-4">
                {/* Front Row */}
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    Front Row (Arm {massItems.find(i => i.id === 'pilot')?.arm || 36}")
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {massItems.filter(i => ['pilot', 'front_pax'].includes(i.id)).map((item) => (
                      <MassInputCard key={item.id} item={item} onChange={updateMassItem} />
                    ))}
                  </div>
                </div>
                {/* Second Row (Rear Row for C182) */}
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    {isC182(selectedAircraft) ? 'Rear Row' : 'Second Row'} (Arm {massItems.find(i => i.id === 'row2_left')?.arm || 69}")
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {massItems.filter(i => ['row2_left', 'row2_right'].includes(i.id)).map((item) => (
                      <MassInputCard key={item.id} item={item} onChange={updateMassItem} />
                    ))}
                  </div>
                </div>
                {/* Third Row - C206 only */}
                {!isC182(selectedAircraft) && (
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      Third Row (Arm {massItems.find(i => i.id === 'row3_left')?.arm || 100}")
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {massItems.filter(i => ['row3_left', 'row3_right'].includes(i.id)).map((item) => (
                        <MassInputCard key={item.id} item={item} onChange={updateMassItem} />
                      ))}
                    </div>
                  </div>
                )}
                {/* Baggage */}
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Baggage</div>
                  <div className="space-y-2">
                    {massItems.filter(i => i.id.startsWith('baggage') || i.id === 'cargo_pod').map((item) => (
                      <MassInputCard key={item.id} item={item} onChange={updateMassItem} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <FuelPanel
              fuelGallons={fuelGallons}
              setFuelGallons={setFuelGallons}
              fuelData={fuelData}
              reserveMinutes={reserveMinutes}
              setReserveMinutes={setReserveMinutes}
              maxFuelGallons={maxFuelGallons}
              fuelArm={aircraftConfig.fuelArm}
            />

            <CGEnvelope
              weightBalance={weightBalance}
              maxGross={aircraftConfig.maxGross}
              envelope={getCGEnvelopeForAircraft(selectedAircraft)}
            />
          </div>

          {/* Column 2: Trip & Performance */}
          <div className="space-y-6">
            <DestinationPanel
              tripDistance={tripDistance}
              setTripDistance={setTripDistance}
              tripFuelBurn={tripFuelBurn}
              fuelData={fuelData}
              fuelBurnRate={aircraftConfig.fuelBurn}
              routeFrom={routeFrom}
              setRouteFrom={setRouteFrom}
              routeTo={routeTo}
              setRouteTo={setRouteTo}
            />

            <MassSummaryCard
              weightBalance={weightBalance}
              aircraftConfig={aircraftConfig}
              usefulLoad={usefulLoad}
              remainingPayload={remainingPayload}
            />

            <SpeedsPanel speeds={aircraftConfig.speeds} />

            <PerformancePanel onDataChange={handlePerfDataChange} />
          </div>

          {/* Column 3: Checklists, Limits & LogBook */}
          <div className="space-y-6">
            <ChecklistPanel selectedAircraft={selectedAircraft} />
            <LimitationsPanel
              limitations={aircraftConfig.limitations}
              engine={aircraftConfig.engine}
            />
            <LogBookPanel
              initialFuelGallons={fuelGallons}
              fuelConsumptionGPH={aircraftConfig.fuelBurn}
              flightDate={flightDate}
              pilotName={pilotName}
              aircraftReg={selectedAircraft}
              routeFrom={routeFrom}
              routeTo={routeTo}
            />
          </div>
        </div>

        {/* Mobile/Tablet: Collapsible sections */}
        <div className="lg:hidden space-y-3">
          <CollapsibleSection
            title="Payload"
            icon={<Weight className="h-5 w-5" />}
            defaultOpen={false}
          >
            <div className="space-y-4">
              {/* Front Row */}
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Front Row (Arm {massItems.find(i => i.id === 'pilot')?.arm || 36}")
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {massItems.filter(i => ['pilot', 'front_pax'].includes(i.id)).map((item) => (
                    <MassInputCard key={item.id} item={item} onChange={updateMassItem} />
                  ))}
                </div>
              </div>
              {/* Second Row (Rear Row for C182) */}
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  {isC182(selectedAircraft) ? 'Rear Row' : 'Second Row'} (Arm {massItems.find(i => i.id === 'row2_left')?.arm || 69}")
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {massItems.filter(i => ['row2_left', 'row2_right'].includes(i.id)).map((item) => (
                    <MassInputCard key={item.id} item={item} onChange={updateMassItem} />
                  ))}
                </div>
              </div>
              {/* Third Row - C206 only */}
              {!isC182(selectedAircraft) && (
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    Third Row (Arm {massItems.find(i => i.id === 'row3_left')?.arm || 100}")
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {massItems.filter(i => ['row3_left', 'row3_right'].includes(i.id)).map((item) => (
                      <MassInputCard key={item.id} item={item} onChange={updateMassItem} />
                    ))}
                  </div>
                </div>
              )}
              {/* Baggage */}
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Baggage</div>
                <div className="space-y-2">
                  {massItems.filter(i => i.id.startsWith('baggage') || i.id === 'cargo_pod').map((item) => (
                    <MassInputCard key={item.id} item={item} onChange={updateMassItem} />
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Fuel"
            icon={<Fuel className="h-5 w-5" />}
            defaultOpen={false}
          >
            <FuelPanel
              fuelGallons={fuelGallons}
              setFuelGallons={setFuelGallons}
              fuelData={fuelData}
              reserveMinutes={reserveMinutes}
              setReserveMinutes={setReserveMinutes}
              maxFuelGallons={maxFuelGallons}
              fuelArm={aircraftConfig.fuelArm}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="CG Envelope"
            icon={<Target className="h-5 w-5" />}
            defaultOpen={false}
          >
            <CGEnvelope
              weightBalance={weightBalance}
              maxGross={aircraftConfig.maxGross}
              envelope={getCGEnvelopeForAircraft(selectedAircraft)}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Trip Planning"
            icon={<MapPin className="h-5 w-5" />}
            defaultOpen={false}
          >
            <DestinationPanel
              tripDistance={tripDistance}
              setTripDistance={setTripDistance}
              tripFuelBurn={tripFuelBurn}
              fuelData={fuelData}
              fuelBurnRate={aircraftConfig.fuelBurn}
              routeFrom={routeFrom}
              setRouteFrom={setRouteFrom}
              routeTo={routeTo}
              setRouteTo={setRouteTo}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Weight Summary"
            icon={<Scale className="h-5 w-5" />}
            defaultOpen={false}
          >
            <MassSummaryCard
              weightBalance={weightBalance}
              aircraftConfig={aircraftConfig}
              usefulLoad={usefulLoad}
              remainingPayload={remainingPayload}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Checklists"
            icon={<ClipboardList className="h-5 w-5" />}
            defaultOpen={false}
          >
            <ChecklistPanel selectedAircraft={selectedAircraft} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Speeds"
            icon={<Gauge className="h-5 w-5" />}
            defaultOpen={false}
          >
            <SpeedsPanel speeds={aircraftConfig.speeds} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Performance"
            icon={<Activity className="h-5 w-5" />}
            defaultOpen={false}
          >
            <PerformancePanel onDataChange={handlePerfDataChange} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Limitations"
            icon={<AlertTriangle className="h-5 w-5" />}
            defaultOpen={false}
          >
            <LimitationsPanel
              limitations={aircraftConfig.limitations}
              engine={aircraftConfig.engine}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Flight Log"
            icon={<BookOpen className="h-5 w-5" />}
            defaultOpen={false}
          >
            <LogBookPanel
              initialFuelGallons={fuelGallons}
              fuelConsumptionGPH={aircraftConfig.fuelBurn}
              flightDate={flightDate}
              pilotName={pilotName}
              aircraftReg={selectedAircraft}
              routeFrom={routeFrom}
              routeTo={routeTo}
            />
          </CollapsibleSection>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-2 sm:py-3 mt-6 sm:mt-8 no-print">
        <div className="container mx-auto px-3 sm:px-4 text-center text-[10px] sm:text-xs text-muted-foreground">
          <p>Flight Analyzer - Africa Bushpilot Adventures</p>
          <p className="mt-1">
            For flight planning purposes only. Always verify with official POH.
          </p>
          <p className="mt-1">&copy; 2026 Marc Vincent</p>
        </div>
      </footer>
    </div>
  )
}
