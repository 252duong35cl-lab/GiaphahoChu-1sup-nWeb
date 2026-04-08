import { getSupabase, getIsAdmin } from "@/utils/supabase/queries";
import { redirect } from "next/navigation";
import { ShieldAlert, Network, CalendarDays, BarChart2 } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Kiểm tra trạng thái dựa trên EMAIL (không dùng ID để tránh lệch)
  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("email", user.email)
    .single();

  // ĐIỀU KIỆN MỞ KHÓA TUYỆT ĐỐI
  const isApproved = user.email === "252duong35cl@gmail.com" || profile?.status === 'approved';
  const isAdmin = await getIsAdmin();

  if (!isApproved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-amber-50 text-center">
        <ShieldAlert className="size-16 text-amber-600 mb-4" />
        <h1 className="text-2xl font-bold text-amber-900">Tài khoản chưa được duyệt</h1>
        <p className="text-amber-700 mt-2 font-mono text-sm uppercase">{profile?.status || "PENDING"}</p>
        <p className="text-xs text-gray-400 mt-6">Email của bạn: {user.email}</p>
      </div>
    );
  }

  return (
    <main className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-stone-800 uppercase">Gia phả họ CHU</h1>
        {isAdmin && <span className="px-3 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-full">ADMIN</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/members" className="p-8 bg-white border rounded-[2rem] hover:shadow-lg transition-all">
          <Network className="size-10 text-amber-600 mb-4" />
          <h4 className="font-bold text-lg">Cây gia phả</h4>
        </Link>
        <Link href="/dashboard/events" className="p-8 bg-white border rounded-[2rem] hover:shadow-lg transition-all">
          <CalendarDays className="size-10 text-blue-600 mb-4" />
          <h4 className="font-bold text-lg">Sự kiện</h4>
        </Link>
        <Link href="/dashboard/stats" className="p-8 bg-white border rounded-[2rem] hover:shadow-lg transition-all">
          <BarChart2 className="size-10 text-purple-600 mb-4" />
          <h4 className="font-bold text-lg">Thống kê</h4>
        </Link>
      </div>
    </main>
  );
}
