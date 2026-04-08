import { getSupabase, getIsAdmin } from "@/utils/supabase/queries";
import { ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";

// ID chuẩn của họ Chu
const CURRENT_FAMILY_ID = '2dae344e-f945-47f4-b640-775f80159e05';

export default async function DashboardPage() {
  const supabase = await getSupabase();
  
  // 1. Lấy user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Lấy profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("status, family_id")
    .eq("id", user.id)
    .single();

  // 3. KIỂM TRA QUYỀN (Nếu status là approved thì cho vào luôn)
  const isApproved = profile?.status === 'approved';
  const isAdmin = await getIsAdmin();

  return (
    <main className="p-8">
      {!isApproved ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <ShieldAlert className="size-16 text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold">Tài khoản đang chờ duyệt</h1>
          <p className="text-gray-500">Vui lòng liên hệ quản trị viên Họ Chu.</p>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-6">Chào mừng bạn đến với Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h2 className="font-bold">Dòng họ: Họ Chu</h2>
              <p>Trạng thái: Đã phê duyệt</p>
            </div>
            {isAdmin && (
              <div className="p-6 bg-rose-50 rounded-xl border border-rose-200">
                <h2 className="font-bold text-rose-700">Quyền: Quản trị viên</h2>
                <p className="text-rose-600">Bạn có thể quản lý thành viên.</p>
              </div>
            )}
          </div>
          {/* Bạn có thể thêm các Link dẫn đến /members, /stats ở đây */}
        </div>
      )}
    </main>
  );
}
