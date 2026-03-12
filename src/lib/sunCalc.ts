// Solar calculations based on NOAA Solar Calculator algorithms

const DEG = Math.PI / 180
const RAD = 180 / Math.PI

interface SunTimes {
  sunrise: Date
  sunset: Date
}

function julianDay(date: Date): number {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate()
  const a = Math.floor((14 - m) / 12)
  const yy = y + 4800 - a
  const mm = m + 12 * a - 3
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045
}

function solarDeclination(jd: number): number {
  const n = jd - 2451545.0
  const L = (280.46 + 0.9856474 * n) % 360
  const g = (357.528 + 0.9856003 * n) % 360
  const lambda = L + 1.915 * Math.sin(g * DEG) + 0.02 * Math.sin(2 * g * DEG)
  const epsilon = 23.439 - 0.0000004 * n
  return Math.asin(Math.sin(epsilon * DEG) * Math.sin(lambda * DEG)) * RAD
}

function solarNoon(jd: number, lng: number): number {
  const n = jd - 2451545.0 + 0.0008
  const jStar = n - lng / 360
  const M = (357.5291 + 0.98560028 * jStar) % 360
  const C = 1.9148 * Math.sin(M * DEG) + 0.02 * Math.sin(2 * M * DEG) + 0.0003 * Math.sin(3 * M * DEG)
  const lambda = (M + C + 180 + 102.9372) % 360
  return 2451545.0 + jStar + 0.0053 * Math.sin(M * DEG) - 0.0069 * Math.sin(2 * lambda * DEG)
}

function hourAngle(lat: number, dec: number): number {
  const cosHA =
    (Math.sin(-0.83 * DEG) - Math.sin(lat * DEG) * Math.sin(dec * DEG)) /
    (Math.cos(lat * DEG) * Math.cos(dec * DEG))
  if (cosHA > 1) return 0
  if (cosHA < -1) return 180
  return Math.acos(cosHA) * RAD
}

function julianToDate(jd: number): Date {
  const z = Math.floor(jd + 0.5)
  const f = jd + 0.5 - z
  let a = z
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25)
    a = z + 1 + alpha - Math.floor(alpha / 4)
  }
  const b = a + 1524
  const c = Math.floor((b - 122.1) / 365.25)
  const d = Math.floor(365.25 * c)
  const e = Math.floor((b - d) / 30.6001)
  const day = b - d - Math.floor(30.6001 * e) + f
  const month = e < 14 ? e - 1 : e - 13
  const year = month > 2 ? c - 4716 : c - 4715
  const hours = (day % 1) * 24
  const minutes = (hours % 1) * 60
  const seconds = (minutes % 1) * 60
  return new Date(Date.UTC(year, month - 1, Math.floor(day), Math.floor(hours), Math.floor(minutes), Math.floor(seconds)))
}

export function getSunTimes(date: Date, lat: number, lng: number): SunTimes {
  const jd = julianDay(date)
  const dec = solarDeclination(jd)
  const ha = hourAngle(lat, dec)
  const noon = solarNoon(jd, lng)
  return {
    sunrise: julianToDate(noon - ha / 360),
    sunset: julianToDate(noon + ha / 360),
  }
}

// Format a UTC Date to local time using the device's timezone automatically
export function formatSunTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
