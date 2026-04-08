import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 1. Hàm middleware chính: Cho phép đi qua tất cả
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// 2. Hàm giả lập để sửa lỗi Build cho file proxy.ts
// Hàm này không làm gì cả, chỉ trả về response gốc để proxy.ts không bị lỗi import
export async function updateSession(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
