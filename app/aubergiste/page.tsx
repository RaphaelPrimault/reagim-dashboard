'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bien, Statut } from '@/lib/types'
import { STATUT_CONFIG } from '@/lib/utils'
import { Waves, CheckCircle2, Home, Clock, WrenchIcon } from 'lucide-react'

const STATUTS: { key: Statut; icon: React.ReactNode; short: string }[] = [
  { key: 'disponible',  icon: <CheckCircle2 className="w-4 h-4" />, short: 'Libre' },
  { key: 'occupe',      icon: <Home className="w-4 h-4" />,         short: 'Occupé' },
  { key: 'nettoyage',  icon: <Clock className="w-4 h-4" />,        short: 'Nettoyage' },
  { key: 'maintenance',icon: <WrenchIcon className="w-4 h-4" />,   short: 'Maintenance' },
]

export default function AubergistePage() {
  const [biens, setBiens] = useState<Bien[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('biens')
      .select('*, aubergiste:aubergistes(id, nom)')
      .order('nom')
      .then(({ data }) => {
        setBiens((data as Bien[]) ?? [])
        setLoading(false)
      })

    const channel = supabase
      .channel('biens-aubergiste')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'biens' }, (payload) => {
        setBiens(prev => prev.map(b => b.id === payload.new.id ? { ...b, ...payload.new } : b))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function updateStatut(id: string, statut: Statut) {
    setUpdating(id)
    await supabase.from('biens').update({ statut, updated_at: new Date().toISOString() }).eq('id', id)
    setUpdating(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Waves className="w-8 h-8 mx-auto mb-2 animate-pulse text-reagim-blue" />
          <p className="text-sm">Chargement…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-reagim-blue text-white px-4 py-4 shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Waves className="w-5 h-5" />
          <div>
            <p className="font-bold leading-tight">Réagim</p>
            <p className="text-xs text-white/60">Vue Aubergiste</p>
          </div>
        </div>
      </header>

      {/* Biens */}
      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-3">
        <p className="text-sm text-gray-500 font-medium">{biens.length} bien{biens.length > 1 ? 's' : ''} — appuyez pour changer le statut</p>

        {biens.map(bien => {
          const cfg = STATUT_CONFIG[bien.statut]
          const isUpdating = updating === bien.id
          return (
            <div key={bien.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Titre bien */}
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <p className="font-semibold text-reagim-text">{bien.nom}</p>
                  <p className="text-xs text-gray-400">{bien.commune} · {bien.type} · {bien.capacite} pers.</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {cfg.label}
                </span>
              </div>

              {/* Boutons statut */}
              <div className="grid grid-cols-2 gap-2 p-3">
                {STATUTS.map(({ key, icon, short }) => {
                  const s = STATUT_CONFIG[key]
                  const isActive = bien.statut === key
                  return (
                    <button
                      key={key}
                      disabled={isActive || isUpdating}
                      onClick={() => updateStatut(bien.id, key)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all
                        ${isActive
                          ? `${s.bg} ${s.color} ring-2 ring-offset-1 opacity-100`
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100 active:scale-95'
                        }
                        ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {icon}
                      {short}
                    </button>
                  )
                })}
              </div>

              {isUpdating && (
                <div className="px-4 pb-3 text-xs text-reagim-blue-light animate-pulse text-center">
                  Mise à jour en cours…
                </div>
              )}
            </div>
          )
        })}
      </main>
    </div>
  )
}
