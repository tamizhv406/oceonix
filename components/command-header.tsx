'use client'

import { useEffect, useState } from 'react'
import { Radar, Satellite, ShieldCheck, Wifi } from 'lucide-react'

function formatUtc(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`
}

function formatDate(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`
}

export function CommandHeader({
  sensorCount,
  apiSource,
}: {
  sensorCount: number
  apiSource: 'api' | 'fallback' | null
}) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/60 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-md border border-cyan/40 bg-cyan/10 text-cyan">
          <Radar className="size-5" aria-hidden />
        </div>
        <div className="leading-tight">
          <h1 className="text-lg font-bold uppercase tracking-[0.2em] text-foreground glow-cyan">
            Ocean Intelligence Command
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Indian Ocean Theater · Sensor Grid Alpha
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-6 md:flex">
        <StatusItem
          icon={<Satellite className="size-3.5" aria-hidden />}
          label="Sensors"
          value={`${sensorCount.toLocaleString()} ONLINE`}
          tone="cyan"
        />
        <StatusItem
          icon={<Wifi className="size-3.5" aria-hidden />}
          label="Inference"
          value={apiSource === 'api' ? 'FASTAPI LINK' : apiSource === 'fallback' ? 'LOCAL MODEL' : 'STANDBY'}
          tone={apiSource === 'api' ? 'cyan' : 'amber'}
        />
        <StatusItem
          icon={<ShieldCheck className="size-3.5" aria-hidden />}
          label="System"
          value="OPERATIONAL"
          tone="cyan"
          pulse
        />
      </div>

      <div className="text-right leading-tight">
        <div className="font-mono text-xl font-semibold tabular-nums text-cyan glow-cyan" aria-live="off">
          {now ? formatUtc(now) : '--:--:--'}
          <span className="ml-1.5 text-xs text-muted-foreground">UTC</span>
        </div>
        <div className="font-mono text-[10px] tracking-widest text-muted-foreground">
          {now ? formatDate(now) : '----------'}
        </div>
      </div>
    </header>
  )
}

function StatusItem({
  icon,
  label,
  value,
  tone,
  pulse,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: 'cyan' | 'amber'
  pulse?: boolean
}) {
  const color = tone === 'cyan' ? 'text-cyan' : 'text-amber'
  return (
    <div className="flex items-center gap-2">
      <span className={color}>{icon}</span>
      <div className="leading-none">
        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className={`mt-0.5 flex items-center gap-1.5 font-mono text-xs font-semibold ${color}`}>
          {pulse && <span className={`size-1.5 rounded-full bg-current ${pulse ? 'animate-blink' : ''}`} />}
          {value}
        </div>
      </div>
    </div>
  )
}
