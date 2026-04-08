import { getSupabase } from "@/utils/supabase/queries";
import { redirect } from "next/navigation";
import { ShieldAlert, Network, CalendarDays, BarChart2 } from "lucide-react";
import Link from "next/link";

// Tắt cache để đảm bảo dữ liệu luôn mới nhất
export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await getSupabase();
  
  // 1. Lấy thông tin user từ Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Lấy trạng thái từ bảng profiles dựa trên Email
  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("email", user.email)
    .single();

  // 3. ĐIỀU KIỆN MỞ KHÓA: Ưu tiên email admin của bạn
  const isApproved = user.email === "252duong35cl@gmail.com" || profile?.status === 'approved';

  if (!isApproved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-amber-50 text-center">
        <ShieldAlert className="size-16 text-amber-600 mb-4" />
        <h1 className="text-2xl font-bold text-amber-900">Tài khoản chờ duyệt</h1>
        <p className="text-amber-700 mt-2">Hệ thống đang ghi nhận trạng thái: <b>{profile?.status || 'Chưa có dữ liệu'}</b></p>
        <p className="text-sm text-gray-400 mt-6">Vui lòng liên hệ Admin hoặc thử Đăng xuất & Đăng nhập lại.</p>
      </div>
    );
  }

  // 4. GIAO DIỆN DASHBOARD KHI ĐÃ VÀO THÀNH CÔNG
  return (
    <main className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-stone-800 uppercase">Gia phả họ CHU</h1>
        <p className="text-stone-500 font-medium">Xin chào, {user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/members" className="p-8 bg-white border border-stone-200 rounded-[2rem] hover:shadow-xl transition-all group">
          <Network className="size-10 text-amber-600 mb-4 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-lg text-stone-800">Cây gia phả</h4>
          <p className="text-sm text-stone-500">Xem sơ đồ tổ chức dòng họ</p>
        </Link>

        <Link href="/dashboard/events" className="p-8 bg-white border border-stone-200 rounded-[2rem] hover:shadow-xl transition-all group">
          <CalendarDays className="size-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-lg text-stone-800">Sự kiện</h4>
          <p className="text-sm text-stone-500">Ngày giỗ, sinh nhật sắp tới</p>
        </Link>

        <Link href="/dashboard/stats" className="p-8 bg-white border border-stone-200 rounded-[2rem] hover:shadow-xl transition-all group">
          <BarChart2 className="size-10 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
          <h4 className="font-bold text-lg text-stone-800">Thống kê</h4>
          <p className="text-sm text-stone-500">Phân tích dữ liệu thành viên</p>
        </Link>
      </div>
    </main>
  );
}
