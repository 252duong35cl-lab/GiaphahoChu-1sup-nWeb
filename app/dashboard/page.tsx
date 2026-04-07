import { getTodayLunar } from "@/utils/dateHelpers";
import { computeEvents } from "@/utils/eventHelpers";
import { getIsAdmin, getSupabase } from "@/utils/supabase/queries";
import {
  ArrowRight,
  BarChart2,
  Cake,
  CalendarDays,
  Database,
  Flower2,
  GitMerge,
  Network,
  Star,
  Users,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// ID chuẩn của họ Chu
const CURRENT_FAMILY_ID = '2dae344e-f945-47f4-b640-775f80159e05';

const eventTypeConfig = {
  birthday: { icon: Cake, label: "Sinh nhật", color: "text-amber-600", bg: "bg-amber-50" },
  death_anniversary: { icon: Flower2, label: "Ngày giỗ", color: "text-purple-600", bg: "bg-purple-50" },
  custom_event: { icon: Star, label: "Sự kiện", color: "text-emerald-600", bg: "bg-emerald-50" },
};

export default async function DashboardLaunchpad() {
  const supabase = await getSupabase();
  
  // 1. Lấy user từ session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Lấy profile và Admin status song song để tối ưu tốc độ build
  const [profileResult, isAdmin] = await Promise.all([
    supabase.from("profiles").select("status, family_id").eq("id", user.id).single(),
    getIsAdmin()
  ]);

  const profile = profileResult.data;

  // Logic kiểm tra phê duyệt
  const isApproved = profile?.status === 'approved' && profile?.family_id === CURRENT_FAMILY_ID;

  /* ── Fetch data sự kiện ── */
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

  const publicFeatures = [
    { title: "Cây gia phả", description: "Sơ đồ dòng họ", icon: <Network className="size-8 text-amber-600" />, href: "/dashboard/members", bgColor: "bg-amber-50", borderColor: "border-amber-200/60", hoverColor: "hover:border-amber-400" },
    { title: "Tra cứu danh xưng", description: "Gọi tên họ hàng", icon: <GitMerge className="size-8 text-blue-600" />, href: "/dashboard/kinship", bgColor: "bg-blue-50", borderColor: "border-blue-200/60", hoverColor: "hover:border-blue-400" },
    { title: "Thống kê", description: "Biểu đồ phân tích", icon: <BarChart2 className="size-8 text-purple-600" />, href: "/dashboard/stats", bgColor: "bg-purple-50", borderColor: "border-purple-200/60", hoverColor: "hover:border-purple-400" },
  ];

  const adminFeatures = [
    { title: "Người dùng", description: "Phê duyệt tài khoản", icon: <Users className="size-8 text-rose-600" />, href: "/dashboard/users", bgColor: "bg-rose-50", borderColor: "border-rose-200/60" },
    { title: "Thứ tự", description: "Cấu trúc hệ thống", icon: <Network className="size-8 text-indigo-600" />, href: "/dashboard/lineage", bgColor: "bg-indigo-50", borderColor: "border-indigo-200/60" },
    { title: "Dữ liệu", description: "Sao lưu/Phục hồi", icon: <Database className="size-8 text-teal-600" />, href: "/dashboard/data", bgColor: "bg-teal-50", borderColor: "border-teal-200/60" },
  ];

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      
      {!isApproved && (
        <div className="mb-10 p-6 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col items-center text-center animate-in fade-in slide-in-from-top-4 duration-500">
          <ShieldAlert className="size-12 text-amber-600 mb-4" />
          <h2 className="text-xl font-bold text-amber-900 mb-2">Tài khoản chờ duyệt</h2>
          <p className="text-amber-700 max-w-md">
            Quản trị viên <b>Họ Chu</b> đang kiểm tra thông tin của bạn. Vui lòng quay lại sau.
          </p>
        </div>
      )}

      <div className={`transition-all duration-700 ${!isApproved ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
        <Link
          href="/dashboard/events"
          className="group relative block overflow-hidden rounded-3xl bg-white border border-stone-200/60 shadow-sm hover:shadow-md transition-all mb-10"
        >
          <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center">
            <div className="md:w-[35%] flex flex-col items-center md:items-start gap-4 md:border-r border-stone-100 md:pr-8">
              <CalendarDays className="size-10 text-stone-600" />
              <div>
                <p className="text-xl font-bold text-stone-800">{lunar.solarStr}</p>
                <p className="text-sm font-semibold text-stone-500">Âm lịch: {lunar.lunarDayStr}</p>
              </div>
            </div>

            <div className="md:w-[65%] w-full">
              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {upcomingEvents.slice(0, 4).map((evt, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-stone-50 rounded-xl">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate">{evt.personName}</p>
                        <p className="text-xs text-stone-500">{evt.daysUntil === 0 ? "Hôm nay" : `${evt.daysUntil} ngày nữa`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-center text-stone-400">Không có sự kiện sắp tới</p>}
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publicFeatures.map((feat) => (
            <Link key={feat.href} href={feat.href} className="p-6 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 transition-all shadow-sm">
              <div className={`size-12 rounded-xl flex items-center justify-center mb-4 ${feat.bgColor}`}>{feat.icon}</div>
              <h4 className="font-bold text-stone-800">{feat.title}</h4>
              <p className="text-xs text-stone-500">{feat.description}</p>
            </Link>
          ))}
        </div>

        {isAdmin && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-rose-800 mb-6 px-2">Quản trị viên</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {adminFeatures.map((feat) => (
                <Link key={feat.href} href={feat.href} className="p-6 rounded-2xl bg-white border border-rose-100 hover:border-rose-300 transition-all">
                  <div className="size-12 rounded-xl flex items-center justify-center mb-4 bg-rose-50">{feat.icon}</div>
                  <h4 className="font-bold text-stone-800">{feat.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <a href="https://zalo.me/0908303639" target="_blank" className="fixed bottom-6 right-6 transition-transform hover:scale-110">
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" className="w-14 h-14 shadow-lg rounded-full" alt="Zalo" />
      </a>
    </main>
  );
}
