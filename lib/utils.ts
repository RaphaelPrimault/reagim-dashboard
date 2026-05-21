import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Bien, Reservation, Statut } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STATUT_CONFIG: Record<Statut, { label: string; color: string; bg: string; pin: string }> = {
  disponible:  { label: 'Disponible',   color: 'text-green-700',  bg: 'bg-green-100',  pin: '#16A34A' },
  occupe:      { label: 'Occupé',       color: 'text-red-700',    bg: 'bg-red-100',    pin: '#DC2626' },
  nettoyage:   { label: 'Nettoyage',    color: 'text-amber-700',  bg: 'bg-amber-100',  pin: '#D97706' },
  maintenance: { label: 'Maintenance',  color: 'text-gray-600',   bg: 'bg-gray-100',   pin: '#6B7280' },
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export interface StatutEffectif {
  statut: Statut
  source: 'auto-reservation' | 'auto-nettoyage' | 'manuel'
  reservation?: Reservation
  message?: string
}

export function getStatutEffectif(bien: Bien, reservations: Reservation[]): StatutEffectif {
  const today = startOfDay(new Date())

  if (bien.statut === 'maintenance') {
    return { statut: 'maintenance', source: 'manuel' }
  }

  const reservationActive = reservations.find(r => {
    const arrival = startOfDay(new Date(r.date_arrivee))
    const departure = startOfDay(new Date(r.date_depart))
    return r.bien_id === bien.id && today >= arrival && today < departure
  })

  if (reservationActive) {
    return {
      statut: 'occupe',
      source: 'auto-reservation',
      reservation: reservationActive,
      message: `Occupé par ${reservationActive.client_nom} jusqu'au ${formatDate(reservationActive.date_depart)}`,
    }
  }

  if (bien.statut === 'nettoyage') {
    return { statut: 'nettoyage', source: 'manuel', message: 'Ménage en cours' }
  }

  const checkoutToday = reservations.find(r =>
    r.bien_id === bien.id && isSameDay(today, startOfDay(new Date(r.date_depart)))
  )

  if (checkoutToday && new Date(bien.updated_at) < startOfDay(new Date())) {
    return {
      statut: 'nettoyage',
      source: 'auto-nettoyage',
      reservation: checkoutToday,
      message: `Ménage requis — départ de ${checkoutToday.client_nom} ce matin`,
    }
  }

  return { statut: 'disponible', source: 'manuel' }
}
