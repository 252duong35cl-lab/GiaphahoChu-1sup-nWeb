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

/* ── Event type helpers ───────────────────────────────────────────── */
const eventTypeConfig = {
  birthday: { icon: Cake, label: "Sinh nhật", color: "text-amber-600", bg: "bg-amber-50" },
  death_anniversary: { icon: Flower2, label: "Ngày giỗ", color: "text-purple-600", bg: "bg-purple-50" },
  custom_event: { icon: Star, label: "Sự kiện", color: "text-emerald-600", bg: "bg-emerald-50" },
};

export default async function DashboardLaunchpad() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Kiểm tra profile để xử lý trạng thái "Chờ duyệt" hoặc sai Family ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("status, family_id")
    .eq("id", user.id)
    .single();

  // Nếu không phải họ Chu hoặc chưa được duyệt, hiển thị giao diện giới hạn
  const isApproved = profile?.status === 'approved' && profile?.family_id === CURRENT_FAMILY_ID;
  const isAdmin = await getIsAdmin();

  /* ── Fetch data (Chỉ fetch nếu đã được duyệt) ─────────────────── */
  let upcomingEvents: any[] = [];
  let lunar = getTodayLunar();

  if (isApproved) {
    const { data: persons } = await supabase
      .from("persons")
      .select("id, full_name, birth_year, birth_month, birth_day, death_year, death_month, death_day, is_deceased");

    const { data: customEvents } = await supabase
      .from("custom_events")
      .select("id, name, content, event_date, location, created_by");

    const allEvents = computeEvents(persons ?? [], customEvents ?? []);
    upcomingEvents = allEvents.filter(e => e.daysUntil >= 0 && e.daysUntil <= 30);
  }

  /* ── Feature lists ────────────────────────────────────────────── */
  const publicFeatures = [
    {
      title: "Cây gia phả",
      description: "Xem và tương tác với sơ đồ dòng họ",
      icon: <Network className="size-8 text-amber-600" />,
      href: "/dashboard/members",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200/60",
      hoverColor: "hover:border-amber-400 hover:shadow-amber-100",
    },
    {
      title: "Tra cứu danh xưng",
      description: "Hệ thống gọi tên họ hàng chuẩn xác",
      icon: <GitMerge className="size-8 text-blue-600" />,
      href: "/dashboard/kinship",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200/60",
      hoverColor: "hover:border-blue-400 hover:shadow-blue-100",
    },
    {
      title: "Thống kê gia phả",
      description: "Tổng quan dữ liệu và biểu đồ phân tích",
      icon: <BarChart2 className="size-8 text-purple-600" />,
      href: "/dashboard/stats",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200/60",
      hoverColor: "hover:border-purple-400 hover:shadow-purple-100",
    },
  ];

  const adminFeatures = [
    { title: "Quản lý Người dùng", description: "Phê duyệt tài khoản và phân quyền", icon: <Users className="size-8 text-rose-600" />, href: "/dashboard/users", bgColor: "bg-rose-50", borderColor: "border-rose-200/60", hoverColor: "hover:border-rose-400 hover:shadow-rose-100" },
    { title: "Thứ tự gia phả", description: "Sắp xếp và xem cấu trúc hệ thống", icon: <Network className="size-8 text-indigo-600" />, href: "/dashboard/lineage", bgColor: "bg-indigo-50", borderColor: "border-indigo-200/60", hoverColor: "hover:border-indigo-400 hover:shadow-indigo-100" },
    { title: "Sao lưu & Phục hồi", description: "Xuất/Nhập dữ liệu toàn hệ thống", icon: <Database className="size-8 text-teal-600" />, href: "/dashboard/data", bgColor: "bg-teal-50", borderColor: "border-teal-200/60", hoverColor: "hover:border-teal-400 hover:shadow-teal-100" },
  ];

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      
      {/* 1. Hiển thị thông báo nếu CHƯA ĐƯỢC DUYỆT */}
      {!isApproved && (
        <div className="mb-10 p-6 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col items-center text-center">
          <ShieldAlert className="size-12 text-amber-600 mb-4" />
          <h2 className="text-xl font-bold text-amber-900 mb-2">Tài khoản chờ duyệt</h2>
          <p className="text-amber-700 max-w-md">
            Cảm ơn bạn đã đăng ký. Quản trị viên <b>Họ Chu</b> đang kiểm tra thông tin của bạn. 
            Vui lòng quay lại sau hoặc liên hệ qua Zalo để được hỗ trợ nhanh nhất.
          </p>
        </div>
      )}

      {/* 2. Today's Date & Upcoming Events (Chỉ hiện sự kiện nếu đã Approved) */}
      <Link
        href={isApproved ? "/dashboard/events" : "#"}
        className={`group relative block overflow-hidden rounded-3xl bg-white border border-stone-200/60 shadow-sm transition-all duration-300 ${isApproved ? 'hover:shadow-stone-100 hover:border-stone-400 hover:-translate-y-1' : 'cursor-default'} mb-10`}
      >
        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8 items-center">
          <div className="md:w-[35%] w-full flex flex-col items-center md:items-start text-center md:text-left gap-4 md:border-r border-stone-100 md:pr-8">
            <div className="size-16 rounded-2xl bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100 shadow-sm text-stone-600">
              <CalendarDays className="size-7" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-stone-800">{lunar.solarStr}</p>
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-50 border border-stone-100">
                <span className="text-sm font-semibold text-stone-700">{lunar.lunarDayStr}</span>
              </div>
            </div>
          </div>

          <div className="md:w-[65%] w-full flex-1">
            {isApproved && upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-stone-500 uppercase tracking-widest flex items-center gap-2.5">
                   Sự kiện 30 ngày tới ({upcomingEvents.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {upcomingEvents.slice(0, 4).map((evt, i) => {
                    const cfg = eventTypeConfig[evt.type];
                    const Icon = cfg.icon;
                    return (
                      <div key={i} className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-50/50 border border-transparent">
                        <div className={`size-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 shadow-sm`}><Icon className={`size-4 ${cfg.color}`} /></div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-semibold text-stone-700 truncate block">{evt.personName}</span>
                          <span className="text-xs text-stone-500 font-medium block">{evt.daysUntil === 0 ? "Hôm nay" : `${evt.daysUntil} ngày nữa`} · {evt.eventDateLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center text-stone-500 font-medium">
                {isApproved ? "Không có sự kiện nào sắp tới." : "Vui lòng đợi phê duyệt để xem dữ liệu gia phả."}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* 3. Feature Grid (Chỉ hiện Link nếu đã Approved) */}
      <div className="space-y-12">
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {publicFeatures.map((feat) => (
              isApproved ? (
                <Link key={feat.href} href={feat.href} className={`group flex flex-col p-6 rounded-2xl bg-white border ${feat.borderColor} ${feat.hoverColor} transition-all duration-300 hover:-translate-y-1 shadow-sm`}>
                  <div className={`size-14 rounded-xl flex items-center justify-center mb-5 ${feat.bgColor}`}>{feat.icon}</div>
                  <h4 className="text-lg font-bold text-stone-800 mb-2">{feat.title}</h4>
                  <p className="text-sm text-stone-500">{feat.description}</p>
                </Link>
              ) : (
                <div key={feat.href} className="flex flex-col p-6 rounded-2xl bg-stone-50 border border-stone-200 opacity-60 grayscale">
                  <div className="size-14 rounded-xl flex items-center justify-center mb-5 bg-stone-200">{feat.icon}</div>
                  <h4 className="text-lg font-bold text-stone-400 mb-2">{feat.title}</h4>
                  <p className="text-sm text-stone-400">Yêu cầu quyền truy cập</p>
                </div>
              )
            ))}
          </div>
        </section>

        {isAdmin && isApproved && (
          <section>
            <h3 className="text-xl font-serif font-bold text-rose-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-px bg-rose-200"></span> Quản trị viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {adminFeatures.map((feat) => (
                <Link key={feat.href} href={feat.href} className="group flex flex-col p-6 rounded-2xl bg-white border border-rose-200 hover:border-rose-400 transition-all duration-300 hover:-translate-y-1 shadow-sm">
                  <div className="size-14 rounded-xl flex items-center justify-center mb-5 bg-rose-50">{feat.icon}</div>
                  <h4 className="text-lg font-bold text-stone-800 mb-2 group-hover:text-rose-700">{feat.title}</h4>
                  <p className="text-sm text-stone-500">{feat.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Zalo Button remains fixed */}
      <a href="https://zalo.me/0908303639" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50">
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Chat Zalo" className="w-14 h-14 rounded-full shadow-lg hover:scale-110 transition" />
      </a>
    </main>
  );
}
