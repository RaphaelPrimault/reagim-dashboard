'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bien, Reservation, Statut } from '@/lib/types'
import { STATUT_CONFIG, getStatutEffectif } from '@/lib/utils'
import { Waves, CheckCircle2, Wrench, Sparkles, AlertTriangle } from 'lucide-react'

export default function AubergistePage() {
  const [biens, setBiens] = useState<Bien[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      supabase.from('biens').select('*, aubergiste:aubergistes(id, nom)').order('nom'),
      supabase.from('reservations').select('*'),
    ]).then(([biensRes, resRes]) => {
      setBiens((biensRes.data as Bien[]) ?? [])
      setReservations((resRes.data as Reservation[]) ?? [])
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

  const biensEnrichis = biens.map(b => {
    const eff = getStatutEffectif(b, reservations)
    return { bien: b, statut: eff.statut, source: eff.source, message: eff.message }
  })

  const aFaire = biensEnrichis.filter(b => b.statut === 'nettoyage').length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-reagim-blue text-white px-4 py-4 shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Waves className="w-5 h-5" />
          <div className="flex-1">
            <p className="font-bold leading-tight">Réagim</p>
            <p className="text-xs text-white/60">Vue Aubergiste</p>
          </div>
          {aFaire > 0 && (
            <div className="bg-amber-400 text-amber-900 px-2 py-1 rounded-full text-xs font-bold">
              {aFaire} à faire
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full space-y-3">
        <div className="bg-reagim-sky border border-reagim-blue-light/20 rounded-xl p-3">
          <p className="text-xs text-reagim-text">
            <strong>Les statuts d&apos;occupation sont calculés automatiquement</strong> à partir des réservations. Tu n&apos;as plus qu&apos;à valider les ménages.
          </p>
        </div>

        {biensEnrichis.map(({ bien, statut, source, message }) => {
          const cfg = STATUT_CONFIG[statut]
          const isUpdating = updating === bien.id
          const isAuto = source !== 'manuel'

          return (
            <div key={bien.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex justify-between items-start mb-1">
                  <div className="min-w-0">
                    <p className="font-semibold text-reagim-text truncate">{bien.nom}</p>
                    <p className="text-xs text-gray-400">{bien.commune} · {bien.capacite} pers.</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${cfg.color} ${cfg.bg}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {cfg.label}
                  </span>
                </div>
                {message && (
                  <p className={`text-xs mt-1 ${isAuto ? 'text-reagim-blue-light' : 'text-gray-500'} italic`}>
                    {isAuto && '⚡ '}{message}
                  </p>
                )}
              </div>

              {/* Actions selon le statut */}
              <div className="p-3">
                {statut === 'occupe' && (
                  <p className="text-center text-xs text-gray-400 py-2">
                    Aucune action — le bien est occupé
                  </p>
                )}

                {statut === 'nettoyage' && (
                  <button
                    disabled={isUpdating}
                    onClick={() => updateStatut(bien.id, 'disponible')}
                    className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Bien prêt pour le prochain client
                  </button>
                )}

                {statut === 'disponible' && (
                  <div className="flex gap-2">
                    <button
                      disabled={isUpdating}
                      onClick={() => updateStatut(bien.id, 'nettoyage')}
                      className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-sm active:scale-95 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      Ménage en cours
                    </button>
                    <button
                      disabled={isUpdating}
                      onClick={() => updateStatut(bien.id, 'maintenance')}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium py-2.5 rounded-lg flex items-center justify-center gap-1.5 text-sm active:scale-95 transition-all"
                    >
                      <Wrench className="w-4 h-4" />
                      Maintenance
                    </button>
                  </div>
                )}

                {statut === 'maintenance' && (
                  <button
                    disabled={isUpdating}
                    onClick={() => updateStatut(bien.id, 'disponible')}
                    className="w-full bg-reagim-blue hover:bg-reagim-blue-light text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Remettre en service
                  </button>
                )}

                {isUpdating && (
                  <p className="mt-2 text-xs text-reagim-blue-light animate-pulse text-center">
                    Mise à jour…
                  </p>
                )}
              </div>
            </div>
          )
        })}

        {aFaire === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-800 font-medium">Tout est à jour !</p>
            <p className="text-xs text-green-600 mt-1">Aucun ménage en attente.</p>
          </div>
        )}
      </main>
    </div>
  )
}
