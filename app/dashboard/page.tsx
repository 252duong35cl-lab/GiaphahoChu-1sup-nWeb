import { getUser, getProfile } from "@/utils/supabase/queries";
import { redirect } from "next/navigation";
import { ShieldAlert, Network, CalendarDays, BarChart2 } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);

  // CƠ CHẾ MỞ KHÓA: Nếu là email admin của bạn THÌ cho vào luôn
  const isApproved = user.email === "252duong35cl@gmail.com" || profile?.status === 'approved';

  if (!isApproved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-amber-50 text-center">
        <ShieldAlert className="size-16 text-amber-600 mb-4" />
        <h1 className="text-2xl font-bold text-amber-900">Tài khoản chưa khớp dữ liệu</h1>
        <p className="text-sm text-gray-500 mt-2">Hệ thống ghi nhận: {profile?.status || "Pending"}</p>
        <p className="text-xs text-gray-400 mt-4 font-mono">{user.email}</p>
      </div>
    );
  }

  return (
    <main className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-stone-800 uppercase">Gia phả họ CHU</h1>
        <p className="text-stone-500">Xin chào, {user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/members" className="p-8 bg-white border border-stone-200 rounded-[2rem] hover:shadow-xl transition-all">
          <Network className="size-10 text-amber-600 mb-4" />
          <h4 className="font-bold text-lg text-stone-800">Cây gia phả</h4>
        </Link>

        <Link href="/dashboard/events" className="p-8 bg-white border border-stone-200 rounded-[2rem] hover:shadow-xl transition-all">
          <CalendarDays className="size-10 text-blue-600 mb-4" />
          <h4 className="font-bold text-lg text-stone-800">Sự kiện</h4>
        </Link>

        <Link href="/dashboard/stats" className="p-8 bg-white border border-stone-200 rounded-[2rem] hover:shadow-xl transition-all">
          <BarChart2 className="size-10 text-purple-600 mb-4" />
          <h4 className="font-bold text-lg text-stone-800">Thành viên</h4>
        </Link>
      </div>
    </main>
  );
}
