import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Statut } from './types'

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
