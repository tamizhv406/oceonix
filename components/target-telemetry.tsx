'use client'

import { Crosshair, Droplets, Thermometer, Wind } from 'lucide-react'
import type { Prediction } from '@/lib/ocean-data'
import { regionForCoord } from '@/lib/ocean-data'

type Props = {
  target: { lat: number; lng: number } | null
  prediction: Prediction | null
  loading: boolean
}

function fmtCoord(v: number, pos: string, neg: string) {
  return `${Math.abs(v).toFixed(4)}° ${v >= 0 ? pos : neg}`
}

export function TargetTelemetry({ target, prediction, loading }: Props) {
  return (
    <section aria-labelledby="telemetry-heading" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 id="telemetry-heading" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
          <Crosshair className="size-3.5" aria-hidden />
          Target Telemetry
        </h2>
        <span
          className={`font-mono text-[10px] uppercase tracking-widest ${
            prediction?.source === 'api' ? 'text-cyan' : 'text-amber'
          }`}
        >
          {loading ? 'QUERYING…' : prediction ? (prediction.source === 'api' ? 'LIVE · FASTAPI' : 'FALLBACK MODEL') : 'NO TARGET'}
        </span>
      </div>

      <div className="rounded-md border border-border bg-background/60 p-3">
        {target ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between font-mono text-sm">
              <span className="text-muted-foreground">LAT</span>
              <span className="tabular-nums text-foreground">{fmtCoord(target.lat, 'N', 'S')}</span>
            </div>
            <div className="flex items-baseline justify-between font-mono text-sm">
              <span className="text-muted-foreground">LON</span>
              <span className="tabular-nums text-foreground">{fmtCoord(target.lng, 'E', 'W')}</span>
            </div>
            <div className="mt-1 border-t border-border pt-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan">
              {regionForCoord(target.lat, target.lng)}
            </div>
          </div>
        ) : (
          <p className="font-mono text-xs text-muted-foreground">
            Click any position on the map or globe to acquire a target.
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Metric
          icon={<Thermometer className="size-4" aria-hidden />}
          label="Surface Temp"
          value={prediction?.surface_temp}
          unit="°C"
          loading={loading}
          tone="amber"
        />
        <Metric
          icon={<Droplets className="size-4" aria-hidden />}
          label="Salinity"
          value={prediction?.salinity}
          unit="PSU"
          loading={loading}
          tone="cyan"
        />
        <Metric
          icon={<Wind className="size-4" aria-hidden />}
          label="Wind Speed"
          value={prediction?.wind_speed}
          unit="kts"
          loading={loading}
          tone="neon"
        />
      </div>
    </section>
  )
}

function Metric({
  icon,
  label,
  value,
  unit,
  loading,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: number | undefined
  unit: string
  loading: boolean
  tone: 'cyan' | 'amber' | 'neon'
}) {
  const toneClass = { cyan: 'text-cyan', amber: 'text-amber', neon: 'text-neon' }[tone]
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border bg-card p-2.5">
      <div className={`flex items-center gap-1.5 ${toneClass}`}>
        {icon}
        <span className="font-mono text-[9px] uppercase leading-none tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className={`font-mono text-2xl font-semibold tabular-nums leading-none ${toneClass} ${loading ? 'animate-blink' : ''}`}>
        {value !== undefined ? value.toFixed(1) : '--.-'}
      </div>
      <div className="font-mono text-[10px] text-muted-foreground">{unit}</div>
    </div>
  )
}
