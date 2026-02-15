export interface ChecklistItem {
  id: string
  text: string
  response: string
  critical?: boolean
}

export interface ChecklistSection {
  id: string
  title: string
  items: ChecklistItem[]
}

// Common checklist for all Cessna 206 variants
// ZS-DIT and ZS-PAG have nearly identical checklists
export const CHECKLISTS_C206: ChecklistSection[] = [
  {
    id: 'before_engine_start',
    title: 'Before Engine Start',
    items: [
      { id: 'oil', text: 'Oil', response: '8 QTS' },
      { id: 'fuel', text: 'Fuel', response: 'STRAINED AND DIPPED (13-14 gal/h)' },
      { id: 'fuel_caps', text: 'Fuel Caps', response: 'CONFIRM CLOSED' },
      { id: 'pitot_cover', text: 'Pitot Cover', response: 'REMOVED' },
      { id: 'walkaround', text: 'Walkaround', response: 'COMPLETE' },
    ],
  },
  {
    id: 'engine_start',
    title: 'Engine Start',
    items: [
      { id: 'preflight', text: 'Exterior Pre-flight Inspection', response: 'COMPLETE' },
      { id: 'seats', text: 'Seats and Seat Belts', response: 'ADJUST and LOCK' },
      { id: 'circuit_breakers', text: 'Circuit Breakers', response: 'CHECK IN' },
      { id: 'fuel_selector', text: 'Fuel Selector', response: 'EMPTIEST TANK' },
      { id: 'cowl_flaps', text: 'Cowl Flaps', response: 'OPEN' },
      { id: 'avionics_master', text: 'Avionics Master', response: 'OFF' },
      { id: 'mixture', text: 'Mixture', response: 'FULL RICH' },
      { id: 'pitch', text: 'Pitch', response: 'FULL FINE' },
      { id: 'throttle_full', text: 'Throttle', response: 'FULL OPEN' },
      { id: 'master_switch', text: 'Master Switch', response: 'ON' },
      { id: 'aux_pump', text: 'Auxiliary Fuel Pump', response: 'ON "HI" 3 sec, then OFF', critical: true },
      { id: 'throttle_half', text: 'Throttle', response: 'CLOSE, ½ INCH OPEN' },
      { id: 'brakes', text: 'Brakes', response: 'APPLIED' },
      { id: 'beacon', text: 'Beacon Light', response: 'ON' },
      { id: 'prop_area', text: 'Propeller Area', response: 'CLEAR', critical: true },
      { id: 'ignition', text: 'Ignition Switch', response: 'START, Slowly Open Throttle' },
    ],
  },
  {
    id: 'after_engine_start',
    title: 'After Engine Start',
    items: [
      { id: 'throttle_1000', text: 'Throttle', response: '1000 RPM' },
      { id: 'oil_pressure', text: 'Oil Pressure', response: 'GREEN within 30 sec', critical: true },
      { id: 'ammeter', text: 'Ammeter', response: 'POSITIVE rate of charge' },
      { id: 'mixture_lean', text: 'Mixture', response: 'LEAN (till RPM drops, one turn rich)' },
      { id: 'throttle_idle', text: 'Throttle', response: 'SLOW IDLE' },
      { id: 'deadcut', text: 'Ignition Switch', response: 'L,R,OFF,R,L BOTH (Dead-cut)' },
      { id: 'throttle_1000_2', text: 'Throttle', response: '1000 RPM' },
      { id: 'fuel_selector_full', text: 'Fuel Selector', response: 'FULLEST TANK' },
      { id: 'flaps_test', text: 'Flaps', response: 'FULL DOWN, THEN RETRACT' },
      { id: 'avionics_on', text: 'Avionics Master', response: 'ON' },
      { id: 'transponder', text: 'Transponder', response: 'STBY' },
      { id: 'edm', text: 'EDM (Digital Engine Monitor)', response: 'SET FUEL' },
      { id: 'radios', text: 'Radios', response: 'SET AND CALL' },
    ],
  },
  {
    id: 'engine_runup',
    title: 'Engine Run-Up',
    items: [
      { id: 'brakes_runup', text: 'Brakes', response: 'APPLIED' },
      { id: 'fuel_runup', text: 'Fuel Selector', response: 'FULLEST TANK' },
      { id: 'temp_pressure', text: 'Temp & Pressure', response: 'IN THE GREEN (MIN 200° CHT, 75° OIL)', critical: true },
      { id: 'mixture_rich', text: 'Mixture', response: 'FULL RICH' },
      { id: 'throttle_1900', text: 'Throttle', response: '1900 RPM' },
      { id: 'mags', text: 'Magnetos', response: 'TEST L & R (max drop 150 RPM, max diff 50 RPM)' },
      { id: 'prop_cycle', text: 'Propeller', response: 'CYCLE TO 1500 RPM & BACK (3x 1st flight)' },
      { id: 'ammeter_runup', text: 'Ammeter', response: 'POSITIVE RATE OF CHARGE' },
      { id: 'temp_pressure_2', text: 'Temp & Pressure', response: 'IN THE GREEN' },
      { id: 'throttle_idle', text: 'Throttle', response: 'Idle (600-900 RPM)' },
      { id: 'throttle_1000_runup', text: 'Throttle', response: '1000 RPM' },
    ],
  },
  {
    id: 'before_takeoff',
    title: 'Before Take Off',
    items: [
      { id: 'tmmpfhig', text: 'Too Many Pilots Forget How It Goes', response: 'MEMORY AID', critical: true },
      { id: 'controls', text: 'Test Controls', response: 'FULL AND FREE MOVEMENT' },
      { id: 'trim', text: 'Trim', response: 'FOR TAKE-OFF (elevator central)' },
      { id: 'throttle_friction', text: 'Throttle Friction Nut', response: 'SECURE / TIGHT' },
      { id: 'temps', text: 'Temperatures', response: 'IN THE GREEN (OIL and CHTs)' },
      { id: 'master', text: 'Master', response: 'ON' },
      { id: 'mags_both', text: 'Mags', response: 'ON BOTH' },
      { id: 'mixture_to', text: 'Mixture', response: 'FULL RICH' },
      { id: 'pitot', text: 'Pitot Cover', response: 'REMOVED' },
      { id: 'pressures', text: 'Pressures', response: 'IN THE GREEN' },
      { id: 'fuel_to', text: 'Fuel Selector', response: 'FULLEST TANK' },
      { id: 'fuel_qty', text: 'Fuel Indicators', response: 'SUFFICIENT FOR FLIGHT' },
      { id: 'flaps_to', text: 'Flaps', response: '10° NORMAL ; 20° SHORT FIELD' },
      { id: 'hatches', text: 'Hatches (doors/windows)', response: 'SECURE' },
      { id: 'harnesses', text: 'Harnesses (seat belts)', response: 'SECURE & TIGHT' },
      { id: 'instruments', text: 'Instruments', response: 'NO CRACKED GLASS OR BROKEN NEEDLES' },
      { id: 'cowl_to', text: 'Gills / Cowl Flaps', response: 'OPEN' },
      { id: 'briefing', text: 'Take-Off Briefing', response: 'COMPLETE & CALL READY' },
    ],
  },
  {
    id: 'normal_takeoff',
    title: 'Normal Take-Off',
    items: [
      { id: 'xpdr_alt', text: 'Transponder', response: 'ALT' },
      { id: 'landing_light', text: 'Landing Light', response: 'ON' },
      { id: 'full_power', text: 'Apply FULL POWER', response: 'Smoothly (right rudder as required)', critical: true },
      { id: 'fuel_flow_to', text: 'Fuel Flow', response: 'SET for Full Throttle (Placard)' },
      { id: 'map_rpm', text: 'Manifold Pressure & RPM', response: 'FULL POWER (for altitude)' },
      { id: 'temps_to', text: 'Temps & Pressures', response: 'IN THE GREEN' },
      { id: 'airspeed', text: 'Airspeed', response: 'ALIVE' },
      { id: 'rotate', text: 'Rotate', response: '60 MPH', critical: true },
      { id: 'brakes_wheels', text: 'Once Airborne', response: 'Apply Brakes to stop wheels' },
      { id: 'climb_speed', text: 'Climb Speed', response: '80 MPH, accelerate to 100 MPH clear of obstacles' },
    ],
  },
  {
    id: 'after_takeoff',
    title: 'After Take-Off',
    items: [
      { id: 'flaps_retract', text: 'Flaps', response: 'RETRACT' },
      { id: 'throttle_climb', text: 'Throttle', response: 'TOP OF GREEN (25" MAP / 24.5" PAG)' },
      { id: 'pitch_climb', text: 'Pitch', response: 'TOP OF GREEN (2550 RPM / 2500 PAG)' },
      { id: 'mixture_climb', text: 'Mixture', response: '18 GAL/HR' },
      { id: 'temps_climb', text: 'Temps & Pressures', response: 'IN THE GREEN' },
      { id: 'cowl_climb', text: 'Cowl Flaps', response: 'CONFIRM OPEN' },
      { id: 'fuel_climb', text: 'Fuel', response: 'CONFIRM FULLEST TANK' },
    ],
  },
  {
    id: 'cruise',
    title: 'Cruise',
    items: [
      { id: 'normal_cruise', text: 'Normal Cruise', response: '23" MAP, 2300 RPM, 13 gal/h' },
      { id: 'economy_cruise', text: 'Economy Cruise', response: '20" MAP, 2300 RPM, 11 gal/h' },
      { id: 'high_power', text: 'High-Power Cruise', response: '25" MAP, 2500 RPM, 17 gal/h' },
      { id: 'cowl_cruise', text: 'Cowl Flaps', response: 'AS REQUIRED (CLOSED < 330° CHT)' },
    ],
  },
  {
    id: 'descent',
    title: 'Descent',
    items: [
      { id: 'throttle_desc', text: 'Throttle', response: 'As required (gradual reduction, 18-20" MAP)' },
      { id: 'pitch_desc', text: 'Pitch', response: '2300 RPM' },
      { id: 'mixture_desc', text: 'Mixture', response: 'HALF IN before taking power at lower ALT' },
      { id: 'cowl_desc', text: 'Cowl Flaps', response: 'CLOSED (avoid shock-cooling!)', critical: true },
    ],
  },
  {
    id: 'before_landing',
    title: 'Before Landing',
    items: [
      { id: 'brakes_test', text: 'Brakes', response: 'TEST' },
      { id: 'gear', text: 'Undercarriage', response: 'FIXED GEAR' },
      { id: 'throttle_land', text: 'Throttle', response: 'AS REQUIRED' },
      { id: 'pitch_land', text: 'Pitch', response: '2300 RPM (Noise abatement)' },
      { id: 'mixture_land', text: 'Mixture', response: 'SET FULL RICH' },
      { id: 'fuel_land', text: 'Fuel Selector', response: 'FULLEST TANK' },
      { id: 'flaps_10', text: 'Flaps', response: 'AS REQUIRED (10°)' },
      { id: 'cowl_land', text: 'Cowl Flaps', response: 'CLOSE (avoid shock-cooling!)' },
    ],
  },
  {
    id: 'base',
    title: 'Base',
    items: [
      { id: 'cowl_base', text: 'Cowl Flaps', response: 'CONFIRM CLOSED' },
      { id: 'flaps_20', text: 'Flaps', response: 'AS REQUIRED, ENSURE WHITE ARC (20°)' },
    ],
  },
  {
    id: 'final',
    title: 'Final',
    items: [
      { id: 'mixture_final', text: 'Mixture', response: 'CONFIRM FULL RICH' },
      { id: 'pitch_final', text: 'Pitch', response: 'TURN IN TO FULL FINE' },
      { id: 'flaps_full', text: 'Flaps', response: 'AS REQUIRED (FULL)' },
      { id: 'throttle_final', text: 'Throttle', response: 'AS REQUIRED' },
      { id: 'cowl_final', text: 'Cowl Flaps', response: 'OPEN (for Go-around/Touch And Go)' },
      { id: 'approach_speed', text: 'Approach Speed', response: '80 MPH / Over the fence 75 MPH', critical: true },
    ],
  },
  {
    id: 'after_landing',
    title: 'After Landing',
    items: [
      { id: 'lfmt', text: 'Lets Fly More Tomorrow', response: 'MEMORY AID' },
      { id: 'landing_lights_off', text: 'Landing Lights', response: 'OFF' },
      { id: 'flaps_cowl', text: 'Flaps & Cowl Flaps', response: 'RETRACT & OPEN' },
      { id: 'mixture_taxi', text: 'Mixture', response: 'LEAN (till RPM drops, one turn rich)' },
      { id: 'xpdr_off', text: 'Transponder', response: 'OFF' },
      { id: 'trim_neutral', text: 'Trim', response: 'SET NEUTRAL' },
    ],
  },
  {
    id: 'shutdown',
    title: 'Shut-Down',
    items: [
      { id: 'throttle_shutdown', text: 'Throttle', response: '1000 RPM' },
      { id: 'temps_shutdown', text: 'Temps & Pressures', response: 'IN THE GREEN' },
      { id: 'avionics_off', text: 'Avionics Master', response: 'OFF' },
      { id: 'throttle_idle_sd', text: 'Throttle', response: 'SLOW IDLE' },
      { id: 'deadcut_sd', text: 'Ignition Switch', response: 'L,R,OFF,R,L BOTH (Dead-cut)' },
      { id: 'throttle_1000_sd', text: 'Throttle', response: '1000 RPM' },
      { id: 'mixture_cutoff', text: 'Mixture', response: 'IDLE CUT-OFF', critical: true },
      { id: 'master_mags_off', text: 'Master & Mags', response: 'OFF' },
    ],
  },
  {
    id: 'parking_hangar',
    title: 'Parking Aircraft In Hangar',
    items: [
      { id: 'master_confirm', text: 'Confirm Master', response: 'OFF' },
      { id: 'folio', text: 'Flight Folio', response: 'FILLED (HOBBS & TACH!)' },
      { id: 'pitot_on', text: 'Pitot Cover', response: 'ON' },
      { id: 'chocks', text: 'Chocks', response: 'INSERTED' },
      { id: 'doors_closed', text: 'Doors', response: 'CLOSED' },
    ],
  },
  {
    id: 'parking_offbase',
    title: 'Parking Aircraft Off-Base',
    items: [
      { id: 'master_off_ob', text: 'Confirm Master', response: 'OFF' },
      { id: 'control_lock', text: 'Control Lock', response: 'INSERTED OR STRAP YOKE WITH HARNESS' },
      { id: 'folio_ob', text: 'Flight Folio', response: 'FILLED (HOBBS & TACH!)' },
      { id: 'sun_shield', text: 'Sun Shield', response: 'INSERTED' },
      { id: 'tiedowns', text: 'Tie Downs', response: 'TIED' },
      { id: 'chocks_ob', text: 'Chocks', response: 'INSERTED' },
      { id: 'pitot_ob', text: 'Pitot Cover', response: 'ON' },
      { id: 'copilot_door', text: 'Co-Pilot Door', response: 'LOCKED FROM INSIDE' },
      { id: 'pilot_door', text: 'Pilot Door', response: 'LOCK WITH KEY' },
      { id: 'cargo_door', text: 'Cargo Door', response: 'LOCK WITH KEY' },
    ],
  },
]

// Cessna 182 checklists (ZS-FJF, ZS-IAE, ZS-PWC)
// Note: C182 has no cowl flaps (fixed cowl), smaller engine (O-470, 230 HP)
export const CHECKLISTS_C182: ChecklistSection[] = [
  {
    id: 'before_engine_start',
    title: 'Before Engine Start',
    items: [
      { id: 'oil', text: 'Oil', response: '7-9 QTS' },
      { id: 'fuel', text: 'Fuel', response: 'STRAINED AND DIPPED (12 gal/h)' },
      { id: 'fuel_caps', text: 'Fuel Caps', response: 'CONFIRM CLOSED' },
      { id: 'pitot_cover', text: 'Pitot Cover', response: 'REMOVED' },
      { id: 'walkaround', text: 'Walkaround', response: 'COMPLETE' },
    ],
  },
  {
    id: 'engine_start',
    title: 'Engine Start',
    items: [
      { id: 'preflight', text: 'Exterior Pre-flight Inspection', response: 'COMPLETE' },
      { id: 'seats', text: 'Seats and Seat Belts', response: 'ADJUST and LOCK' },
      { id: 'circuit_breakers', text: 'Circuit Breakers', response: 'CHECK IN' },
      { id: 'fuel_selector', text: 'Fuel Selector', response: 'BOTH' },
      { id: 'avionics_master', text: 'Avionics Master', response: 'OFF' },
      { id: 'mixture', text: 'Mixture', response: 'FULL RICH' },
      { id: 'pitch', text: 'Pitch', response: 'FULL FINE' },
      { id: 'throttle_full', text: 'Throttle', response: 'OPEN 1/2 INCH' },
      { id: 'master_switch', text: 'Master Switch', response: 'ON' },
      { id: 'aux_pump', text: 'Auxiliary Fuel Pump', response: 'ON 3-5 sec, then OFF', critical: true },
      { id: 'brakes', text: 'Brakes', response: 'APPLIED' },
      { id: 'beacon', text: 'Beacon Light', response: 'ON' },
      { id: 'prop_area', text: 'Propeller Area', response: 'CLEAR', critical: true },
      { id: 'ignition', text: 'Ignition Switch', response: 'START' },
    ],
  },
  {
    id: 'after_engine_start',
    title: 'After Engine Start',
    items: [
      { id: 'throttle_1000', text: 'Throttle', response: '1000 RPM' },
      { id: 'oil_pressure', text: 'Oil Pressure', response: 'GREEN within 30 sec', critical: true },
      { id: 'ammeter', text: 'Ammeter', response: 'POSITIVE rate of charge' },
      { id: 'mixture_lean', text: 'Mixture', response: 'LEAN for taxi' },
      { id: 'deadcut', text: 'Ignition Switch', response: 'L,R,OFF,R,L BOTH (Dead-cut)' },
      { id: 'fuel_selector_full', text: 'Fuel Selector', response: 'BOTH' },
      { id: 'flaps_test', text: 'Flaps', response: 'FULL DOWN, THEN RETRACT' },
      { id: 'avionics_on', text: 'Avionics Master', response: 'ON' },
      { id: 'transponder', text: 'Transponder', response: 'STBY' },
      { id: 'radios', text: 'Radios', response: 'SET AND CALL' },
    ],
  },
  {
    id: 'engine_runup',
    title: 'Engine Run-Up',
    items: [
      { id: 'brakes_runup', text: 'Brakes', response: 'APPLIED' },
      { id: 'fuel_runup', text: 'Fuel Selector', response: 'BOTH' },
      { id: 'temp_pressure', text: 'Temp & Pressure', response: 'IN THE GREEN', critical: true },
      { id: 'mixture_rich', text: 'Mixture', response: 'FULL RICH' },
      { id: 'throttle_1800', text: 'Throttle', response: '1800 RPM' },
      { id: 'mags', text: 'Magnetos', response: 'TEST L & R (max drop 125 RPM, max diff 50 RPM)' },
      { id: 'prop_cycle', text: 'Propeller', response: 'CYCLE (3x 1st flight)' },
      { id: 'ammeter_runup', text: 'Ammeter', response: 'POSITIVE RATE OF CHARGE' },
      { id: 'throttle_idle', text: 'Throttle', response: 'Idle (check 500-700 RPM)' },
      { id: 'throttle_1000_runup', text: 'Throttle', response: '1000 RPM' },
    ],
  },
  {
    id: 'before_takeoff',
    title: 'Before Take Off',
    items: [
      { id: 'controls', text: 'Flight Controls', response: 'FREE AND CORRECT' },
      { id: 'trim', text: 'Trim', response: 'FOR TAKE-OFF' },
      { id: 'throttle_friction', text: 'Throttle Friction', response: 'SET' },
      { id: 'temps', text: 'Engine Instruments', response: 'IN THE GREEN' },
      { id: 'master', text: 'Master Switch', response: 'ON' },
      { id: 'mags_both', text: 'Ignition', response: 'BOTH' },
      { id: 'mixture_to', text: 'Mixture', response: 'FULL RICH' },
      { id: 'fuel_to', text: 'Fuel Selector', response: 'BOTH' },
      { id: 'fuel_qty', text: 'Fuel Quantity', response: 'SUFFICIENT FOR FLIGHT' },
      { id: 'flaps_to', text: 'Flaps', response: '0-10° (10-20° SHORT FIELD)' },
      { id: 'hatches', text: 'Doors', response: 'LATCHED' },
      { id: 'harnesses', text: 'Seat Belts', response: 'FASTENED' },
      { id: 'briefing', text: 'Take-Off Briefing', response: 'COMPLETE' },
    ],
  },
  {
    id: 'normal_takeoff',
    title: 'Normal Take-Off',
    items: [
      { id: 'xpdr_alt', text: 'Transponder', response: 'ALT' },
      { id: 'landing_light', text: 'Landing Light', response: 'ON' },
      { id: 'full_power', text: 'Apply FULL POWER', response: 'Smoothly', critical: true },
      { id: 'temps_to', text: 'Engine Instruments', response: 'CHECK' },
      { id: 'airspeed', text: 'Airspeed', response: 'ALIVE' },
      { id: 'rotate', text: 'Rotate', response: '60 MPH', critical: true },
      { id: 'climb_speed', text: 'Climb Speed', response: '80 MPH Vx / 90 MPH Vy' },
    ],
  },
  {
    id: 'after_takeoff',
    title: 'After Take-Off',
    items: [
      { id: 'flaps_retract', text: 'Flaps', response: 'RETRACT' },
      { id: 'throttle_climb', text: 'Throttle', response: 'FULL or 23" MAP' },
      { id: 'pitch_climb', text: 'Pitch', response: '2450 RPM' },
      { id: 'mixture_climb', text: 'Mixture', response: 'AS REQUIRED (lean above 3000 ft)' },
      { id: 'temps_climb', text: 'Engine Instruments', response: 'CHECK' },
      { id: 'fuel_climb', text: 'Fuel Selector', response: 'BOTH' },
    ],
  },
  {
    id: 'cruise',
    title: 'Cruise',
    items: [
      { id: 'normal_cruise', text: 'Normal Cruise (75%)', response: '23" MAP, 2450 RPM' },
      { id: 'economy_cruise', text: 'Economy Cruise (65%)', response: '21" MAP, 2300 RPM' },
      { id: 'mixture_cruise', text: 'Mixture', response: 'LEAN (peak EGT - 50°F ROP)' },
      { id: 'fuel_cruise', text: 'Fuel Selector', response: 'BOTH' },
    ],
  },
  {
    id: 'descent',
    title: 'Descent',
    items: [
      { id: 'throttle_desc', text: 'Throttle', response: 'AS REQUIRED' },
      { id: 'mixture_desc', text: 'Mixture', response: 'ENRICH AS REQUIRED' },
      { id: 'fuel_desc', text: 'Fuel Selector', response: 'BOTH' },
    ],
  },
  {
    id: 'before_landing',
    title: 'Before Landing',
    items: [
      { id: 'brakes_test', text: 'Brakes', response: 'TEST' },
      { id: 'gear', text: 'Undercarriage', response: 'FIXED GEAR' },
      { id: 'mixture_land', text: 'Mixture', response: 'FULL RICH' },
      { id: 'fuel_land', text: 'Fuel Selector', response: 'BOTH' },
      { id: 'flaps_10', text: 'Flaps', response: 'AS REQUIRED' },
    ],
  },
  {
    id: 'final',
    title: 'Final',
    items: [
      { id: 'mixture_final', text: 'Mixture', response: 'FULL RICH' },
      { id: 'pitch_final', text: 'Pitch', response: 'FULL FINE' },
      { id: 'flaps_full', text: 'Flaps', response: 'AS REQUIRED' },
      { id: 'approach_speed', text: 'Approach Speed', response: '70-80 MPH', critical: true },
    ],
  },
  {
    id: 'after_landing',
    title: 'After Landing',
    items: [
      { id: 'landing_lights_off', text: 'Landing Light', response: 'OFF' },
      { id: 'flaps_up', text: 'Flaps', response: 'UP' },
      { id: 'mixture_taxi', text: 'Mixture', response: 'LEAN' },
      { id: 'xpdr_off', text: 'Transponder', response: 'STBY' },
      { id: 'trim_neutral', text: 'Trim', response: 'SET FOR TAKE-OFF' },
    ],
  },
  {
    id: 'shutdown',
    title: 'Shut-Down',
    items: [
      { id: 'throttle_shutdown', text: 'Throttle', response: '1000 RPM' },
      { id: 'avionics_off', text: 'Avionics Master', response: 'OFF' },
      { id: 'throttle_idle_sd', text: 'Throttle', response: 'IDLE' },
      { id: 'mixture_cutoff', text: 'Mixture', response: 'IDLE CUT-OFF', critical: true },
      { id: 'mags_off', text: 'Ignition', response: 'OFF' },
      { id: 'master_off', text: 'Master Switch', response: 'OFF' },
    ],
  },
  {
    id: 'parking',
    title: 'Parking',
    items: [
      { id: 'master_confirm', text: 'Master Switch', response: 'OFF' },
      { id: 'control_lock', text: 'Control Lock', response: 'INSTALLED' },
      { id: 'folio', text: 'Flight Folio', response: 'COMPLETED' },
      { id: 'pitot_on', text: 'Pitot Cover', response: 'ON' },
      { id: 'chocks', text: 'Chocks', response: 'AS REQUIRED' },
      { id: 'tiedowns', text: 'Tie Downs', response: 'AS REQUIRED' },
    ],
  },
]

// Legacy alias for backwards compatibility
export const CHECKLISTS = CHECKLISTS_C206

// Get checklists for a specific aircraft
export function getChecklistsForAircraft(registration: string): ChecklistSection[] {
  const c182Registrations = ['ZS-FJF', 'ZS-IAE', 'ZS-PWC']
  if (c182Registrations.includes(registration)) {
    return CHECKLISTS_C182
  }
  return CHECKLISTS_C206
}

export function getChecklistById(id: string, registration?: string): ChecklistSection | undefined {
  const checklists = registration ? getChecklistsForAircraft(registration) : CHECKLISTS
  return checklists.find(c => c.id === id)
}
