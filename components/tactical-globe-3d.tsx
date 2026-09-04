'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import type { SensorPoint } from '@/lib/ocean-data'

type Props = {
  points: SensorPoint[]
  target: { lat: number; lng: number } | null
  onSelect: (lat: number, lng: number) => void
}

export default function TacticalGlobe3D({ points, target, onSelect }: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  // Fit the globe canvas to its container
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: Math.floor(width), h: Math.floor(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Initial camera over the Indian Ocean
  useEffect(() => {
    const g = globeRef.current
    if (!g) return
    g.pointOfView({ lat: 5, lng: 75, altitude: 1.9 }, 0)
    const controls = g.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.35
    controls.enableDamping = true
  }, [size.w > 0])

  // Fly to the target and stop auto-rotate when the user picks a location
  useEffect(() => {
    const g = globeRef.current
    if (!g || !target) return
    g.controls().autoRotate = false
    const pov = g.pointOfView()
    g.pointOfView({ lat: target.lat, lng: target.lng, altitude: Math.min(pov.altitude, 1.6) }, 800)
  }, [target])

  const rings = useMemo(() => (target ? [{ lat: target.lat, lng: target.lng }] : []), [target])

  return (
    <div ref={containerRef} className="h-full w-full">
      {size.w > 0 && (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere
          atmosphereColor="#3ee0e8"
          atmosphereAltitude={0.18}
          pointsData={points}
          pointLat={(d) => (d as SensorPoint).lat}
          pointLng={(d) => (d as SensorPoint).lng}
          pointColor={(d) => ((d as SensorPoint).status === 'alert' ? '#f5b53c' : '#3ee0e8')}
          pointAltitude={(d) => ((d as SensorPoint).status === 'alert' ? 0.02 : 0.008)}
          pointRadius={(d) => ((d as SensorPoint).status === 'alert' ? 0.28 : 0.18)}
          pointsMerge={false}
          pointResolution={6}
          pointLabel={(d) => {
            const p = d as SensorPoint
            return `<div style="font-family:monospace;font-size:11px;background:rgba(11,16,32,.9);border:1px solid rgba(62,224,232,.4);padding:4px 6px;color:#e6f7f9"><b style="color:#3ee0e8">${p.id}</b><br/>${p.region}<br/>${p.lat.toFixed(2)}, ${p.lng.toFixed(2)}</div>`
          }}
          onPointClick={(d) => {
            const p = d as SensorPoint
            onSelect(p.lat, p.lng)
          }}
          onGlobeClick={({ lat, lng }) => onSelect(Number(lat.toFixed(4)), Number(lng.toFixed(4)))}
          ringsData={rings}
          ringColor={() => (t: number) => `rgba(245,181,60,${1 - t})`}
          ringMaxRadius={4}
          ringPropagationSpeed={2}
          ringRepeatPeriod={900}
        />
      )}
    </div>
  )
}
