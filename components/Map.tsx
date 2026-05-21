'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Bien, Statut } from '@/lib/types'
import { STATUT_CONFIG } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'

function createPinIcon(statut: Statut) {
  const color = STATUT_CONFIG[statut].pin
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 32px; height: 32px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.35);
      "></div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  })
}

function MapRecenter({ biens }: { biens: Bien[] }) {
  const map = useMap()
  useEffect(() => {
    if (biens.length > 0) {
      const bounds = L.latLngBounds(biens.map(b => [b.latitude, b.longitude]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [biens, map])
  return null
}

interface Props {
  biens: Bien[]
  selectedId?: string | null
  onSelect?: (id: string) => void
}

export default function Map({ biens, selectedId, onSelect }: Props) {
  return (
    <MapContainer
      center={[46.195, -1.43]}
      zoom={12}
      scrollWheelZoom
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapRecenter biens={biens} />
      {biens.map((bien) => (
        <Marker
          key={bien.id}
          position={[bien.latitude, bien.longitude]}
          icon={createPinIcon(bien.statut)}
          eventHandlers={{ click: () => onSelect?.(bien.id) }}
        >
          <Popup>
            <div className="p-1 min-w-[180px]">
              <p className="font-semibold text-reagim-text text-sm">{bien.nom}</p>
              <p className="text-xs text-gray-500 mb-2">{bien.commune}</p>
              <StatusBadge statut={bien.statut} size="sm" />
              <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                <p>{bien.type.charAt(0).toUpperCase() + bien.type.slice(1)} · {bien.capacite} pers.</p>
                {bien.aubergiste && <p>Gérant : {bien.aubergiste.nom}</p>}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
