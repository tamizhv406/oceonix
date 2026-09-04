'use client'

import dynamic from 'next/dynamic'
import { Globe2, Map as MapIcon, Loader2 } from 'lucide-react'
import type { SensorPoint } from '@/lib/ocean-data'

const TacticalMap2D = dynamic(() => import('./tactical-map-2d'), {
  ssr: false,
  loading: () => <MapLoading label="Loading tactical map" />,
})
const TacticalGlobe3D = dynamic(() => import('./tactical-globe-3d'), {
  ssr: false,
  loading: () => <MapLoading label="Initializing global view" />,
})

export type ViewMode = '2d' | '3d'

type Props = {
  mode: ViewMode
  onModeChange: (m: ViewMode) => void
  points: SensorPoint[]
  target: { lat: number; lng: number } | null
  onSelect: (lat: number, lng: number) => void
}

export function MapViewport({ mode, onModeChange, points, target, onSelect }: Props) {
  const alerts = points.filter((p) => p.status === 'alert').length

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* Map layer */}
      <div className="absolute inset-0">
        {mode === '2d' ? (
          <TacticalMap2D points={points} target={target} onSelect={onSelect} />
        ) : (
          <TacticalGlobe3D points={points} target={target} onSelect={onSelect} />
        )}
      </div>

      {/* View toggle */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex items-start justify-between p-3">
        <div className="pointer-events-auto flex flex-col gap-1 rounded-md border border-border bg-card/85 px-3 py-2 backdrop-blur">
          <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Sensor Grid</div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="flex items-center gap-1.5 text-cyan">
              <span className="size-2 rounded-full bg-cyan shadow-[0_0_6px_currentColor]" />
              {(points.length - alerts).toLocaleString()} Nominal
            </span>
            <span className="flex items-center gap-1.5 text-amber">
              <span className="size-2 rounded-full bg-amber shadow-[0_0_6px_currentColor]" />
              {alerts} Alert
            </span>
          </div>
        </div>

        <div
          role="radiogroup"
          aria-label="Map view mode"
          className="pointer-events-auto flex items-center rounded-md border border-border bg-card/85 p-1 backdrop-blur"
        >
          <ToggleButton
            active={mode === '2d'}
            onClick={() => onModeChange('2d')}
            icon={<MapIcon className="size-3.5" aria-hidden />}
            label="2D Tactical Map"
          />
          <ToggleButton
            active={mode === '3d'}
            onClick={() => onModeChange('3d')}
            icon={<Globe2 className="size-3.5" aria-hidden />}
            label="3D Global View"
          />
        </div>
      </div>

      {/* Corner brackets */}
      <CornerBrackets />

      {/* Bottom status strip */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] flex items-end justify-between p-3">
        <div className="rounded-md border border-border bg-card/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
          {mode === '2d' ? 'OSM · Tactical Filter · WGS84' : 'Three-Globe · Earth-Dark · Orbit'}
        </div>
        <div className="mr-14 rounded-md border border-border bg-card/85 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan backdrop-blur">
          Click any position to acquire
        </div>
      </div>
    </div>
  )
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
        active
          ? 'bg-cyan text-primary-foreground shadow-[0_0_14px_oklch(0.85_0.14_195/45%)]'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function CornerBrackets() {
  const cls = 'pointer-events-none absolute size-6 border-cyan/50'
  return (
    <>
      <span className={`${cls} left-2 top-2 border-l border-t`} aria-hidden />
      <span className={`${cls} right-2 top-2 border-r border-t`} aria-hidden />
      <span className={`${cls} bottom-2 left-2 border-b border-l`} aria-hidden />
      <span className={`${cls} bottom-2 right-2 border-b border-r`} aria-hidden />
    </>
  )
}

function MapLoading({ label }: { label: string }) {
  return (
    <div className="tactical-grid flex h-full w-full items-center justify-center bg-background">
      <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-cyan">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        {label}…
      </div>
    </div>
  )
}
