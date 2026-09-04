export type SensorPoint = {
  id: string
  lat: number
  lng: number
  region: string
  status: 'nominal' | 'alert'
  temp: number
}

export type Prediction = {
  surface_temp: number
  salinity: number
  wind_speed: number
  source: 'api' | 'fallback'
}

export type TimeSeriesPoint = {
  time: string
  temperature: number
  salinity: number
  wind: number
}

// Deterministic PRNG so server/client render the same points (no hydration mismatch)
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Basin = {
  name: string
  latMin: number
  latMax: number
  lngMin: number
  lngMax: number
  count: number
}

// Bounding boxes deliberately kept offshore to avoid land masses
const BASINS: Basin[] = [
  { name: 'Arabian Sea', latMin: 5, latMax: 22, lngMin: 55, lngMax: 71, count: 420 },
  { name: 'Bay of Bengal', latMin: 6, latMax: 20, lngMin: 82, lngMax: 94, count: 420 },
  { name: 'Central Indian Ocean', latMin: -15, latMax: 5, lngMin: 60, lngMax: 95, count: 380 },
  { name: 'Laccadive Sea', latMin: 4, latMax: 12, lngMin: 72, lngMax: 78, count: 120 },
  { name: 'Andaman Sea', latMin: 7, latMax: 15, lngMin: 94, lngMax: 98, count: 90 },
  { name: 'Southern Indian Ocean', latMin: -35, latMax: -15, lngMin: 45, lngMax: 110, count: 140 },
  { name: 'Mozambique Channel', latMin: -25, latMax: -12, lngMin: 36, lngMax: 44, count: 60 },
]

export function generateSensorPoints(): SensorPoint[] {
  const rand = mulberry32(20260904)
  const points: SensorPoint[] = []
  let idx = 0
  for (const b of BASINS) {
    for (let i = 0; i < b.count; i++) {
      const lat = b.latMin + rand() * (b.latMax - b.latMin)
      const lng = b.lngMin + rand() * (b.lngMax - b.lngMin)
      // warmer near the equator
      const temp = 31.5 - Math.abs(lat) * 0.22 + (rand() - 0.5) * 1.6
      const alert = rand() < 0.07
      points.push({
        id: `OIS-${String(idx++).padStart(4, '0')}`,
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        region: b.name,
        status: alert ? 'alert' : 'nominal',
        temp: Number(temp.toFixed(1)),
      })
    }
  }
  return points
}

export const SENSOR_POINTS: SensorPoint[] = generateSensorPoints()

export const HOTSPOTS = [
  {
    id: 'HS-01',
    label: 'Arabian Sea Basin',
    metric: 'High Temp',
    value: '32.1°C',
    lat: 15.2,
    lng: 64.8,
    severity: 'critical' as const,
  },
  {
    id: 'HS-02',
    label: 'Bay of Bengal',
    metric: 'High Wind',
    value: '45 kts',
    lat: 14.6,
    lng: 88.1,
    severity: 'critical' as const,
  },
  {
    id: 'HS-03',
    label: 'Laccadive Sea',
    metric: 'Low Salinity',
    value: '32.4 PSU',
    lat: 8.9,
    lng: 74.3,
    severity: 'warning' as const,
  },
]

export function regionForCoord(lat: number, lng: number): string {
  for (const b of BASINS) {
    if (lat >= b.latMin && lat <= b.latMax && lng >= b.lngMin && lng <= b.lngMax) {
      return b.name
    }
  }
  return 'Open Ocean'
}

function mockPrediction(lat: number, lng: number): Prediction {
  // Physically plausible values derived from the clicked coordinate
  const latF = Math.abs(lat)
  const surface_temp = 30.2 - latF * 0.18 + Math.sin(lng * 0.1) * 0.6
  const salinity = 34.5 + Math.cos(lat * 0.15) * 0.8 + (lng > 80 ? -1.2 : 0.4)
  const wind_speed = 18.2 + Math.sin(lat * 0.3 + lng * 0.05) * 6 + latF * 0.12
  return {
    surface_temp: Number(surface_temp.toFixed(1)),
    salinity: Number(salinity.toFixed(1)),
    wind_speed: Number(wind_speed.toFixed(1)),
    source: 'fallback',
  }
}

/**
 * Queries the local FastAPI backend; falls back to realistic mock data when
 * the backend is unreachable (e.g. in a cloud preview).
 */
export async function fetchPrediction(lat: number, lng: number): Promise<Prediction> {
  const url = `http://127.0.0.1:8000/predict?lat=${lat}&lon=${lng}`
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 2500)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return {
      surface_temp: Number(data.surface_temp),
      salinity: Number(data.salinity),
      wind_speed: Number(data.wind_speed),
      source: 'api',
    }
  } catch {
    return mockPrediction(lat, lng)
  }
}

export function buildTimeSeries(base: Prediction, seed: number): TimeSeriesPoint[] {
  const rand = mulberry32(Math.floor(seed * 1000))
  const out: TimeSeriesPoint[] = []
  for (let h = 23; h >= 0; h--) {
    const phase = (23 - h) / 24
    const diurnal = Math.sin(phase * Math.PI * 2 - Math.PI / 2)
    out.push({
      time: h === 0 ? 'NOW' : `-${h}h`,
      temperature: Number((base.surface_temp + diurnal * 0.9 + (rand() - 0.5) * 0.4).toFixed(2)),
      salinity: Number((base.salinity + Math.sin(phase * Math.PI * 4) * 0.25 + (rand() - 0.5) * 0.15).toFixed(2)),
      wind: Number((base.wind_speed + diurnal * -3 + (rand() - 0.5) * 2.5).toFixed(1)),
    })
  }
  return out
}
