// Aircraft configuration types

export interface MassItem {
  id: string
  label: string
  mass: number      // lbs
  arm: number       // inches
  editable: boolean
  min?: number
  max?: number
  unit?: string
}

export interface WeightBalance {
  totalWeight: number           // lbs
  totalMoment: number           // lb-in / 1000
  cg: number                    // inches (moment / weight)
  isWithinLimits: boolean
  zfwWeight: number             // Zero Fuel Weight
  zfwMoment: number
  zfwCg: number
  landingWeight: number         // After fuel burn
  landingMoment: number
  landingCg: number
}

export interface FuelData {
  gallons: number
  weight: number               // lbs (gallons * 6)
  moment: number               // lb-in / 1000
  consumption: number          // gal/h
  reserve: number              // minutes
  flightTime: number           // minutes available
  endurance: number            // total minutes
}

export interface AircraftConfig {
  registration: string
  model: string
  variant: string              // U206E, P206B, etc.
  year: number
  emptyWeight: number          // lbs
  emptyArm: number             // inches
  emptyMoment: number          // lb-in / 1000
  maxGross: number             // lbs
  fuelCapacity: number         // gallons usable
  fuelArm: number              // inches
  fuelBurn: number             // gal/h
  engine: {
    model: string
    hp: number
    maxRPM: number
    continuousRPM: number
  }
  speeds: SpeedData
  limitations: LimitationData
}

export interface SpeedData {
  rotate: number               // mph
  bestAngle: number            // Vx - mph
  bestRate: number             // Vy - mph
  cruiseClimb: number          // mph
  manoeuvring: number          // Va - mph
  maxStructural: number        // Vno - mph
  neverExceed: number          // Vne - mph
  bestGlide: number            // mph
  flaps10: number              // Max speed flaps 10 - mph
  flaps20Full: number          // Max speed flaps 20-Full - mph
  approachFull: number         // mph
  overFence: number            // mph
  stallClean: number           // Vs - mph (0° bank)
  stallFlaps20: number         // Vs0 - mph
  stallFlaps40: number         // mph
}

export interface LimitationData {
  cht: { min: number; max: number }
  egt: { max: number }
  oilTemp: { min: number; max: number }
  oilPressure: { min: number; normal: { min: number; max: number }; max: number }
  rpm: { normalMin: number; normalMax: number; cautionMax?: number; max: number }
  manifoldPressure: { normalMin: number; normalMax: number }
  loadFactor: { positive: number; negative: number; flapsDown: number }
}

export interface CGEnvelopePoint {
  moment: number   // lb-in / 1000
  weight: number   // lbs
}

// Mass item configurations
export interface MassItemConfig {
  id: string
  label: string
  arm: number
  min: number
  max: number
  defaultValue: number
}

// Cessna 206 mass items (6 seats + cargo)
export const MASS_ITEM_CONFIGS_C206: MassItemConfig[] = [
  // Front row (arm 36")
  { id: 'pilot', label: 'Pilot (Front Left)', arm: 36, min: 0, max: 200, defaultValue: 0 },
  { id: 'front_pax', label: 'Front Passenger (Right)', arm: 36, min: 0, max: 200, defaultValue: 0 },
  // Second row (arm 69")
  { id: 'row2_left', label: '2nd Row Left', arm: 69, min: 0, max: 200, defaultValue: 0 },
  { id: 'row2_right', label: '2nd Row Right', arm: 69, min: 0, max: 200, defaultValue: 0 },
  // Rear row (arm 100")
  { id: 'row3_left', label: '3rd Row Left', arm: 100, min: 0, max: 200, defaultValue: 0 },
  { id: 'row3_right', label: '3rd Row Right', arm: 100, min: 0, max: 200, defaultValue: 0 },
  // Baggage
  { id: 'baggage', label: 'Baggage Area', arm: 124, min: 0, max: 150, defaultValue: 0 },
  { id: 'cargo_pod', label: 'Cargo Pod (Center)', arm: 50, min: 0, max: 300, defaultValue: 0 },
]

// Cessna 182 ZS-FJF/ZS-IAE mass items (4 seats)
export const MASS_ITEM_CONFIGS_C182_FJF: MassItemConfig[] = [
  // Front row (arm 35.8")
  { id: 'pilot', label: 'Pilot (Front Left)', arm: 35.8, min: 0, max: 200, defaultValue: 0 },
  { id: 'front_pax', label: 'Front Passenger (Right)', arm: 35.8, min: 0, max: 200, defaultValue: 0 },
  // Rear row (arm 70.8")
  { id: 'row2_left', label: 'Rear Left', arm: 70.8, min: 0, max: 200, defaultValue: 0 },
  { id: 'row2_right', label: 'Rear Right', arm: 70.8, min: 0, max: 200, defaultValue: 0 },
  // Baggage
  { id: 'baggage', label: 'Baggage A', arm: 97, min: 0, max: 120, defaultValue: 0 },
]

// Cessna 182 ZS-PWC mass items (4 seats + 2 baggage areas)
export const MASS_ITEM_CONFIGS_C182_PWC: MassItemConfig[] = [
  // Front row (arm 37")
  { id: 'pilot', label: 'Pilot (Front Left)', arm: 37, min: 0, max: 200, defaultValue: 0 },
  { id: 'front_pax', label: 'Front Passenger (Right)', arm: 37, min: 0, max: 200, defaultValue: 0 },
  // Rear row (arm 74")
  { id: 'row2_left', label: 'Rear Left', arm: 74, min: 0, max: 200, defaultValue: 0 },
  { id: 'row2_right', label: 'Rear Right', arm: 74, min: 0, max: 200, defaultValue: 0 },
  // Baggage
  { id: 'baggage', label: 'Baggage A', arm: 97, min: 0, max: 120, defaultValue: 0 },
  { id: 'baggage_b', label: 'Baggage B', arm: 115, min: 0, max: 80, defaultValue: 0 },
]

// Legacy alias for backwards compatibility
export const MASS_ITEM_CONFIGS = MASS_ITEM_CONFIGS_C206

// Function to get mass item configs for an aircraft
export function getMassItemConfigsForAircraft(registration: string): MassItemConfig[] {
  switch (registration) {
    case 'ZS-FJF':
    case 'ZS-IAE':
      return MASS_ITEM_CONFIGS_C182_FJF
    case 'ZS-PWC':
      return MASS_ITEM_CONFIGS_C182_PWC
    default:
      return MASS_ITEM_CONFIGS_C206
  }
}

// Function to check if aircraft is C182
export function isC182(registration: string): boolean {
  return ['ZS-FJF', 'ZS-IAE', 'ZS-PWC'].includes(registration)
}

// Fuel constants
export const FUEL_WEIGHT_PER_GALLON = 6  // lbs per gallon (Avgas 100LL)
export const FUEL_ARM = 48               // inches (default for C206)
export const MAX_FUEL_GALLONS = 80       // usable (default for C206)
export const TOTAL_FUEL_GALLONS = 84     // total capacity

// CG Envelope - from POH (Weight vs Moment/1000)
// Cessna 206 envelope (default)
export const CG_ENVELOPE_C206: CGEnvelopePoint[] = [
  { moment: 95, weight: 2400 },    // Forward limit - light
  { moment: 110, weight: 2700 },   // Forward limit - mid
  { moment: 135, weight: 3200 },   // Forward limit - heavy
  { moment: 140, weight: 3600 },   // Forward limit - max
  { moment: 170, weight: 3600 },   // Aft limit - max
  { moment: 170, weight: 3200 },   // Aft limit - heavy
  { moment: 136, weight: 2700 },   // Aft limit - mid
  { moment: 109, weight: 2400 },   // Aft limit - light
  { moment: 95, weight: 2400 },    // Close polygon
]

// ZS-DIT envelope (U206E specific)
export const CG_ENVELOPE_ZS_DIT: CGEnvelopePoint[] = [
  { moment: 62, weight: 1900 },    // Forward limit - min weight
  { moment: 82, weight: 2540 },    // Forward limit - inflection
  { moment: 148, weight: 3600 },   // Forward limit - max weight
  { moment: 180, weight: 3600 },   // Aft limit - max weight
  { moment: 95, weight: 1900 },    // Aft limit - min weight
  { moment: 62, weight: 1900 },    // Close polygon
]

// ZS-ESJ envelope (U206G specific)
export const CG_ENVELOPE_ZS_ESJ: CGEnvelopePoint[] = [
  { moment: 60, weight: 1900 },    // Forward limit - min weight
  { moment: 80, weight: 2500 },    // Forward limit - inflection
  { moment: 150, weight: 3600 },   // Forward limit - max weight
  { moment: 170, weight: 3600 },   // Aft limit - max weight
  { moment: 90, weight: 1900 },    // Aft limit - min weight
  { moment: 60, weight: 1900 },    // Close polygon
]

// ZS-PAG envelope (U206G specific)
export const CG_ENVELOPE_ZS_PAG: CGEnvelopePoint[] = [
  { moment: 60, weight: 1900 },    // Forward limit - min weight
  { moment: 80, weight: 2500 },    // Forward limit - inflection
  { moment: 150, weight: 3600 },   // Forward limit - max weight
  { moment: 170, weight: 3600 },   // Aft limit - max weight
  { moment: 120, weight: 2550 },   // Aft limit - inflection
  { moment: 90, weight: 1900 },    // Aft limit - min weight
  { moment: 60, weight: 1900 },    // Close polygon
]

// ZS-IAE envelope (C182 specific - 2800 lbs max)
export const CG_ENVELOPE_ZS_IAE: CGEnvelopePoint[] = [
  { moment: 58, weight: 1800 },    // Forward limit - min weight
  { moment: 72, weight: 2210 },    // Forward limit - inflection
  { moment: 105, weight: 2800 },   // Forward limit - max weight
  { moment: 130, weight: 2800 },   // Aft limit - max weight
  { moment: 85, weight: 1800 },    // Aft limit - min weight
  { moment: 58, weight: 1800 },    // Close polygon
]

// ZS-FJF envelope (C182 specific - 2800 lbs max)
export const CG_ENVELOPE_ZS_FJF: CGEnvelopePoint[] = [
  { moment: 58, weight: 1800 },    // Forward limit - min weight
  { moment: 72, weight: 2210 },    // Forward limit - inflection
  { moment: 105, weight: 2800 },   // Forward limit - max weight
  { moment: 135, weight: 2800 },   // Aft limit - max weight
  { moment: 85, weight: 1800 },    // Aft limit - min weight
  { moment: 58, weight: 1800 },    // Close polygon
]

// Cessna 182 envelope (generic - 2800 lbs max)
export const CG_ENVELOPE_C182: CGEnvelopePoint[] = [
  { moment: 62, weight: 2100 },    // Forward limit - light
  { moment: 70, weight: 2300 },    // Forward limit - mid
  { moment: 85, weight: 2800 },    // Forward limit - max
  { moment: 140, weight: 2800 },   // Aft limit - max
  { moment: 105, weight: 2300 },   // Aft limit - mid
  { moment: 93, weight: 2100 },    // Aft limit - light
  { moment: 62, weight: 2100 },    // Close polygon
]

// ZS-PWC envelope (C182P specific - 2950 lbs max)
export const CG_ENVELOPE_C182P: CGEnvelopePoint[] = [
  { moment: 60, weight: 1800 },    // Forward limit - min weight
  { moment: 72, weight: 2250 },    // Forward limit - inflection
  { moment: 118, weight: 2950 },   // Forward limit - max weight
  { moment: 145, weight: 2950 },   // Aft limit - max weight
  { moment: 87, weight: 1800 },    // Aft limit - min weight
  { moment: 60, weight: 1800 },    // Close polygon
]

// Legacy alias
export const CG_ENVELOPE = CG_ENVELOPE_C206

// Get CG envelope for aircraft
export function getCGEnvelopeForAircraft(registration: string): CGEnvelopePoint[] {
  switch (registration) {
    case 'ZS-DIT':
      return CG_ENVELOPE_ZS_DIT
    case 'ZS-ESJ':
      return CG_ENVELOPE_ZS_ESJ
    case 'ZS-PAG':
      return CG_ENVELOPE_ZS_PAG
    case 'ZS-IAE':
      return CG_ENVELOPE_ZS_IAE
    case 'ZS-FJF':
      return CG_ENVELOPE_ZS_FJF
    case 'ZS-PWC':
      return CG_ENVELOPE_C182P
    default:
      return CG_ENVELOPE_C206
  }
}

// Stall speeds by bank angle (from POH)
export interface StallSpeedTable {
  configuration: string
  bankAngle: { [key: number]: number }  // bank angle -> speed mph
}

export const STALL_SPEEDS: StallSpeedTable[] = [
  {
    configuration: 'Flaps UP',
    bankAngle: { 0: 70, 20: 72, 40: 80, 60: 99 }
  },
  {
    configuration: 'Flaps 20°',
    bankAngle: { 0: 64, 20: 66, 40: 73, 60: 90 }
  },
  {
    configuration: 'Flaps 40°',
    bankAngle: { 0: 61, 20: 63, 40: 70, 60: 86 }
  },
]
