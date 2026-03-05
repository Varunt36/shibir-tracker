import { supabase } from '../lib/supabase'

export async function getPayments(shibirId: string) {
  const { data, error } = await supabase
    .from('shibir_payments')
    .select('*, youth(id, name)')
    .eq('shibir_id', shibirId)
  if (error) throw error
  return data
}

export async function upsertPayment(shibirId: string, youthId: string, amountPaid: number, notes = '') {
  const { error } = await supabase
    .from('shibir_payments')
    .upsert(
      { shibir_id: shibirId, youth_id: youthId, amount_paid: amountPaid, notes },
      { onConflict: 'shibir_id,youth_id' }
    )
  if (error) throw error
}

export async function initPaymentsForShibir(shibirId: string, youthIds: string[]) {
  const rows = youthIds.map((youthId: string) => ({
    shibir_id: shibirId,
    youth_id: youthId,
    amount_paid: 0,
  }))
  const { error } = await supabase
    .from('shibir_payments')
    .upsert(rows, { onConflict: 'shibir_id,youth_id', ignoreDuplicates: true })
  if (error) throw error
}
