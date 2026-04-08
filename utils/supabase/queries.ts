import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

export const getSupabase = cache(async () => {
  return createClient()
})

// Khôi phục nhận tham số userId để layout.tsx không bị lỗi build
export const getProfile = cache(async (userId?: string) => {
  const supabase = await getSupabase()
  
  // Nếu không truyền id, tự lấy user hiện tại
  let targetId = userId;
  if (!targetId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    targetId = user.id;
  }

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetId)
    .single()
    
  return data
})

export const getUser = cache(async () => {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export const getIsAdmin = cache(async () => {
  const profile = await getProfile()
  return profile?.role === 'admin'
})
