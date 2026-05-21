'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bien, Reservation, Statut, StatsDashboard } from '@/lib/types'
import { STATUT_CONFIG } from '@/lib/utils'
import { Header } from './Header'
import { StatCard } from './StatCard'
import { StatusBadge } from './StatusBadge'
import { WeekCalendar } from './WeekCalendar'
import { Home, Building2, CalendarClock, Users } from 'lucide-react'

const Map = dynamic(() => import('./Map'), { ssr: false })

function computeStats(biens: Bien[]): StatsDashboard {
  const total = biens.length
  const disponible = biens.filter(b => b.statut === 'disponible').length
  const occupe = biens.filter(b => b.statut === 'occupe').length
  const nettoyage = biens.filter(b => b.statut === 'nettoyage').length
  const maintenance = biens.filter(b => b.statut === 'maintenance').length
  const tauxOccupation = total > 0 ? Math.round((occupe / total) * 100) : 0
  return { total, disponible, occupe, nettoyage, maintenance, tauxOccupation }
}

interface Props {
  initialBiens: Bien[]
  initialReservations: Reservation[]
}

export function Dashboard({ initialBiens, initialReservations }: Props) {
  const [biens, setBiens] = useState<Bien[]>(initialBiens)
  const [selected, setSelected] = useState<string | null>(null)
  const [filtre, setFiltre] = useState<Statut | null>(null)
  const today = new Date().toISOString().split('T')[0]

  const checkinsAujourdhui = initialReservations.filter(r => r.date_arrivee === today)
  const checkoutsAujourdhui = initialReservations.filter(r => r.date_depart === today)

  useEffect(() => {
    const channel = supabase
      .channel('biens-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'biens' }, (payload) => {
        setBiens(prev => prev.map(b => b.id === payload.new.id ? { ...b, ...payload.new } : b))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const stats = computeStats(biens)
  const biensFiltres = filtre ? biens.filter(b => b.statut === filtre) : biens
  const selectedBien = biens.find(b => b.id === selected)

  function toggleFiltre(statut: Statut) {
    setFiltre(prev => prev === statut ? null : statut)
    setSelected(null)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Biens total" value={stats.total} icon={Home} color="text-reagim-blue" />
          <StatCard label="Taux d'occupation" value={`${stats.tauxOccupation}%`} icon={Building2} color="text-indigo-600" />
          <StatCard label="Check-ins aujourd'hui" value={checkinsAujourdhui.length} icon={CalendarClock} color="text-green-600" />
          <StatCard label="Check-outs aujourd'hui" value={checkoutsAujourdhui.length} icon={Users} color="text-amber-600" />
        </div>

        {/* Filtres cliquables */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Filtrer par statut</span>
            <span className="text-xs text-gray-400 italic flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Temps réel
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap pb-1">
            {(Object.entries(STATUT_CONFIG) as [Statut, typeof STATUT_CONFIG[Statut]][]).map(([key, cfg]) => {
              const count = biens.filter(b => b.statut === key).length
              const isActive = filtre === key
              return (
                <button
                  key={key}
                  onClick={() => toggleFiltre(key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all shrink-0
                    ${isActive
                      ? `${cfg.bg} ${cfg.color} border-current shadow-sm scale-105`
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                    }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: cfg.pin }} />
                  {cfg.label}
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/60' : 'bg-gray-100'}`}>
                    {count}
                  </span>
                </button>
              )
            })}

            {filtre && (
              <button
                onClick={() => setFiltre(null)}
                className="text-xs text-gray-400 hover:text-gray-600 underline shrink-0 self-center ml-1"
              >
                Tout afficher
              </button>
            )}
          </div>
        </div>

        {/* Calendrier semaine */}
        <WeekCalendar biens={biensFiltres} reservations={initialReservations} />

        {/* Contenu principal : carte + liste */}
        <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">

          {/* Carte */}
          <div className="h-[55vh] min-h-[400px] lg:h-auto lg:flex-1 lg:min-h-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <Map biens={biensFiltres} selectedId={selected} onSelect={setSelected} />
          </div>

          {/* Sidebar liste */}
          <div className="lg:w-80 xl:w-96 flex flex-col gap-3 lg:overflow-y-auto">
            {selectedBien && (
              <div className="bg-reagim-blue text-white rounded-xl p-4 shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold">{selectedBien.nom}</p>
                  <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white text-lg leading-none">×</button>
                </div>
                <p className="text-white/70 text-sm mb-3">{selectedBien.adresse}, {selectedBien.commune}</p>
                <StatusBadge statut={selectedBien.statut} />
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white/10 rounded-lg p-2">
                    <p className="text-white/60 text-xs">Type</p>
                    <p className="font-medium capitalize">{selectedBien.type}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2">
                    <p className="text-white/60 text-xs">Capacité</p>
                    <p className="font-medium">{selectedBien.capacite} pers.</p>
                  </div>
                  {selectedBien.prix_semaine && (
                    <div className="bg-white/10 rounded-lg p-2 col-span-2">
                      <p className="text-white/60 text-xs">Tarif semaine</p>
                      <p className="font-medium">{selectedBien.prix_semaine.toLocaleString('fr-FR')} €</p>
                    </div>
                  )}
                </div>
                {selectedBien.aubergiste && (
                  <p className="mt-3 text-xs text-white/60">Gérant : {selectedBien.aubergiste.nom}</p>
                )}
              </div>
            )}

            {/* Répartition */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-reagim-text mb-3">Répartition par statut</p>
              <div className="space-y-2">
                {(Object.entries(STATUT_CONFIG) as [Statut, typeof STATUT_CONFIG[Statut]][]).map(([key, cfg]) => {
                  const count = biens.filter(b => b.statut === key).length
                  const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{cfg.label}</span>
                        <span className="font-medium text-reagim-text">{count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: cfg.pin }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Liste biens filtrés */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <p className="text-sm font-semibold text-reagim-text">
                  {filtre ? STATUT_CONFIG[filtre].label : 'Tous les biens'}
                </p>
                <span className="text-xs text-gray-400">{biensFiltres.length} bien{biensFiltres.length > 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {biensFiltres.map(bien => (
                  <button
                    key={bien.id}
                    onClick={() => setSelected(bien.id === selected ? null : bien.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-reagim-sky transition-colors ${selected === bien.id ? 'bg-reagim-sky' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-reagim-text truncate">{bien.nom}</p>
                        <p className="text-xs text-gray-400">{bien.commune}</p>
                      </div>
                      <StatusBadge statut={bien.statut} size="sm" />
                    </div>
                  </button>
                ))}
                {biensFiltres.length === 0 && (
                  <p className="px-4 py-6 text-sm text-gray-400 text-center">Aucun bien dans ce statut</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
