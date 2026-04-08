import { getTodayLunar } from "@/utils/dateHelpers";
import { computeEvents } from "@/utils/eventHelpers";
import { getIsAdmin, getSupabase } from "@/utils/supabase/queries";
import { ShieldAlert, Network, CalendarDays, BarChart2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const revalidate = 0; // Chống cache tuyệt đối

export default async function DashboardLaunchpad() {
  const supabase = await getSupabase();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Lấy profile - Quan trọng: Kiểm tra xem có ra dữ liệu không
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("status, family_id, email, id")
    .eq("id", user.id)
    .single();

  // ĐIỀU KIỆN MỞ KHÓA: Chỉ cần status là approved
  const isApproved = profile?.status === 'approved';

  const lunar = getTodayLunar();

  return (
    <main className="p-8 max-w-7xl mx-auto w-full">
      {!isApproved ? (
        <div className="flex flex-col items-center text-center p-10 bg-amber-50 rounded-[3rem] border border-amber-200">
          <ShieldAlert className="size-16 text-amber-600 mb-4" />
          <h2 className="text-2xl font-bold text-amber-900">Vẫn đang chờ duyệt...</h2>
          
          {/* BẢNG SOI LỖI - BẠN HÃY CHỤP ẢNH PHẦN NÀY GỬI TÔI */}
          <div className="mt-6 p-4 bg-white rounded-2xl text-left text-xs font-mono border border-amber-100 shadow-sm w-full max-w-lg overflow-auto">
            <p className="text-blue-600 font-bold mb-2 underline">THÔNG TIN THỰC TẾ TRÊN WEB:</p>
            <p>1. Email đang đăng nhập: <span className="text-red-500 font-bold">{user.email}</span></p>
            <p>2. ID người dùng (Auth): <span className="text-red-500 font-bold">{user.id}</span></p>
            <p>3. Trạng thái trong DB: <span className="text-red-500 font-bold">{profile?.status || "KHÔNG TÌM THẤY PROFILE"}</span></p>
            <p>4. ID trong bảng Profile: <span className="text-red-500 font-bold">{profile?.id || "N/A"}</span></p>
            <p>5. Lỗi truy vấn (nếu có): {error ? error.message : "Không lỗi"}</p>
          </div>
          
          <p className="mt-6 text-amber-700 text-sm italic">
            * Nếu mục 3 báo "KHÔNG TÌM THẤY", nghĩa là ID ở mục 2 chưa tồn tại trong bảng Profiles.
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-1000">
          <h1 className="text-3xl font-black mb-2 uppercase text-stone-800">Gia phả họ CHU</h1>
          <p className="text-stone-500 mb-8 font-medium">Hôm nay: {lunar.solarStr} ({lunar.lunarDayStr})</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="p-8 bg-white border border-stone-200 rounded-[2rem] font-bold shadow-sm">
                <Network className="size-8 text-amber-600 mb-2" />
                Cây gia phả
             </div>
             <div className="p-8 bg-white border border-stone-200 rounded-[2rem] font-bold shadow-sm">
                <CalendarDays className="size-8 text-blue-600 mb-2" />
                Sự kiện
             </div>
             <div className="p-8 bg-white border border-stone-200 rounded-[2rem] font-bold shadow-sm">
                <BarChart2 className="size-8 text-purple-600 mb-2" />
                Thành viên
             </div>
          </div>
        </div>
      )}
    </main>
  );
}
