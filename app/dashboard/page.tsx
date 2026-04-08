import { getTodayLunar } from "@/utils/dateHelpers";
import { computeEvents } from "@/utils/eventHelpers";
import { getIsAdmin, getSupabase } from "@/utils/supabase/queries";
import {
  Cake,
  CalendarDays,
  Database,
  Flower2,
  GitMerge,
  Network,
  Star,
  Users,
  ShieldAlert,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Ép Next.js luôn lấy dữ liệu mới nhất từ Supabase, không dùng cache cũ
export const revalidate = 0;

// ID chuẩn của họ Chu
const CURRENT_FAMILY_ID = '2dae344e-f945-47f4-b640-775f80159e05';

export default async function DashboardLaunchpad() {
  const supabase = await getSupabase();
  
  // 1. Lấy thông tin user hiện tại
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Lấy profile và quyền admin cùng lúc
  const [profileResult, isAdmin] = await Promise.all([
    supabase.from("profiles").select("status, family_id").eq("id", user.id).single(),
    getIsAdmin()
  ]);

  const profile = profileResult.data;

  /**
   * LOGIC KIỂM TRA QUYỀN TRUY CẬP:
   * 1. Status phải là 'approved'
   * 2. family_id trong DB phải khớp với ID họ Chu (Dùng trim() để loại bỏ dấu cách thừa)
   */
  const isApproved = profile?.status === 'approved' && 
                     profile?.family_id?.trim() === CURRENT_FAMILY_ID.trim();

  let upcomingEvents: any[] = [];
  const lunar = getTodayLunar();

  // Chỉ lấy dữ liệu sự kiện nếu tài khoản đã được duyệt
  if (isApproved) {
    const [{ data: persons }, { data: customEvents }] = await Promise.all([
      supabase.from("persons").select("id, full_name, birth_year, birth_month, birth_day, death_year, death_month, death_day, is_deceased"),
      supabase.from("custom_events").select("id, name, content, event_date, location, created_by")
    ]);
    const allEvents = computeEvents(persons ?? [], customEvents ?? []);
    upcomingEvents = allEvents.filter(e => e.daysUntil >= 0 && e.daysUntil <= 30);
  }

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      
      {/* THÔNG BÁO CHỜ DUYỆT */}
      {!isApproved && (
        <div className="mb-10 p-10 rounded-[3rem] bg-amber-50 border border-amber-200 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
          <ShieldAlert className="size-16 text-amber-600 mb-6" />
          <h2 className="text-2xl font-black text-amber-900 mb-2">Tài khoản chưa được kích hoạt</h2>
          <p className="text-amber-700 max-w-md">
            Hệ thống ghi nhận trạng thái: <b className="uppercase">{profile?.status || "N/A"}</b>. 
            Vui lòng đợi quản trị viên họ Chu phê duyệt.
          </p>
          
          {/* Dòng Debug này giúp bạn soi lỗi tại chỗ */}
          <div className="mt-8 p-3 bg-white/50 rounded-2xl text-[10px] font-mono text-stone-400">
            <p>ID DB: {profile?.family_id || "Trống"}</p>
            <p>ID Code: {CURRENT_FAMILY_ID}</p>
          </div>
        </div>
      )}

      {/* NỘI DUNG DASHBOARD */}
      <div className={`transition-all duration-700 ${!isApproved ? 'opacity-20 grayscale blur-[1px] pointer-events-none' : 'opacity-100'}`}>
         <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-black text-stone-800">Gia phả họ CHU</h1>
              <p className="text-stone-500 font-medium">Hôm nay: {lunar.solarStr} (Âm lịch: {lunar.lunarDayStr})</p>
            </div>
            {isAdmin && <span className="px-4 py-1 bg-rose-100 text-rose-600 text-xs font-bold rounded-full">ADMIN</span>}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard/members" className="p-8 bg-white border border-stone-200 rounded-[2rem] hover:border-amber-500 transition-all shadow-sm group">
              <Network className="size-10 text-amber-600 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-lg">Cây gia phả</h4>
              <p className="text-sm text-stone-500">Xem sơ đồ tổ chức dòng họ</p>
            </Link>

            <Link href="/dashboard/events" className="p-8 bg-white border border-stone-200 rounded-[2rem] hover:border-blue-500 transition-all shadow-sm group">
              <CalendarDays className="size-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-lg">Sự kiện</h4>
              <p className="text-sm text-stone-500">Ngày giỗ, sinh nhật sắp tới</p>
            </Link>

            <Link href="/dashboard/stats" className="p-8 bg-white border border-stone-200 rounded-[2rem] hover:border-purple-500 transition-all shadow-sm group">
              <BarChart2 className="size-10 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-lg">Thống kê</h4>
              <p className="text-sm text-stone-500">Phân tích dữ liệu thành viên</p>
            </Link>
         </div>

         {isAdmin && (
           <div className="mt-12 p-8 bg-stone-900 rounded-[2.5rem] text-white">
              <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className="size-6 text-rose-500" />
                <h3 className="text-lg font-bold">Bảng điều khiển quản trị</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dashboard/users" className="p-4 bg-stone-800 rounded-2xl hover:bg-stone-700 transition-colors text-center text-sm font-bold">Người dùng</Link>
                <Link href="/dashboard/lineage" className="p-4 bg-stone-800 rounded-2xl hover:bg-stone-700 transition-colors text-center text-sm font-bold">Thứ tự</Link>
                <Link href="/dashboard/data" className="p-4 bg-stone-800 rounded-2xl hover:bg-stone-700 transition-colors text-center text-sm font-bold">Dữ liệu</Link>
              </div>
           </div>
         )}
      </div>
    </main>
  );
}
