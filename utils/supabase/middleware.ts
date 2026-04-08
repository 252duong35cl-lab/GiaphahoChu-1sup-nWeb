import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  // ... (giữ nguyên các nội dung khác bên trong hàm này)
  return response
}
