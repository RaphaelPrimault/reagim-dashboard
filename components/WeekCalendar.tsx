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
const JOURS_COURT = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

type CellState =
  | { type: 'booked'; client: string; isCheckin: boolean }
  | { type: 'checkout'; client: string }
  | { type: 'maintenance' }
  | { type: 'free' }

export function WeekCalendar({ biens, reservations }: Props) {
  const days = useMemo(() => {
    const today = startOfDay(new Date())
    return Array.from({ length: 7 }, (_, i) => addDays(today, i))
  }, [])

  function getCellState(bien: Bien, day: Date): CellState {
    const reservation = reservations.find(r => {
      const arrival = startOfDay(new Date(r.date_arrivee))
      const departure = startOfDay(new Date(r.date_depart))
      return r.bien_id === bien.id && day >= arrival && day < departure
    })

    if (reservation) {
      const arrival = startOfDay(new Date(reservation.date_arrivee))
      return {
        type: 'booked',
        client: reservation.client_nom,
        isCheckin: isSameDay(day, arrival),
      }
    }

    const checkout = reservations.find(r =>
      r.bien_id === bien.id && isSameDay(day, startOfDay(new Date(r.date_depart)))
    )

    if (checkout) return { type: 'checkout', client: checkout.client_nom }

    const isToday = isSameDay(day, new Date())
    if (isToday && bien.statut === 'nettoyage') return { type: 'checkout', client: 'Ménage en cours' }
    if (isToday && bien.statut === 'maintenance') return { type: 'maintenance' }

    return { type: 'free' }
  }

  if (biens.length === 0) return null

  const today = new Date()
  const fin = days[6]
  const periodeLabel = `${today.getDate()} ${MOIS[today.getMonth()]} → ${fin.getDate()} ${MOIS[fin.getMonth()]}`

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center flex-wrap gap-2">
        <div>
          <p className="text-sm font-semibold text-reagim-text">Calendrier 7 jours</p>
          <p className="text-xs text-gray-400">{periodeLabel}</p>
        </div>
        <div className="hidden md:flex gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-200 border-l-2 border-red-500" /> Réservé</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-200 border-l-2 border-amber-500" /> Ménage</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-50 border border-green-200" /> Libre</span>
        </div>
        <div className="flex md:hidden gap-2 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-400" /> Réservé</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400" /> Ménage</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-300" /> Libre</span>
        </div>
      </div>

      {/* MOBILE : cartes empilées avec mini frise */}
      <div className="md:hidden divide-y divide-gray-100">
        {biens.map(bien => {
          const cells = days.map(d => getCellState(bien, d))
          const todayCell = cells[0]
          const currentClient = cells.find(c => c.type === 'booked')?.client

          return (
            <div key={bien.id} className="p-4 active:bg-gray-50">
              <div className="flex justify-between items-start mb-3 gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-reagim-text truncate">{bien.nom}</p>
                  <p className="text-xs text-gray-400 truncate">{bien.commune}</p>
                </div>
                {todayCell.type !== 'free' && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0
                      ${todayCell.type === 'booked' ? 'bg-red-100 text-red-700' : ''}
                      ${todayCell.type === 'checkout' ? 'bg-amber-100 text-amber-700' : ''}
                      ${todayCell.type === 'maintenance' ? 'bg-gray-100 text-gray-700' : ''}
                    `}
                  >
                    Aujourd&apos;hui
                  </span>
                )}
              </div>

              {/* Frise 7 jours */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                  const cell = cells[i]
                  const isToday = isSameDay(day, new Date())
                  const bgColor =
                    cell.type === 'booked' ? 'bg-red-400' :
                    cell.type === 'checkout' ? 'bg-amber-400' :
                    cell.type === 'maintenance' ? 'bg-gray-400' :
                    'bg-green-200'

                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`text-[9px] font-medium mb-0.5 ${isToday ? 'text-reagim-blue font-bold' : 'text-gray-400'}`}>
                        {JOURS_COURT[(day.getDay() + 6) % 7]}
                      </div>
                      <div className={`text-xs font-semibold mb-1 ${isToday ? 'text-reagim-blue' : 'text-gray-700'}`}>
                        {day.getDate()}
                      </div>
                      <div className={`w-full h-2.5 rounded-sm ${bgColor} ${isToday ? 'ring-2 ring-reagim-blue/40 ring-offset-1' : ''}`} />
                    </div>
                  )
                })}
              </div>

              {/* Info contextuelle */}
              {currentClient && (
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <p className="text-xs text-gray-600 truncate">
                    <span className="font-medium text-red-700">{currentClient}</span>
                  </p>
                </div>
              )}
              {!currentClient && todayCell.type === 'checkout' && (
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <p className="text-xs text-amber-700 font-medium">Ménage requis aujourd&apos;hui</p>
                </div>
              )}
              {!currentClient && todayCell.type === 'free' && (
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="text-xs text-green-700 font-medium">Disponible cette semaine</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* DESKTOP : tableau Gantt classique */}
      <div className="hidden md:block overflow-x-auto">
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
