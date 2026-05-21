'use client'

import { Statut } from '@/lib/types'
import { STATUT_CONFIG, cn } from '@/lib/utils'

interface Props {
  statut: Statut
  size?: 'sm' | 'md'
}

export function StatusBadge({ statut, size = 'md' }: Props) {
  const config = STATUT_CONFIG[statut]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-full',
      config.color, config.bg,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  )
}
