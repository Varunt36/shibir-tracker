import { supabase } from '../lib/supabase'

export async function getDashboardStats() {
  const [youthRes, shibirstRes, paymentsRes, attendanceRes] = await Promise.all([
    supabase.from('youth').select('id', { count: 'exact', head: true }),
    supabase.from('shibirs').select('*').gte('start_date', new Date().toISOString().split('T')[0]).order('start_date').limit(1),
    supabase.from('shibir_payments').select('amount_paid'),
    supabase.from('shibir_attendance').select('shibir_id, status, youth_id, shibirs(fee)').eq('status', 'coming'),
  ])

  const totalYouth = youthRes.count ?? 0
  const nextShibir = shibirstRes.data?.[0] ?? null
  const totalCollected = (paymentsRes.data ?? []).reduce((sum, p) => sum + Number(p.amount_paid), 0)
  const totalExpected = (attendanceRes.data ?? []).reduce((sum, a) => {
    const shibir = Array.isArray(a.shibirs) ? a.shibirs[0] : a.shibirs
    return sum + Number((shibir as { fee?: unknown } | null)?.fee ?? 0)
  }, 0)

  return {
    totalYouth,
    nextShibir,
    totalCollected,
    totalExpected,
    totalPending: totalExpected - totalCollected,
  }
}
