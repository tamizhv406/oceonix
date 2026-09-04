'use client'

import { AlertTriangle, ChevronRight, Siren } from 'lucide-react'
import { HOTSPOTS } from '@/lib/ocean-data'

export function CriticalHotspots({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  return (
    <section aria-labelledby="hotspots-heading" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 id="hotspots-heading" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber">
          <Siren className="size-3.5" aria-hidden />
          Critical Hotspots
        </h2>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-amber">
          <span className="size-1.5 rounded-full bg-amber animate-blink" />
          {HOTSPOTS.length} Active
        </span>
      </div>

      <ul className="flex flex-col gap-1.5">
        {HOTSPOTS.map((h) => {
          const critical = h.severity === 'critical'
          return (
            <li key={h.id}>
              <button
                onClick={() => onSelect(h.lat, h.lng)}
                className={`group flex w-full items-center gap-3 rounded-md border bg-card px-3 py-2 text-left transition-colors hover:bg-secondary ${
                  critical ? 'border-amber/40' : 'border-border'
                }`}
              >
                <AlertTriangle
                  className={`size-4 shrink-0 ${critical ? 'text-amber' : 'text-cyan'}`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">{h.label}</span>
                    <span className={`font-mono text-xs font-semibold tabular-nums ${critical ? 'text-amber' : 'text-cyan'}`}>
                      {h.value}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>{h.metric}</span>
                    <span className="tabular-nums">
                      {h.lat.toFixed(1)}°, {h.lng.toFixed(1)}°
                    </span>
                  </div>
                </div>
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
