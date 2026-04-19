import { supabase } from '../lib/supabase'

export async function getShibirs() {
  const { data, error } = await supabase
    .from('shibirs')
    .select('*')
    .order('start_date', { ascending: false })
  if (error) throw error
  return data
}

export async function createShibir(shibir: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('shibirs')
    .insert(shibir)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateShibir(id: string, patch: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('shibirs')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getShibirById(id: string) {
  const { data, error } = await supabase
    .from('shibirs')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}
