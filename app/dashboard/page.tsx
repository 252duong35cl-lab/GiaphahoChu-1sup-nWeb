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

// ID chuẩn của họ Chu - Đã bọc trong trim() để an toàn tuyệt đối
const CURRENT_FAMILY_ID = '2dae344e-f945-47f4-b640-775f80159e05'.trim();

export default async function DashboardLaunchpad() {
  const supabase = await getSupabase();
  
  // 1. Kiểm tra session người dùng
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Lấy dữ liệu profile và quyền admin song song
  const [profileResult, isAdmin] = await Promise.all([
    supabase
      .from("profiles")
      .select("status, family_id")
      .eq("id", user.id)
      .single(),
    getIsAdmin()
  ]);

  const profile = profileResult.data;

  // 3. Logic kiểm duyệt linh hoạt (Xử lý cả trường hợp ID bị thừa dấu cách trong DB)
  const isApproved = 
    profile?.status === 'approved' && 
    profile?.family_id?.trim() === CURRENT_FAMILY_ID;

  /* ── XỬ LÝ DỮ LIỆU SỰ KIỆN ── */
  let upcomingEvents: any[] = [];
  const lunar = getTodayLunar();

  if (isApproved) {
    // Chỉ fetch dữ liệu nặng khi đã được duyệt
    const [{ data: persons }, { data: customEvents }] = await Promise.all([
      supabase.from("persons").select("id, full_name, birth_year, birth_month, birth_day, death_year, death_month, death_day, is_deceased"),
      supabase.from("custom_events").select("id, name, content, event_date, location, created_by")
    ]);

    const allEvents = computeEvents(persons ?? [], customEvents ?? []);
    // Lấy sự kiện trong vòng 30 ngày tới
    upcomingEvents = allEvents
      .filter(e => e.daysUntil >= 0 && e.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }

  const publicFeatures = [
    { title: "Cây gia phả", description: "Sơ đồ dòng họ", icon: <Network className="size-8 text-amber-600" />, href: "/dashboard/members", bgColor: "bg-amber-50" },
    { title: "Tra cứu danh xưng", description: "Gọi tên họ hàng", icon: <GitMerge className="size-8 text-blue-600" />, href: "/dashboard/kinship", bgColor: "bg-blue-50" },
    { title: "Thống kê", description: "Biểu đồ phân tích", icon: <BarChart2 className="size-8 text-purple-600" />, href: "/dashboard/stats", bgColor: "bg-purple-50" },
  ];

  const adminFeatures = [
    { title: "Người dùng", description: "Phê duyệt tài khoản", icon: <Users className="size-8 text-rose-600" />, href: "/dashboard/users" },
    { title: "Thứ tự", description: "Cấu trúc hệ thống", icon: <Network className="size-8 text-indigo-600" />, href: "/dashboard/lineage" },
    { title: "Dữ liệu", description: "Sao lưu/Phục hồi", icon: <Database className="size-8 text-teal-600" />, href: "/dashboard/data" },
  ];

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      
      {/* THÔNG BÁO CHỜ DUYỆT */}
      {!isApproved && (
        <div className="mb-10 p-8 rounded-3xl bg-white border-2 border-dashed border-amber-200 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
          <div className="size-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="size-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-black text-amber-900 mb-2">Đang kiểm tra quyền truy cập</h2>
          <p className="text-amber-700 max-w-md leading-relaxed">
            Tài khoản của bạn đang chờ quản trị viên <b>Họ Chu</b> xác nhận để bảo mật thông tin dòng họ.
          </p>
          <div className="mt-6 flex gap-2">
             <div className="size-2 bg-amber-400 rounded-full animate-bounce" />
             <div className="size-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
             <div className="size-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          </div>
        </div>
      )}

      {/* NỘI DUNG CHÍNH (LÀM MỜ NẾU CHƯA DUYỆT) */}
      <div className={`transition-all duration-1000 ${!isApproved ? 'opacity-30 grayscale blur-[2px] pointer-events-none select-none' : 'opacity-100'}`}>
        
        {/* Banner Sự Kiện */}
        <Link
          href="/dashboard/events"
          className="group relative block overflow-hidden rounded-3xl bg-white border border-stone-200/60 shadow-sm hover:shadow-xl transition-all mb-10"
        >
          <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-[30%] flex flex-col items-center md:items-start gap-4 md:border-r border-stone-100 md:pr-8">
              <div className="p-3 bg-stone-50 rounded-2xl group-hover:scale-110 transition-transform">
                <CalendarDays className="size-10 text-stone-600" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl font-black text-stone-800">{lunar.solarStr}</p>
                <p className="text-sm font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg mt-1 inline-block">
                  Âm lịch: {lunar.lunarDayStr}
                </p>
              </div>
            </div>

            <div className="md:w-[70%] w-full">
              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upcomingEvents.slice(0, 4).map((evt, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-stone-50/50 rounded-2xl border border-transparent hover:border-stone-200 transition-colors">
                      <div className="size-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        {evt.is_deceased ? <Flower2 className="size-5 text-purple-500" /> : <Cake className="size-5 text-amber-500" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-stone-800 truncate">{evt.personName}</p>
                        <p className="text-xs font-medium text-stone-500">
                          {evt.daysUntil === 0 ? "🌟 Hôm nay" : `⏳ Còn ${evt.daysUntil} ngày`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-stone-400 font-medium italic">Không có sự kiện gia đình nào trong tháng tới</p>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Các Tính Năng Công Khai */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publicFeatures.map((feat) => (
            <Link 
              key={feat.href} 
              href={feat.href} 
              className="group p-6 rounded-[2.5rem] bg-white border border-stone-200 hover:border-amber-400 hover:shadow-lg transition-all"
            >
              <div className={`size-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feat.bgColor}`}>
                {feat.icon}
              </div>
              <h4 className="font-black text-lg text-stone-800 mb-1">{feat.title}</h4>
              <p className="text-sm font-medium text-stone-500">{feat.description}</p>
            </Link>
          ))}
        </div>

        {/* Phần Dành Cho Quản Trị Viên */}
        {isAdmin && (
          <div className="mt-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex items-center gap-4 mb-8 px-2">
              <div className="h-px flex-1 bg-rose-100" />
              <h3 className="text-sm font-black uppercase tracking-widest text-rose-500">Khu vực quản trị</h3>
              <div className="h-px flex-1 bg-rose-100" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {adminFeatures.map((feat) => (
                <Link 
                  key={feat.href} 
                  href={feat.href} 
                  className="group p-6 rounded-[2.5rem] bg-rose-50/30 border border-rose-100 hover:border-rose-400 hover:bg-white hover:shadow-xl transition-all"
                >
                  <div className="size-14 rounded-2xl flex items-center justify-center mb-6 bg-white shadow-sm group-hover:rotate-6 transition-transform">
                    {feat.icon}
                  </div>
                  <h4 className="font-black text-lg text-stone-800 mb-1">{feat.title}</h4>
                  <p className="text-sm font-medium text-rose-400">{feat.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nút Hỗ Trợ Zalo */}
      <a 
        href="https://zalo.me/0908303639" 
        target="_blank" 
        className="fixed bottom-8 right-8 transition-all hover:scale-110 active:scale-95 z-50"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20" />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" 
            className="w-16 h-16 shadow-2xl rounded-full relative z-10" 
            alt="Zalo Support" 
          />
        </div>
      </a>
    </main>
  );
}
