'use client'

import { Bien, Reservation } from '@/lib/types'
import { useMemo } from 'react'

interface Props {
  biens: Bien[]
  reservations: Reservation[]
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(d: Date, days: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + days)
  return r
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

export function WeekCalendar({ biens, reservations }: Props) {
  const days = useMemo(() => {
    const today = startOfDay(new Date())
    return Array.from({ length: 7 }, (_, i) => addDays(today, i))
  }, [])

  function getCellState(bien: Bien, day: Date) {
    const reservation = reservations.find(r => {
      const arrival = startOfDay(new Date(r.date_arrivee))
      const departure = startOfDay(new Date(r.date_depart))
      return r.bien_id === bien.id && day >= arrival && day < departure
    })

    if (reservation) {
      const arrival = startOfDay(new Date(reservation.date_arrivee))
      return {
        type: 'booked' as const,
        client: reservation.client_nom,
        isCheckin: isSameDay(day, arrival),
      }
    }

    const checkout = reservations.find(r =>
      r.bien_id === bien.id && isSameDay(day, startOfDay(new Date(r.date_depart)))
    )

    if (checkout) {
      return { type: 'checkout' as const, client: checkout.client_nom }
    }

    // Statut manuel actif aujourd'hui (nettoyage/maintenance saisis par l'aubergiste)
    const isToday = isSameDay(day, new Date())
    if (isToday && bien.statut === 'nettoyage') {
      return { type: 'checkout' as const, client: 'Ménage en cours' }
    }
    if (isToday && bien.statut === 'maintenance') {
      return { type: 'maintenance' as const }
    }

    return { type: 'free' as const }
  }

  if (biens.length === 0) return null

  const today = new Date()
  const fin = days[6]
  const periodeLabel = `${today.getDate()} ${MOIS[today.getMonth()]} → ${fin.getDate()} ${MOIS[fin.getMonth()]}`

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center flex-wrap gap-2">
        <div>
          <p className="text-sm font-semibold text-reagim-text">Calendrier 7 jours</p>
          <p className="text-xs text-gray-400">{periodeLabel}</p>
        </div>
        <div className="flex gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-200 border-l-2 border-red-500" /> Réservé</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-200 border-l-2 border-amber-500" /> Ménage</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-50 border border-green-200" /> Libre</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 sticky left-0 bg-white z-10 w-44 border-b border-gray-100">
                Bien
              </th>
              {days.map((day, idx) => {
                const isToday = isSameDay(day, new Date())
                return (
                  <th
                    key={idx}
                    className={`text-center px-1 py-2.5 text-xs font-medium border-b border-gray-100 ${isToday ? 'bg-reagim-sky text-reagim-blue' : 'text-gray-500'}`}
                  >
                    <div>{JOURS[(day.getDay() + 6) % 7]}</div>
                    <div className="font-bold text-sm">{day.getDate()}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {biens.map((bien, i) => (
              <tr key={bien.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                <td className="px-4 py-2 sticky left-0 bg-inherit z-10 border-b border-gray-50">
                  <div className="text-sm font-medium text-reagim-text truncate max-w-40">{bien.nom}</div>
                  <div className="text-xs text-gray-400 truncate max-w-40">{bien.commune}</div>
                </td>
                {days.map((day, dIdx) => {
                  const cell = getCellState(bien, day)
                  return (
                    <td key={dIdx} className="p-1 border-b border-gray-50">
                      {cell.type === 'booked' && (
                        <div
                          className={`bg-red-100 rounded px-1.5 py-1 text-[10px] text-red-800 truncate font-medium ${cell.isCheckin ? 'border-l-4 border-red-600' : 'border-l-2 border-red-400'}`}
                          title={`${cell.client}${cell.isCheckin ? ' (arrivée)' : ''}`}
                        >
                          {cell.client}
                        </div>
                      )}
                      {cell.type === 'checkout' && (
                        <div
                          className="bg-amber-100 border-l-2 border-amber-500 rounded px-1.5 py-1 text-[10px] text-amber-800 truncate font-medium"
                          title={`Départ ${cell.client} — ménage à faire`}
                        >
                          Ménage
                        </div>
                      )}
                      {cell.type === 'maintenance' && (
                        <div
                          className="bg-gray-100 border-l-2 border-gray-500 rounded px-1.5 py-1 text-[10px] text-gray-700 truncate font-medium"
                          title="Bien en maintenance"
                        >
                          Maint.
                        </div>
                      )}
                      {cell.type === 'free' && (
                        <div className="bg-green-50 border border-green-200 rounded h-7" />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
