import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// ID DUY NHẤT CỦA HỌ CHU TRÊN WEB NÀY
const CURRENT_FAMILY_ID = '2dae344e-f945-47f4-b640-775f80159e05';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  // 1. Nếu chưa đăng nhập mà vào Dashboard -> Về Login
  if (isDashboard && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Nếu đã đăng nhập, kiểm tra quyền hạn
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status, family_id")
      .eq("id", user.id)
      .single();

    // Nếu vào Dashboard
    if (isDashboard) {
      // Nếu không đúng họ Chu HOẶC chưa được duyệt -> Không cho vào
      if (!profile || profile.family_id !== CURRENT_FAMILY_ID || profile.status !== 'approved') {
        // Chỉ cho phép ở lại trang dashboard để hiển thị thông báo "Chờ duyệt"
        // Hoặc bạn có thể tạo một route riêng /pending
        return supabaseResponse; 
      }
    }

    // Đã approved và đúng họ Chu mà vào Login -> Đẩy thẳng vào Dashboard
    if (isLoginPage && profile?.status === 'approved' && profile?.family_id === CURRENT_FAMILY_ID) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}
