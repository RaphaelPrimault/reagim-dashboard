'use client'

import { MapPin, Waves } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-reagim-blue text-white shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">Réagim</span>
            <span className="hidden sm:inline text-white/60 text-sm ml-2">— Île de Ré</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <MapPin className="w-4 h-4" />
          <span className="hidden sm:inline">Tableau de bord</span>
        </div>
      </div>
    </header>
  )
}
