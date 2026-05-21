import { supabase } from '@/lib/supabase'
import { Dashboard } from '@/components/Dashboard'
import { Bien, Reservation } from '@/lib/types'

async function getBiens(): Promise<Bien[]> {
  const { data } = await supabase
    .from('biens')
    .select('*, aubergiste:aubergistes(id, nom, email, telephone)')
    .order('nom')
  return (data as Bien[]) ?? []
}

async function getReservations(): Promise<Reservation[]> {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('reservations')
    .select('*')
    .gte('date_depart', today)
    .order('date_arrivee')
  return data ?? []
}

export default async function Home() {
  const [biens, reservations] = await Promise.all([getBiens(), getReservations()])
  return <Dashboard initialBiens={biens} initialReservations={reservations} />
}
