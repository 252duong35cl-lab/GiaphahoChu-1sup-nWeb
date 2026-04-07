import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// ID chuẩn của họ Chu từ database của bạn
const CHU_FAMILY_ID = '2dae344e-f945-47f4-b640-775f80159e05';

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

  // Logic kiểm tra quyền truy cập Dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status, family_id")
      .eq("id", user.id)
      .single();

    // Nếu đã đúng họ Chu và trạng thái approved thì cho đi tiếp
    if (profile?.family_id === CHU_FAMILY_ID && profile?.status === 'approved') {
      return supabaseResponse;
    }
    
    // Nếu không, Middleware sẽ không chặn nhưng page.tsx sẽ hiển thị "Chờ duyệt"
  }

  return supabaseResponse;
}
