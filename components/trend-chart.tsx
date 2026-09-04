'use client'

import { useState } from 'react'
import { Activity } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TimeSeriesPoint } from '@/lib/ocean-data'

type Series = 'temperature' | 'salinity' | 'wind'

const SERIES: Record<Series, { label: string; unit: string; color: string; domainPad: number }> = {
  temperature: { label: 'Temperature', unit: '°C', color: '#f5b53c', domainPad: 0.6 },
  salinity: { label: 'Salinity', unit: 'PSU', color: '#3ee0e8', domainPad: 0.4 },
  wind: { label: 'Wind', unit: 'kts', color: '#4d8dff', domainPad: 3 },
}

export function TrendChart({ data }: { data: TimeSeriesPoint[] }) {
  const [series, setSeries] = useState<Series>('temperature')
  const meta = SERIES[series]

  const values = data.map((d) => d[series])
  const min = Math.min(...values) - meta.domainPad
  const max = Math.max(...values) + meta.domainPad

  return (
    <section aria-labelledby="trend-heading" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 id="trend-heading" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan">
          <Activity className="size-3.5" aria-hidden />
          Graphical Analysis · 24H
        </h2>
      </div>

      <div role="tablist" aria-label="Chart series" className="grid grid-cols-3 gap-1 rounded-md border border-border bg-background/60 p-1">
        {(Object.keys(SERIES) as Series[]).map((key) => {
          const active = key === series
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => setSeries(key)}
              className={`rounded-sm px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                active
                  ? 'bg-cyan/15 text-cyan shadow-[inset_0_0_0_1px_oklch(0.85_0.14_195/40%)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {SERIES[key].label}
            </button>
          )
        })}
      </div>

      <div className="h-48 rounded-md border border-border bg-card p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id={`fill-${series}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={meta.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={meta.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(62,224,232,0.08)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: 'oklch(0.65 0.04 230)', fontSize: 9, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(62,224,232,0.15)' }}
              interval={5}
            />
            <YAxis
              domain={[Number(min.toFixed(1)), Number(max.toFixed(1))]}
              tick={{ fill: 'oklch(0.65 0.04 230)', fontSize: 9, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v: number) => v.toFixed(1)}
            />
            <Tooltip
              cursor={{ stroke: meta.color, strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{
                background: 'oklch(0.14 0.035 255 / 95%)',
                border: `1px solid ${meta.color}55`,
                borderRadius: 4,
                fontFamily: 'monospace',
                fontSize: 11,
                padding: '6px 8px',
              }}
              labelStyle={{ color: 'oklch(0.65 0.04 230)', marginBottom: 2 }}
              itemStyle={{ color: meta.color }}
              formatter={(v) => [`${Number(v).toFixed(2)} ${meta.unit}`, meta.label]}
            />
            <Area
              type="monotone"
              dataKey={series}
              stroke={meta.color}
              strokeWidth={2}
              fill={`url(#fill-${series})`}
              dot={false}
              activeDot={{ r: 3.5, fill: meta.color, stroke: '#0b1020', strokeWidth: 2 }}
              isAnimationActive
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
