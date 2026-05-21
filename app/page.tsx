import { supabase } from '@/lib/supabase'
import { Dashboard } from '@/components/Dashboard'
import { Bien, Reservation } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getBiens(): Promise<Bien[]> {
  const { data } = await supabase
    .from('biens')
    .select('*, aubergiste:aubergistes(id, nom, email, telephone)')
    .order('nom')
  return (data as Bien[]) ?? []
}

async function getReservations(): Promise<Reservation[]> {
  const now = new Date()
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const dans30j = new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString().split('T')[0]
  const { data } = await supabase
    .from('reservations')
    .select('*')
    .gte('date_depart', debutMois)
    .lte('date_arrivee', dans30j)
    .order('date_arrivee')
  return data ?? []
}

export default async function Home() {
  const [biens, reservations] = await Promise.all([getBiens(), getReservations()])
  return <Dashboard initialBiens={biens} initialReservations={reservations} />
}
