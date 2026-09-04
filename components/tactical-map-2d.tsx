'use client'

import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { SensorPoint } from '@/lib/ocean-data'

type Props = {
  points: SensorPoint[]
  target: { lat: number; lng: number } | null
  onSelect: (lat: number, lng: number) => void
}

function ClickHandler({ onSelect }: { onSelect: Props['onSelect'] }) {
  useMapEvents({
    click(e) {
      onSelect(Number(e.latlng.lat.toFixed(4)), Number(e.latlng.lng.toFixed(4)))
    },
  })
  return null
}

function FlyTo({ target }: { target: Props['target'] }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.panTo([target.lat, target.lng], { animate: true, duration: 0.6 })
  }, [target, map])
  return null
}

// Draw the 1500+ markers on a canvas renderer for performance
function useCanvasRenderer() {
  return useMemo(() => L.canvas({ padding: 0.5 }), [])
}

export default function TacticalMap2D({ points, target, onSelect }: Props) {
  const renderer = useCanvasRenderer()

  return (
    <MapContainer
      center={[5, 75]}
      zoom={4}
      minZoom={2}
      maxZoom={10}
      className="tactical-tiles h-full w-full"
      zoomControl
      attributionControl
      worldCopyJump
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onSelect={onSelect} />
      <FlyTo target={target} />

      {points.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lng]}
          radius={p.status === 'alert' ? 3.5 : 2.5}
          renderer={renderer}
          pathOptions={{
            color: p.status === 'alert' ? '#f5b53c' : '#3ee0e8',
            fillColor: p.status === 'alert' ? '#f5b53c' : '#3ee0e8',
            fillOpacity: 0.75,
            weight: 1,
            opacity: 0.9,
          }}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e)
              onSelect(p.lat, p.lng)
            },
          }}
        />
      ))}

      {target && (
        <>
          <CircleMarker
            center={[target.lat, target.lng]}
            radius={14}
            pathOptions={{ color: '#f5b53c', fill: false, weight: 1.5, opacity: 0.9, dashArray: '4 4' }}
          />
          <CircleMarker
            center={[target.lat, target.lng]}
            radius={4}
            pathOptions={{ color: '#f5b53c', fillColor: '#f5b53c', fillOpacity: 1, weight: 2 }}
          />
        </>
      )}
    </MapContainer>
  )
}
