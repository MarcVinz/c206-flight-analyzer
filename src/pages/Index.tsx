import { useState } from 'react'
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
import { PerformancePanel } from '@/components/PerformancePanel'
import { CollapsibleSection } from '@/components/CollapsibleSection'
import { useWeightBalance } from '@/hooks/useWeightBalance'
import { isC182, getCGEnvelopeForAircraft } from '@/types/aircraft'

export default function Index() {
  const [pilotName, setPilotName] = useState('')
  const [flightDate, setFlightDate] = useState(
    new Date().toISOString().split('T')[0]
  )

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
            />

            <MassSummaryCard
              weightBalance={weightBalance}
              aircraftConfig={aircraftConfig}
              usefulLoad={usefulLoad}
              remainingPayload={remainingPayload}
            />

            <SpeedsPanel speeds={aircraftConfig.speeds} />

            <PerformancePanel />
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
            />
          </div>
        </div>

        {/* Mobile/Tablet: Collapsible sections */}
        <div className="lg:hidden space-y-3">
          <CollapsibleSection
            title="Payload"
            icon={<Weight className="h-5 w-5" />}
            defaultOpen={true}
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
            defaultOpen={true}
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
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Weight Summary"
            icon={<Scale className="h-5 w-5" />}
            defaultOpen={true}
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
            <PerformancePanel />
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
            />
          </CollapsibleSection>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 sm:py-4 mt-6 sm:mt-8 no-print">
        <div className="container mx-auto px-3 sm:px-4 text-center text-sm text-muted-foreground">
          <p>Flight Analyzer - Africa Bushpilot Adventures</p>
          <p className="text-xs mt-1">
            For flight planning purposes only. Always verify with official POH.
          </p>
          <p className="text-xs mt-2">&copy; 2026 Marc Vincent</p>
        </div>
      </footer>
    </div>
  )
}
