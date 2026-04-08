import { getTodayLunar } from "@/utils/dateHelpers";
import { getIsAdmin, getSupabase } from "@/utils/supabase/queries";
import { ShieldAlert, Network, CalendarDays, BarChart2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Ép làm mới dữ liệu mỗi khi load trang
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await getSupabase();
  
  // 1. Lấy thông tin user đang đăng nhập
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Lấy profile dựa trên EMAIL (Chính xác nhất lúc này)
  const { data: profile } = await supabase
    .from("profiles")
    .select("status, email")
    .eq("email", user.email)
    .single();

  // 3. KIỂM TRA QUYỀN
  // Chỉ cần status trong DB là 'approved' là cho vào luôn
  const isApproved = profile?.status === 'approved';
  const isAdmin = await getIsAdmin();
  const lunar = getTodayLunar();

  return (
    <main className="p-8 max-w-7xl mx-auto w-full">
      {!isApproved ? (
        <div className="flex flex-col items-center text-center p-10 bg-amber-50 rounded-[3rem] border border-amber-200">
          <ShieldAlert className="size-16 text-amber-600 mb-4" />
          <h2 className="text-2xl font-bold text-amber-900">Tài khoản chờ duyệt</h2>
          <p className="text-amber-700 mt-2">Email: <b>{user.email}</b></p>
          <p className="text-amber-700">Trạng thái hiện tại: <b>{profile?.status || "Chưa có Profile"}</b></p>
          <div className="mt-6 text-xs text-gray-400 p-4 bg-white rounded-xl border">
             Mẹo: Nếu đã chỉnh approved trong DB mà vẫn thấy dòng này, hãy nhấn Đăng Xuất rồi đăng nhập lại.
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-700">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black text-stone-800 uppercase">Gia phả họ CHU</h1>
              <p className="text-stone-500 font-medium italic">Hôm nay: {lunar.solarStr}</p>
            </div>
            {isAdmin && <span className="px-4 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-full shadow-sm">ADMIN</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard/members" className="p-8 bg-white border border-stone-200 rounded-[2rem] hover:shadow-lg transition-all group">
              <Network className="size-10 text-amber-600 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-lg text-stone-800">Cây gia phả</h4>
              <p className="text-sm text-stone-500">Xem sơ đồ tổ chức dòng họ</p>
            </Link>

            <Link href="/dashboard/events" className="p-8 bg-white border border-stone-200 rounded-[2rem] hover:shadow-lg transition-all group">
              <CalendarDays className="size-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-lg text-stone-800">Sự kiện</h4>
              <p className="text-sm text-stone-500">Ngày giỗ, sinh nhật sắp tới</p>
            </Link>

            <Link href="/dashboard/stats" className="p-8 bg-white border border-stone-200 rounded-[2rem] hover:shadow-lg transition-all group">
              <BarChart2 className="size-10 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-lg text-stone-800">Thống kê</h4>
              <p className="text-sm text-stone-500">Phân tích dữ liệu thành viên</p>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
