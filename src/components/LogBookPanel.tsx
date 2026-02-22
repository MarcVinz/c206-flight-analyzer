import { useState, useMemo, useEffect } from 'react'
import { BookOpen, Mail, Clock, Plane, Navigation, Gauge, Timer, PlaneLanding, Fuel, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { jsPDF } from 'jspdf'

interface LogBookPanelProps {
  initialFuelGallons: number
  fuelConsumptionGPH: number
  flightDate: string
  pilotName: string
  aircraftReg: string
  routeFrom?: string
  routeTo?: string
}

export function LogBookPanel({
  initialFuelGallons,
  fuelConsumptionGPH,
  flightDate,
  pilotName,
  aircraftReg,
  routeFrom = '',
  routeTo = '',
}: LogBookPanelProps) {
  // Flight type
  const [flightType, setFlightType] = useState<'private' | 'instruction'>('private')
  const [instructorName, setInstructorName] = useState('')

  // Airports - initialized from Trip Planning
  const [departure, setDeparture] = useState(routeFrom)
  const [destination, setDestination] = useState(routeTo)

  // Sync with Trip Planning selections
  useEffect(() => {
    if (routeFrom) setDeparture(routeFrom)
  }, [routeFrom])

  useEffect(() => {
    if (routeTo) setDestination(routeTo)
  }, [routeTo])

  // Hobbs meter (hourmeter)
  const [hobbsStart, setHobbsStart] = useState<number | ''>('')
  const [hobbsEnd, setHobbsEnd] = useState<number | ''>('')

  // Block times (engine start/stop)
  const [blockOut, setBlockOut] = useState('')
  const [blockIn, setBlockIn] = useState('')

  // Flight time (manual override)
  const [flightTime, setFlightTime] = useState('')

  // Landings
  const [landings, setLandings] = useState<number | ''>(1)

  // Fuel
  const [fuelRemaining, setFuelRemaining] = useState<number | ''>('')

  // Calculate block time from times
  const calculatedBlockTime = useMemo(() => {
    if (!blockOut || !blockIn) return null

    const [outHours, outMinutes] = blockOut.split(':').map(Number)
    const [inHours, inMinutes] = blockIn.split(':').map(Number)

    if (isNaN(outHours) || isNaN(outMinutes) || isNaN(inHours) || isNaN(inMinutes)) {
      return null
    }

    let outTotal = outHours * 60 + outMinutes
    let inTotal = inHours * 60 + inMinutes

    // Handle midnight crossover
    if (inTotal < outTotal) {
      inTotal += 24 * 60
    }

    return inTotal - outTotal
  }, [blockOut, blockIn])

  // Calculate Hobbs time
  const hobbsTime = useMemo(() => {
    if (hobbsStart === '' || hobbsEnd === '') return null
    const diff = Number(hobbsEnd) - Number(hobbsStart)
    return diff > 0 ? diff : null
  }, [hobbsStart, hobbsEnd])

  // Fuel consumption
  const fuelUsed = useMemo(() => {
    if (fuelRemaining === '') return null
    return initialFuelGallons - Number(fuelRemaining)
  }, [initialFuelGallons, fuelRemaining])

  // Get current time
  const getCurrentTime = () => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  }

  // Format time in hours and minutes
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}h${String(m).padStart(2, '0')}`
  }

  // Save PDF
  const saveFlightPdf = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()

    const blockTimeStr = calculatedBlockTime ? formatTime(calculatedBlockTime) : flightTime || '--'
    const hobbsTimeStr = hobbsTime ? hobbsTime.toFixed(1) + ' h' : '--'

    // ── Header ───────────────────────────────────────────────────────
    doc.setFillColor(26, 47, 36)   // dark green (theme-color)
    doc.rect(0, 0, pageW, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text(`${aircraftReg}  ·  Flight Log`, pageW / 2, 12, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Africa Bushpilot Adventures', pageW / 2, 21, { align: 'center' })

    // ── Date / Pilot / Type band ──────────────────────────────────────
    let y = 38
    doc.setFillColor(241, 245, 249)
    doc.roundedRect(14, y - 6, pageW - 28, 14, 3, 3, 'F')
    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Date :', 20, y + 2)
    doc.setFont('helvetica', 'normal')
    doc.text(flightDate || '--', 40, y + 2)
    doc.setFont('helvetica', 'bold')
    doc.text('Pilot :', pageW / 2 - 10, y + 2)
    doc.setFont('helvetica', 'normal')
    doc.text(pilotName || '--', pageW / 2 + 10, y + 2)

    const typeLabel = flightType === 'instruction' ? 'Instruction' : 'Private'
    const typeBg: [number, number, number] = flightType === 'instruction' ? [59, 130, 246] : [34, 197, 94]
    doc.setFillColor(...typeBg)
    doc.roundedRect(pageW - 46, y - 4, 32, 10, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text(typeLabel, pageW - 30, y + 2, { align: 'center' })

    if (flightType === 'instruction' && instructorName) {
      y += 16
      doc.setTextColor(30, 30, 30)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('Instructor :', 20, y)
      doc.setFont('helvetica', 'normal')
      doc.text(instructorName, 55, y)
    }

    // ── Helpers ───────────────────────────────────────────────────────
    const drawSection = (title: string, yStart: number) => {
      doc.setFillColor(26, 47, 36)
      doc.rect(14, yStart, pageW - 28, 7, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text(title, 18, yStart + 5)
      return yStart + 13
    }

    const drawRow = (label: string, value: string, yPos: number, shade = false) => {
      if (shade) {
        doc.setFillColor(248, 250, 252)
        doc.rect(14, yPos - 5, pageW - 28, 9, 'F')
      }
      doc.setTextColor(100, 116, 139)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(label, 20, yPos)
      doc.setTextColor(15, 23, 42)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(value, pageW - 20, yPos, { align: 'right' })
      return yPos + 11
    }

    // ── Route ─────────────────────────────────────────────────────────
    y += 16
    y = drawSection('ROUTE', y)
    y = drawRow('Departure', departure || '--', y, false)
    y = drawRow('Destination', destination || '--', y, true)

    // ── Hobbs ─────────────────────────────────────────────────────────
    y += 4
    y = drawSection('HOBBS METER', y)
    y = drawRow('Start', hobbsStart !== '' ? String(hobbsStart) : '--', y, false)
    y = drawRow('End', hobbsEnd !== '' ? String(hobbsEnd) : '--', y, true)
    y = drawRow('Hobbs Time', hobbsTimeStr, y, false)

    // ── Block / Flight time ───────────────────────────────────────────
    y += 4
    y = drawSection('TIMES', y)
    y = drawRow('Block Out', blockOut || '--', y, false)
    y = drawRow('Block In', blockIn || '--', y, true)
    y = drawRow('Block Time', blockTimeStr, y, false)
    y = drawRow('Flight Time', flightTime || blockTimeStr, y, true)
    y = drawRow('Landings', String(landings !== '' ? landings : 0), y, false)

    // ── Fuel ──────────────────────────────────────────────────────────
    y += 4
    y = drawSection('FUEL', y)
    y = drawRow('Initial', `${initialFuelGallons.toFixed(1)} gal`, y, false)
    y = drawRow('Remaining', fuelRemaining !== '' ? `${Number(fuelRemaining).toFixed(1)} gal` : '--', y, true)
    if (fuelUsed !== null) {
      const burnStr = hobbsTime && hobbsTime > 0
        ? `${fuelUsed.toFixed(1)} gal  (${(fuelUsed / hobbsTime).toFixed(1)} gal/h)`
        : `${fuelUsed.toFixed(1)} gal`
      y = drawRow('Used', burnStr, y, false)
    }

    // ── Footer ────────────────────────────────────────────────────────
    doc.setFillColor(241, 245, 249)
    doc.rect(0, pageH - 14, pageW, 14, 'F')
    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.text(
      `Generated ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}  ·  C206 Flight Analyzer`,
      pageW / 2, pageH - 5, { align: 'center' }
    )

    const dateStr = (flightDate || 'unknown').replace(/\//g, '')
    doc.save(`flight-log-${aircraftReg}-${dateStr}.pdf`)
  }

  // Send email
  const sendLogbookEmail = () => {
    const blockTimeStr = calculatedBlockTime ? formatTime(calculatedBlockTime) : flightTime || 'N/A'
    const hobbsTimeStr = hobbsTime ? hobbsTime.toFixed(1) : 'N/A'

    const subject = `Flight Log ${aircraftReg} - ${flightDate}`
    const body = `
FLIGHT LOG - ${aircraftReg}
================================

Date: ${flightDate}
Pilot: ${pilotName || 'N/A'}
Flight Type: ${flightType === 'private' ? 'Private' : 'Instruction'}
${flightType === 'instruction' ? `Instructor: ${instructorName || 'N/A'}` : ''}

ROUTE
-----
Departure: ${departure || 'N/A'}
Destination: ${destination || 'N/A'}

TIMES
-----
Block Out: ${blockOut || 'N/A'}
Block In: ${blockIn || 'N/A'}
Block Time: ${blockTimeStr}

Hobbs Start: ${hobbsStart || 'N/A'}
Hobbs End: ${hobbsEnd || 'N/A'}
Hobbs Time: ${hobbsTimeStr}

Flight Time: ${flightTime || blockTimeStr}

LANDINGS
--------
${landings || 0}

FUEL
----
Initial: ${initialFuelGallons} gal
Remaining: ${fuelRemaining || 'N/A'} gal
Used: ${fuelUsed !== null ? fuelUsed.toFixed(1) : 'N/A'} gal

================================
Generated by C206 Flight Analyzer
    `.trim()

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoLink
  }

  return (
    <div className="aviation-card p-5">
      <div className="section-header flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Flight Log</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={saveFlightPdf}
            className="h-8 w-8 p-0"
            title="Save PDF"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={sendLogbookEmail}
            className="h-8 w-8 p-0"
            title="Send by email"
          >
            <Mail className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Flight Type */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
            <Plane className="h-3.5 w-3.5" />
            Flight Type
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={flightType === 'private' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFlightType('private')}
              className="w-full"
            >
              Private
            </Button>
            <Button
              variant={flightType === 'instruction' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFlightType('instruction')}
              className="w-full"
            >
              Instruction
            </Button>
          </div>
          {flightType === 'instruction' && (
            <Input
              type="text"
              placeholder="Instructor name"
              value={instructorName}
              onChange={(e) => setInstructorName(e.target.value)}
              className="mt-2"
            />
          )}
        </div>

        <div className="section-divider" />

        {/* Airports */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5" />
            Route
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="text"
                placeholder="From (ICAO)"
                value={departure}
                onChange={(e) => setDeparture(e.target.value.toUpperCase())}
                className="font-mono text-center"
                maxLength={4}
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="To (ICAO)"
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                className="font-mono text-center"
                maxLength={4}
              />
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* Hobbs Meter */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5" />
            Hobbs
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Start</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="0.0"
                value={hobbsStart}
                onChange={(e) => setHobbsStart(e.target.value ? parseFloat(e.target.value) : '')}
                className="font-mono text-right"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">End</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="0.0"
                value={hobbsEnd}
                onChange={(e) => setHobbsEnd(e.target.value ? parseFloat(e.target.value) : '')}
                className="font-mono text-right"
              />
            </div>
          </div>
          {hobbsTime !== null && (
            <div className="mt-2 text-center">
              <span className="text-sm text-muted-foreground">Hobbs Time: </span>
              <span className="font-mono font-semibold text-primary">{hobbsTime.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="section-divider" />

        {/* Block Times */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Block Time
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Block Out</Label>
              <div className="flex gap-1">
                <Input
                  type="time"
                  value={blockOut}
                  onChange={(e) => setBlockOut(e.target.value)}
                  className="font-mono flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBlockOut(getCurrentTime())}
                  className="px-2"
                  title="Current time"
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Block In</Label>
              <div className="flex gap-1">
                <Input
                  type="time"
                  value={blockIn}
                  onChange={(e) => setBlockIn(e.target.value)}
                  className="font-mono flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBlockIn(getCurrentTime())}
                  className="px-2"
                  title="Current time"
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {calculatedBlockTime !== null && (
            <div className="mt-2 text-center">
              <span className="text-sm text-muted-foreground">Block Time: </span>
              <span className="font-mono font-semibold text-primary">{formatTime(calculatedBlockTime)}</span>
            </div>
          )}
        </div>

        <div className="section-divider" />

        {/* Flight Time Override */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5" />
            Flight Time (manual)
          </Label>
          <Input
            type="text"
            placeholder="e.g. 1h30"
            value={flightTime}
            onChange={(e) => setFlightTime(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="section-divider" />

        {/* Landings */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
            <PlaneLanding className="h-3.5 w-3.5" />
            Landings
          </Label>
          <Input
            type="number"
            min="0"
            value={landings}
            onChange={(e) => setLandings(e.target.value ? parseInt(e.target.value) : '')}
            className="font-mono text-center w-24"
          />
        </div>

        <div className="section-divider" />

        {/* Fuel */}
        <div>
          <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
            <Fuel className="h-3.5 w-3.5" />
            Fuel
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Initial (gal)</Label>
              <Input
                type="text"
                value={initialFuelGallons}
                disabled
                className="font-mono text-right bg-muted"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Remaining (gal)</Label>
              <Input
                type="number"
                min="0"
                max={initialFuelGallons}
                placeholder="0"
                value={fuelRemaining}
                onChange={(e) => setFuelRemaining(e.target.value ? parseFloat(e.target.value) : '')}
                className="font-mono text-right"
              />
            </div>
          </div>
          {fuelUsed !== null && fuelUsed > 0 && (
            <div className="mt-2 text-center">
              <span className="text-sm text-muted-foreground">Used: </span>
              <span className="font-mono font-semibold text-aviation-amber">{fuelUsed.toFixed(1)} gal</span>
              {hobbsTime && hobbsTime > 0 && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({(fuelUsed / hobbsTime).toFixed(1)} gal/h)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile buttons */}
      <div className="lg:hidden mt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={saveFlightPdf} className="h-8 w-8 p-0">
          <Save className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={sendLogbookEmail} className="h-8 w-8 p-0">
          <Mail className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
