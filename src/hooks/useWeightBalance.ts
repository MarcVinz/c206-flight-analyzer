import { useState, useMemo, useCallback } from 'react'
import type { MassItem, WeightBalance, FuelData, AircraftConfig, CGEnvelopePoint, MassItemConfig } from '@/types/aircraft'
import { getMassItemConfigsForAircraft, getCGEnvelopeForAircraft, FUEL_WEIGHT_PER_GALLON } from '@/types/aircraft'
import { AIRCRAFT_CONFIGS } from '@/data/aircraftConfigs'
import { clamp } from '@/lib/utils'

function createMassItemsFromConfig(configs: MassItemConfig[]): MassItem[] {
  return configs.map(config => ({
    id: config.id,
    label: config.label,
    mass: config.defaultValue,
    arm: config.arm,
    editable: true,
    min: config.min,
    max: config.max,
    unit: 'lbs',
  }))
}

// Point-in-polygon check using ray-casting algorithm
function isPointInEnvelope(moment: number, weight: number, envelope: CGEnvelopePoint[]): boolean {
  let inside = false

  for (let i = 0, j = envelope.length - 1; i < envelope.length; j = i++) {
    const xi = envelope[i].moment
    const yi = envelope[i].weight
    const xj = envelope[j].moment
    const yj = envelope[j].weight

    const intersect = ((yi > weight) !== (yj > weight)) &&
      (moment < ((xj - xi) * (weight - yi)) / (yj - yi) + xi)

    if (intersect) inside = !inside
  }

  return inside
}

export function useWeightBalance(initialRegistration: string = 'ZS-DIT') {
  // Aircraft selection
  const [selectedAircraft, setSelectedAircraft] = useState<string>(initialRegistration)

  // Get current aircraft config
  const aircraftConfig: AircraftConfig = useMemo(() => {
    return AIRCRAFT_CONFIGS[selectedAircraft] || AIRCRAFT_CONFIGS['ZS-DIT']
  }, [selectedAircraft])

  // Get aircraft-specific mass item configs
  const massItemConfigs = useMemo(() => {
    return getMassItemConfigsForAircraft(selectedAircraft)
  }, [selectedAircraft])

  // Get aircraft-specific CG envelope
  const cgEnvelope = useMemo(() => {
    return getCGEnvelopeForAircraft(selectedAircraft)
  }, [selectedAircraft])

  // Mass items state - initialized from aircraft-specific config
  const [massItems, setMassItems] = useState<MassItem[]>(() =>
    createMassItemsFromConfig(getMassItemConfigsForAircraft(initialRegistration))
  )

  // Fuel state
  const [fuelGallons, setFuelGallons] = useState<number>(0)
  const [reserveMinutes, setReserveMinutes] = useState<number>(30)

  // Trip planning
  const [tripDistance, setTripDistance] = useState<number>(0) // NM

  // Update mass item
  const updateMassItem = (id: string, mass: number) => {
    setMassItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, mass: clamp(mass, item.min ?? 0, item.max ?? 9999) }
          : item
      )
    )
  }

  // Fuel calculations - using aircraft-specific fuel arm
  const fuelData: FuelData = useMemo(() => {
    const weight = fuelGallons * FUEL_WEIGHT_PER_GALLON
    const moment = (weight * aircraftConfig.fuelArm) / 1000 // Convert to lb-in/1000
    const enduranceMinutes = (fuelGallons / aircraftConfig.fuelBurn) * 60
    const flightTimeMinutes = Math.max(0, enduranceMinutes - reserveMinutes)

    return {
      gallons: fuelGallons,
      weight,
      moment,
      consumption: aircraftConfig.fuelBurn,
      reserve: reserveMinutes,
      flightTime: Math.floor(flightTimeMinutes),
      endurance: Math.floor(enduranceMinutes),
    }
  }, [fuelGallons, reserveMinutes, aircraftConfig.fuelBurn, aircraftConfig.fuelArm])

  // Calculate fuel burn for trip
  const tripFuelBurn = useMemo(() => {
    if (tripDistance <= 0) return 0
    // Assume 100 kt block speed
    const tripHours = tripDistance / 100
    return tripHours * aircraftConfig.fuelBurn * FUEL_WEIGHT_PER_GALLON // lbs
  }, [tripDistance, aircraftConfig.fuelBurn])

  // Weight & Balance calculations
  const weightBalance: WeightBalance = useMemo(() => {
    // Empty weight from aircraft config
    const emptyWeight = aircraftConfig.emptyWeight
    const emptyMoment = aircraftConfig.emptyMoment

    // Sum of all payload items
    const payloadWeight = massItems.reduce((sum, item) => sum + item.mass, 0)
    const payloadMoment = massItems.reduce((sum, item) => sum + (item.mass * item.arm) / 1000, 0)

    // Zero Fuel Weight (no fuel)
    const zfwWeight = emptyWeight + payloadWeight
    const zfwMoment = emptyMoment + payloadMoment
    const zfwCg = zfwWeight > 0 ? (zfwMoment * 1000) / zfwWeight : 0

    // Total weight (with fuel)
    const totalWeight = zfwWeight + fuelData.weight
    const totalMoment = zfwMoment + fuelData.moment
    const cg = totalWeight > 0 ? (totalMoment * 1000) / totalWeight : 0

    // Landing weight (after fuel burn for trip)
    const landingWeight = totalWeight - tripFuelBurn
    const landingFuelWeight = Math.max(0, fuelData.weight - tripFuelBurn)
    const landingFuelMoment = (landingFuelWeight * aircraftConfig.fuelArm) / 1000
    const landingMoment = zfwMoment + landingFuelMoment
    const landingCg = landingWeight > 0 ? (landingMoment * 1000) / landingWeight : 0

    // Check if within limits using aircraft-specific CG envelope
    const isWithinLimits =
      totalWeight <= aircraftConfig.maxGross &&
      landingWeight <= aircraftConfig.maxGross &&
      isPointInEnvelope(totalMoment, totalWeight, cgEnvelope) &&
      isPointInEnvelope(landingMoment, landingWeight, cgEnvelope)

    return {
      totalWeight,
      totalMoment,
      cg,
      isWithinLimits,
      zfwWeight,
      zfwMoment,
      zfwCg,
      landingWeight,
      landingMoment,
      landingCg,
    }
  }, [massItems, fuelData, aircraftConfig, tripFuelBurn, cgEnvelope])

  // Reset for new aircraft
  const selectAircraft = useCallback((registration: string) => {
    setSelectedAircraft(registration)
    // Reset mass items to aircraft-specific defaults
    const newConfigs = getMassItemConfigsForAircraft(registration)
    setMassItems(createMassItemsFromConfig(newConfigs))
    setFuelGallons(0)
  }, [])

  // Calculate useful load
  const usefulLoad = aircraftConfig.maxGross - aircraftConfig.emptyWeight
  const remainingPayload = aircraftConfig.maxGross - weightBalance.totalWeight

  // Set fuel with aircraft-specific limit
  const setFuelGallonsClamped = useCallback((g: number) => {
    setFuelGallons(clamp(g, 0, aircraftConfig.fuelCapacity))
  }, [aircraftConfig.fuelCapacity])

  return {
    // Aircraft
    selectedAircraft,
    selectAircraft,
    aircraftConfig,

    // Mass items
    massItems,
    updateMassItem,

    // Fuel
    fuelGallons,
    setFuelGallons: setFuelGallonsClamped,
    fuelData,
    reserveMinutes,
    setReserveMinutes,

    // Trip
    tripDistance,
    setTripDistance,
    tripFuelBurn,

    // Calculations
    weightBalance,
    usefulLoad,
    remainingPayload,
    maxFuelGallons: aircraftConfig.fuelCapacity,
  }
}
