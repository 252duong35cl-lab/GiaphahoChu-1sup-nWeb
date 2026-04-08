import { getSupabase } from "@/utils/supabase/queries";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export const revalidate = 0; // Tắt cache để nhận dữ liệu Database ngay lập tức

export default async function DashboardPage() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Lấy profile bằng cả 2 cách để đảm bảo không sai sót
  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .or(`id.eq.${user.id},email.eq.${user.email}`) // Quét cả ID lẫn Email
    .limit(1)
    .single();

  // MỞ KHÓA TUYỆT ĐỐI: 
  // Nếu status là approved HOẶC email là admin của bạn thì cho vào luôn
  const isApproved = profile?.status === 'approved' || user.email === '252duong35cl@gmail.com';

  if (!isApproved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-amber-50">
        <ShieldAlert className="size-16 text-amber-600 mb-4" />
        <h1 className="text-2xl font-bold text-amber-900">Tài khoản chưa khớp dữ liệu</h1>
        <div className="mt-4 p-4 bg-white rounded-lg border text-left text-xs font-mono">
          <p>Email: {user.email}</p>
          <p>Status trong DB: {profile?.status || "Không tìm thấy"}</p>
        </div>
      </div>
    );
  }

  // Nếu đã qua bước check trên, trả về giao diện Dashboard của bạn
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Chào mừng bạn vào Dashboard Gia Phả</h1>
      {/* Nội dung dashboard cũ của bạn ở đây */}
    </div>
  );
}
