import { getTodayLunar } from "@/utils/dateHelpers";
import { computeEvents } from "@/utils/eventHelpers";
import { getIsAdmin, getSupabase } from "@/utils/supabase/queries";
import {
  Cake,
  CalendarDays,
  BarChart2,
  Network,
  ShieldAlert,
  Users,
  Database
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Ép làm mới dữ liệu, chống đứng hình ở trang "Chờ duyệt" cũ
export const revalidate = 0;

export default async function DashboardLaunchpad() {
  const supabase = await getSupabase();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Lấy dữ liệu profile từ Database
  const [profileResult, isAdmin] = await Promise.all([
    supabase.from("profiles").select("status, family_id").eq("id", user.id).single(),
    getIsAdmin()
  ]);

  const profile = profileResult.data;

  // LOGIC ĐƠN GIẢN NHẤT: Chỉ cần Database ghi 'approved' là vào luôn
  const isApproved = profile?.status === 'approved';

  const lunar = getTodayLunar();
  let upcomingEvents: any[] = [];

  if (isApproved) {
    const [{ data: persons }, { data: customEvents }] = await Promise.all([
      supabase.from("persons").select("*"),
      supabase.from("custom_events").select("*")
    ]);
    const allEvents = computeEvents(persons ?? [], customEvents ?? []);
    upcomingEvents = allEvents.filter(e => e.daysUntil >= 0 && e.daysUntil <= 30);
  }

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      
      {/* GIAO DIỆN KHI CHƯA ĐƯỢC DUYỆT */}
      {!isApproved && (
        <div className="mb-10 p-10 rounded-[3rem] bg-amber-50 border border-amber-200 flex flex-col items-center text-center">
          <ShieldAlert className="size-16 text-amber-600 mb-4" />
          <h2 className="text-2xl font-black text-amber-900">Tài khoản chờ duyệt</h2>
          <p className="text-amber-700 mt-2">Hệ thống đang ghi nhận trạng thái: <b>{profile?.status || 'NULL'}</b></p>
          <p className="text-xs text-stone-400 mt-4 italic">Gợi ý: Nếu bạn đã chỉnh Database thành approved mà vẫn thấy dòng này, hãy Log Out và đăng nhập lại bằng Tab ẩn danh.</p>
        </div>
      )}

      {/* GIAO DIỆN CHÍNH (MỜ KHI CHƯA DUYỆT) */}
      <div className={!isApproved ? "opacity-20 pointer-events-none grayscale" : "opacity-100"}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-stone-800 uppercase">Gia phả họ CHU</h1>
            <p className="text-stone-500 font-medium">Hôm nay: {lunar.solarStr} ({lunar.lunarDayStr})</p>
          </div>
          {isAdmin && <span className="px-4 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-full">QUẢN TRỊ VIÊN</span>}
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

        {/* KHU VỰC ADMIN */}
        {isAdmin && (
          <div className="mt-12 p-8 bg-stone-900 rounded-[2.5rem] text-white">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <ShieldAlert className="size-5 text-rose-500" /> Quản trị hệ thống
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/dashboard/users" className="p-4 bg-stone-800 rounded-2xl hover:bg-rose-600 transition-colors text-center text-sm font-bold">Duyệt User</Link>
              <Link href="/dashboard/lineage" className="p-4 bg-stone-800 rounded-2xl hover:bg-stone-700 transition-colors text-center text-sm font-bold">Thứ tự</Link>
              <Link href="/dashboard/data" className="p-4 bg-stone-800 rounded-2xl hover:bg-stone-700 transition-colors text-center text-sm font-bold">Dữ liệu</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
