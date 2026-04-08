import { Profile } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { cache } from "react";

/**
 * Tối ưu hóa Supabase Client cho Server Component
 * Sửa lỗi: "Expected 0 arguments, but got 1"
 * createClient() bản mới đã tự động xử lý cookies bên trong.
 */
export const getSupabase = cache(async () => {
  return createClient();
});

/**
 * Lấy thông tin User từ hệ thống Auth
 */
export const getUser = cache(async () => {
  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

/**
 * Lấy Profile chi tiết từ bảng 'profiles'
 * @param userId - ID người dùng (tùy chọn, nếu không có sẽ lấy user hiện tại)
 */
export const getProfile = cache(async (userId?: string) => {
  let id = userId;
  
  if (!id) {
    const user = await getUser();
    if (!user) return null;
    id = user.id;
  }

  const supabase = await getSupabase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  return profile as Profile | null;
});

/**
 * Kiểm tra quyền Quản trị viên (Admin)
 * Trả về true nếu role trong database là 'admin'
 */
export const getIsAdmin = cache(async () => {
  const profile = await getProfile();
  return profile?.role === "admin";
});
