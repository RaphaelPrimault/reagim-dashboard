export type Statut = 'disponible' | 'occupe' | 'nettoyage' | 'maintenance'

export interface Aubergiste {
  id: string
  nom: string
  email: string | null
  telephone: string | null
  created_at: string
}

export interface Bien {
  id: string
  nom: string
  adresse: string
  commune: string
  latitude: number
  longitude: number
  capacite: number
  type: 'maison' | 'appartement' | 'studio'
  statut: Statut
  aubergiste_id: string
  prix_semaine: number | null
  photo_url: string | null
  updated_at: string
  aubergiste?: Aubergiste
}

export interface Reservation {
  id: string
  bien_id: string
  client_nom: string
  client_email: string | null
  client_telephone: string | null
  date_arrivee: string
  date_depart: string
  statut: 'confirmee' | 'en_cours' | 'terminee' | 'annulee'
  created_at: string
  bien?: Bien
}

export interface StatsDashboard {
  total: number
  disponible: number
  occupe: number
  nettoyage: number
  maintenance: number
  tauxOccupation: number
}
