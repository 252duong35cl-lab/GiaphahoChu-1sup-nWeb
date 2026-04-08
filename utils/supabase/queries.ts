import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

// Hàm khởi tạo client chuẩn, không nhận tham số để tránh lỗi arguments
export const getSupabase = cache(async () => {
  return createClient()
})

// Khôi phục hàm getUser mà layout.tsx đang gọi
export const getUser = cache(async () => {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

// Khôi phục hàm getProfile mà dashboard và members đang gọi
export const getProfile = cache(async () => {
  const supabase = await getSupabase()
  const user = await getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return data
})

// Hàm kiểm tra quyền Admin
export const getIsAdmin = cache(async () => {
  const profile = await getProfile()
  return profile?.role === 'admin'
})
