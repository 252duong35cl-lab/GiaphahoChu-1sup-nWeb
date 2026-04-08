import { getTodayLunar } from "@/utils/dateHelpers";
import { computeEvents } from "@/utils/eventHelpers";
import { getIsAdmin, getSupabase } from "@/utils/supabase/queries";
export const revalidate = 0;
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

// ID chuẩn của họ Chu - Thêm trim() để chống lỗi khoảng trắng
const CURRENT_FAMILY_ID = '2dae344e-f945-47f4-b640-775f80159e05'.trim();

export default async function DashboardLaunchpad() {
  const supabase = await getSupabase();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileResult, isAdmin] = await Promise.all([
    supabase.from("profiles").select("status, family_id").eq("id", user.id).single(),
    getIsAdmin()
  ]);

  const profile = profileResult.data;

  // SỬA LỖI Ở ĐÂY: Thêm dấu ? và trim() để chắc chắn so sánh đúng
  const isApproved = profile?.status === 'approved' && 
                     profile?.family_id?.trim() === CURRENT_FAMILY_ID;

  let upcomingEvents: any[] = [];
  const lunar = getTodayLunar();

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
      {/* Nếu chưa duyệt, hiện thông báo này */}
      {!isApproved && (
        <div className="mb-10 p-6 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col items-center text-center">
          <ShieldAlert className="size-12 text-amber-600 mb-4" />
          <h2 className="text-xl font-bold text-amber-900 mb-2">Tài khoản chờ duyệt</h2>
          <p className="text-amber-700">Vui lòng liên hệ quản trị viên.</p>
          {/* Debug: Hiện ID để bạn kiểm tra xem có khớp không */}
          <p className="text-[10px] mt-4 text-gray-400">ID DB: {profile?.family_id} | ID Code: {CURRENT_FAMILY_ID}</p>
        </div>
      )}

      {/* Nội dung Dashboard - Chỉ mờ đi chứ không mất hẳn để bạn biết là đã vào được web */}
      <div className={!isApproved ? "opacity-40 pointer-events-none" : ""}>
         <h1 className="text-2xl font-bold mb-4">Dashboard Gia Phả</h1>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border rounded-xl">Cây gia phả</div>
            <div className="p-4 bg-white border rounded-xl">Sự kiện</div>
            <div className="p-4 bg-white border rounded-xl">Thành viên</div>
         </div>
         {isAdmin && <div className="mt-8 p-4 bg-rose-50 border border-rose-200 rounded-xl">Quản trị viên</div>}
      </div>
    </main>
  );
}
