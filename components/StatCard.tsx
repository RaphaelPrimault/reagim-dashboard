'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  icon: LucideIcon
  color?: string
  subtitle?: string
}

export function StatCard({ label, value, icon: Icon, color = 'text-reagim-blue', subtitle }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={cn('p-3 rounded-lg bg-gray-50', color.replace('text-', 'text-'))}>
        <Icon className={cn('w-5 h-5', color)} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-reagim-text">{value}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  )
}
