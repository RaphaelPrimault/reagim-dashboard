import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Réagim — Tableau de bord',
  description: 'Gestion des biens en temps réel — Île de Ré',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  )
}
