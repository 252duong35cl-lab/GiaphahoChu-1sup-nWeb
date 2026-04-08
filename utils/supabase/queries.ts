import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

export const getSupabase = cache(async () => {
  return createClient()
})

export const getIsAdmin = cache(async () => {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
})
