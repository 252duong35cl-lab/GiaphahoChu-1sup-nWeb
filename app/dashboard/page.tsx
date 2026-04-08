import { getSupabase, getUser, getProfile } from "@/utils/supabase/queries";
import { redirect } from "next/navigation";
import { ShieldAlert, Network, CalendarDays, BarChart2 } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const profile = await getProfile();

  // MỞ KHÓA BẰNG EMAIL: Chấp nhận cả trạng thái DB và email admin của bạn
  const isApproved = user.email === "252duong35cl@gmail.com" || profile?.status === 'approved';

  if (!isApproved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-amber-50 text-center">
        <ShieldAlert className="size-16 text-amber-600 mb-4" />
        <h1 className="text-2xl font-bold text-amber-900">Tài khoản chờ duyệt</h1>
        <p className="text-sm text-gray-500 mt-2">Email: {user.email}</p>
      </div>
    );
  }

  return (
    <main className="p-8 max-w-7xl mx-auto w-full">
      <h1 className="text-3xl font-black text-stone-800 uppercase mb-8">Gia phả họ CHU</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/members" className="p-8 bg-white border rounded-[2rem] shadow-sm hover:shadow-md transition-all">
          <Network className="size-10 text-amber-600 mb-4" />
          <h4 className="font-bold text-lg">Cây gia phả</h4>
        </Link>
        <Link href="/dashboard/events" className="p-8 bg-white border rounded-[2rem] shadow-sm hover:shadow-md transition-all">
          <CalendarDays className="size-10 text-blue-600 mb-4" />
          <h4 className="font-bold text-lg">Sự kiện</h4>
        </Link>
        <Link href="/dashboard/stats" className="p-8 bg-white border rounded-[2rem] shadow-sm hover:shadow-md transition-all">
          <BarChart2 className="size-10 text-purple-600 mb-4" />
          <h4 className="font-bold text-lg">Thành viên</h4>
        </Link>
      </div>
    </main>
  );
}
