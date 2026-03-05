import { supabase } from '../lib/supabase'

export async function getAttendance(shibirId: string) {
  const { data, error } = await supabase
    .from('shibir_attendance')
    .select('*, youth(id, name, phone, email)')
    .eq('shibir_id', shibirId)
  if (error) throw error
  return data
}

export async function upsertAttendance(shibirId: string, youthId: string, status: string) {
  const { error } = await supabase
    .from('shibir_attendance')
    .upsert(
      { shibir_id: shibirId, youth_id: youthId, status },
      { onConflict: 'shibir_id,youth_id' }
    )
  if (error) throw error
}

export async function initAttendanceForShibir(shibirId: string, youthIds: string[]) {
  const rows = youthIds.map((youthId: string) => ({
    shibir_id: shibirId,
    youth_id: youthId,
    status: 'unsure',
  }))
  const { error } = await supabase
    .from('shibir_attendance')
    .upsert(rows, { onConflict: 'shibir_id,youth_id', ignoreDuplicates: true })
  if (error) throw error
}
