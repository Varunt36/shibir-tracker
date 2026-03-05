import { supabase } from '../lib/supabase'

export async function getYouth() {
  const { data, error } = await supabase
    .from('youth')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function addYouth(youth: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('youth')
    .insert(youth)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateYouth(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('youth')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteYouth(id: string) {
  const { error } = await supabase
    .from('youth')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function bulkInsertYouth(youthArray: Record<string, unknown>[]) {
  const { data, error } = await supabase
    .from('youth')
    .insert(youthArray)
    .select()
  if (error) throw error
  return data
}
