'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { CommandHeader } from './command-header'
import { MapViewport, type ViewMode } from './map-viewport'
import { TargetTelemetry } from './target-telemetry'
import { TrendChart } from './trend-chart'
import { CriticalHotspots } from './critical-hotspots'
import { SENSOR_POINTS, buildTimeSeries, fetchPrediction, type Prediction } from '@/lib/ocean-data'

const DEFAULT_TARGET = { lat: 12.5, lng: 68.2 }
const DEFAULT_PREDICTION: Prediction = { surface_temp: 30.2, salinity: 34.5, wind_speed: 18.2, source: 'fallback' }

export function OceanDashboard() {
  const [mode, setMode] = useState<ViewMode>('2d')
  const [target, setTarget] = useState<{ lat: number; lng: number } | null>(DEFAULT_TARGET)
  const [prediction, setPrediction] = useState<Prediction | null>(DEFAULT_PREDICTION)
  const [loading, setLoading] = useState(false)
  const requestId = useRef(0)

  const handleSelect = useCallback(async (lat: number, lng: number) => {
    const id = ++requestId.current
    setTarget({ lat, lng })
    setLoading(true)
    const result = await fetchPrediction(lat, lng)
    // Ignore stale responses if the user clicked again mid-flight
    if (id !== requestId.current) return
    setPrediction(result)
    setLoading(false)
  }, [])

  const series = useMemo(
    () => buildTimeSeries(prediction ?? DEFAULT_PREDICTION, (target?.lat ?? 0) * 7 + (target?.lng ?? 0)),
    [prediction, target],
  )

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <CommandHeader sensorCount={SENSOR_POINTS.length} apiSource={prediction?.source ?? null} />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <main className="relative min-h-[50dvh] flex-1 lg:min-h-0" aria-label="Map viewport">
          <MapViewport
            mode={mode}
            onModeChange={setMode}
            points={SENSOR_POINTS}
            target={target}
            onSelect={handleSelect}
          />
        </main>

        <aside
          className="scrollbar-thin flex w-full shrink-0 flex-col gap-6 overflow-y-auto border-t border-border bg-card/40 p-4 lg:w-[380px] lg:border-l lg:border-t-0"
          aria-label="Telemetry and analytics"
        >
          <TargetTelemetry target={target} prediction={prediction} loading={loading} />
          <TrendChart data={series} />
          <CriticalHotspots onSelect={handleSelect} />
        </aside>
      </div>
    </div>
  )
}
