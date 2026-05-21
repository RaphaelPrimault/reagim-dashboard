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
  const today = new Date()
  const in7days = new Date(today)
  in7days.setDate(in7days.getDate() + 14)
  const { data } = await supabase
    .from('reservations')
    .select('*')
    .gte('date_depart', today.toISOString().split('T')[0])
    .lte('date_arrivee', in7days.toISOString().split('T')[0])
    .order('date_arrivee')
  return data ?? []
}

export default async function Home() {
  const [biens, reservations] = await Promise.all([getBiens(), getReservations()])
  return <Dashboard initialBiens={biens} initialReservations={reservations} />
}
