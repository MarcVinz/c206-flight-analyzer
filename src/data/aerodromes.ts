export interface Aerodrome {
  icao: string
  name: string
  elevation: number // feet
  latitude: string
  longitude: string
  country: 'ZA' | 'NA' | 'BW' // South Africa, Namibia, Botswana
}

export const aerodromes: Aerodrome[] = [
  // South Africa (FA prefix)
  { icao: 'FAWB', name: 'Wonderboom', elevation: 4095, latitude: 'S25 39 12.08', longitude: 'E028 13 30.03', country: 'ZA' },
  { icao: 'FAAugra', name: 'Dundi Lodge Augrabies', elevation: 2200, latitude: 'S28 37 38.01', longitude: 'E020 19 28.03', country: 'ZA' },
  { icao: 'FAUP', name: 'Upington Intl.', elevation: 2791, latitude: 'S28 24 03.07', longitude: 'E021 15 34.08', country: 'ZA' },
  { icao: 'FAPP', name: 'Polokwane Intl.', elevation: 4076, latitude: 'S23 50 43.02', longitude: 'E029 27 30.08', country: 'ZA' },
  { icao: 'FAPI', name: 'Pietersburg', elevation: 4354, latitude: 'S23 55 34.08', longitude: 'E029 29 01.06', country: 'ZA' },
  { icao: 'FAKlaser', name: 'Klaserie Camps', elevation: 1309, latitude: 'S24 06 49.00', longitude: 'E031 08 06.00', country: 'ZA' },
  { icao: 'FABlyde', name: 'Blyde Canyon', elevation: 4300, latitude: 'S24 34 12.00', longitude: 'E030 46 24.00', country: 'ZA' },

  // Namibia (FY prefix)
  { icao: 'FYKT', name: 'Keetmanshoop', elevation: 3506, latitude: 'S26 32 19.01', longitude: 'E018 06 42.00', country: 'NA' },
  { icao: 'FYKC', name: 'Karios (Canon Lodge)', elevation: 3124, latitude: 'S27 39 33.02', longitude: 'E017 50 14.09', country: 'NA' },
  { icao: 'FYGE', name: 'Fish River Lodge', elevation: 2985, latitude: 'S27 30 16.00', longitude: 'E017 31 35.00', country: 'NA' },
  { icao: 'FYLZ', name: 'Luderitz', elevation: 457, latitude: 'S26 41 14.02', longitude: 'E015 14 34.03', country: 'NA' },
  { icao: 'FYGK', name: 'Geluk (Kulala)', elevation: 2407, latitude: 'S24 40 25.00', longitude: 'E015 47 33.02', country: 'NA' },
  { icao: 'FYSU', name: 'Sossusvlei Lodge', elevation: 2640, latitude: 'S24 29 30.00', longitude: 'E015 49 08.06', country: 'NA' },
  { icao: 'FYSM', name: 'Swakopmund', elevation: 170, latitude: 'S22 39 42.08', longitude: 'E014 34 06.07', country: 'NA' },
  { icao: 'FYDN', name: 'Doro !Nawas', elevation: 1580, latitude: 'S20 26 51.00', longitude: 'E014 17 35.00', country: 'NA' },
  { icao: 'FYPE', name: 'Orupembe', elevation: 2600, latitude: 'S18 09 45.00', longitude: 'E012 34 15.08', country: 'NA' },
  { icao: 'FYEtaam', name: 'Etambuura', elevation: 3100, latitude: 'S18 03 56.20', longitude: 'E012 37 37.40', country: 'NA' },
  { icao: 'FYEF', name: 'Epupa Falls', elevation: 2500, latitude: 'S17 01 45.01', longitude: 'E013 12 36.01', country: 'NA' },
  { icao: 'FYSZ', name: 'Swartbooisdrift', elevation: 2845, latitude: 'S17 24 10.03', longitude: 'E013 49 30.05', country: 'NA' },
  { icao: 'FYOA', name: 'Ondangwa Intl.', elevation: 3599, latitude: 'S17 52 39.00', longitude: 'E015 57 15.00', country: 'NA' },
  { icao: 'FYGG', name: 'Onguma', elevation: 3600, latitude: 'S18 43 31.09', longitude: 'E017 05 17.02', country: 'NA' },
  { icao: 'FYNM', name: 'Nhoma Safari Camp', elevation: 3790, latitude: 'S19 14 16.00', longitude: 'E020 13 14.04', country: 'NA' },
  { icao: 'FYBG', name: 'Bagani', elevation: 3300, latitude: 'S18 07 06.00', longitude: 'E021 37 25.00', country: 'NA' },
  { icao: 'FYLS', name: 'Lianshulu', elevation: 3180, latitude: 'S18 06 59.02', longitude: 'E023 23 34.03', country: 'NA' },
  { icao: 'FYKM', name: 'Katima Mulilo', elevation: 3144, latitude: 'S17 38 03.00', longitude: 'E024 10 36.00', country: 'NA' },

  // Botswana (FB prefix)
  { icao: 'FBKE', name: 'Kasane Intl.', elevation: 3289, latitude: 'S17 49 57.00', longitude: 'E025 09 48.06', country: 'BW' },
  { icao: 'FBChobe', name: 'Chobe', elevation: 3165, latitude: 'S18 32 04.00', longitude: 'E023 39 38.00', country: 'BW' },
  { icao: 'FBXG', name: 'Xugana', elevation: 3000, latitude: 'S19 03 02.00', longitude: 'E023 05 17.02', country: 'BW' },
  { icao: 'FBMN', name: 'Maun Intl.', elevation: 3094, latitude: 'S19 58 21.00', longitude: 'E023 25 41.00', country: 'BW' },
  { icao: 'FBLotsan', name: 'Lotsane', elevation: 2525, latitude: 'S22 39 53.00', longitude: 'E028 10 24.04', country: 'BW' },
  { icao: 'FBLV', name: 'Limpopo Valley', elevation: 1774, latitude: 'S22 11 31.00', longitude: 'E029 07 53.00', country: 'BW' },
]

// Helper to get aerodrome by ICAO
export function getAerodromeByIcao(icao: string): Aerodrome | undefined {
  return aerodromes.find(a => a.icao === icao)
}

// Helper to get display label for aerodrome
export function getAerodromeLabel(aerodrome: Aerodrome): string {
  return `${aerodrome.icao} - ${aerodrome.name}`
}

// Calculate distance between two aerodromes in NM
export function calculateDistance(from: Aerodrome, to: Aerodrome): number {
  // Parse coordinates
  const parseCoord = (coord: string): number => {
    const parts = coord.match(/([NSEW])(\d+)\s+(\d+)\s+([\d.]+)/)
    if (!parts) return 0
    const dir = parts[1]
    const deg = parseInt(parts[2])
    const min = parseInt(parts[3])
    const sec = parseFloat(parts[4])
    let decimal = deg + min / 60 + sec / 3600
    if (dir === 'S' || dir === 'W') decimal = -decimal
    return decimal
  }

  const lat1 = parseCoord(from.latitude) * Math.PI / 180
  const lon1 = parseCoord(from.longitude) * Math.PI / 180
  const lat2 = parseCoord(to.latitude) * Math.PI / 180
  const lon2 = parseCoord(to.longitude) * Math.PI / 180

  // Haversine formula
  const dLat = lat2 - lat1
  const dLon = lon2 - lon1
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const earthRadiusNM = 3440.065 // Earth radius in nautical miles

  return Math.round(earthRadiusNM * c)
}
