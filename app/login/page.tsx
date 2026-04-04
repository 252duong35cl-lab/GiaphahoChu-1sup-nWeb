"use client";

import config from "@/app/config";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Info,
  KeyRound,
  Mail,
  Shield,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === config.demoDomain) {
        setIsDemo(true);
        setEmail("giaphaos@homielab.com");
        setPassword("giaphaos");
      }
    }
  }, []);

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [isLogin, setIsLogin] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        // --- XỬ LÝ ĐĂNG NHẬP ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        // --- XỬ LÝ ĐĂNG KÝ ---
        if (password !== confirmPassword) {
          setError("Mật khẩu xác nhận không khớp.");
          setLoading(false);
          return;
        }

        // Gửi thông tin đăng ký kèm theo family_id từ biến môi trường
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              family_id: process.env.NEXT_PUBLIC_FAMILY_ID as string,
            },
          },
        });

        if (error) {
          if (
            error.message.includes("relation") &&
            error.message.includes("does not exist")
          ) {
            router.push("/setup");
            return;
          }
          setError(error.message);
        } else if (data.user?.identities && data.user.identities.length === 0) {
          setError(
            "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác."
          );
        } else {
          // Nếu Supabase trả về session ngay (đã xác thực)
          if (data.session) {
            router.push("/dashboard");
            router.refresh();
          } else {
            // Thử đăng nhập ngay lập tức để vào dashboard
            const { data: signInData, error: signInError } =
              await supabase.auth.signInWithPassword({
                email,
                password,
              });

            if (!signInError && signInData.session) {
              router.push("/dashboard");
              router.refresh();
            } else {
              setSuccessMessage(
                "Đăng ký thành công! Vui lòng chờ admin kích hoạt tài khoản để xem nội dung."
              );
              setIsLogin(true);
              setConfirmPassword("");
              setPassword("");
            }
          }
        }
      }
    } catch (err) {
      setError("Đã xảy ra lỗi không xác định");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] select-none selection:bg-amber-200 selection:text-amber-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#fef3c7,transparent)] pointer-events-none"></div>

      <div className="absolute top-0 inset-x-0 h-screen overflow-hidden pointer-events-none flex justify-center">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-amber-300/20 rounded-full blur-[100px] mix-blend-multiply" />
        <div className="absolute bottom-[0%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-rose-200/20 rounded-full blur-[120px] mix-blend-multiply" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10 w-full">
        <motion.div
          className="max-w-md w-full bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="text-center mb-8 relative z-10">
            <Link
              href="/"
              className="inline-flex items-center justify-center p-3.5 bg-white rounded-2xl mb-5 shadow-sm ring-1 ring-stone-100 hover:scale-105 hover:shadow-md transition-all duration-300"
            >
              <Shield className="size-8 text-amber-600" />
            </Link>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              {isLogin ? "Đăng nhập" : "Đăng ký"}
            </h2>
            <p className="mt-3 text-sm text-stone-500 font-medium tracking-wide">
              {isLogin ? "Đăng nhập để truy cập gia phả." : "Tạo tài khoản thành viên mới."}
            </p>
          </div>

          <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-stone-600 mb-1.5 ml-1">Email</label>
                <div className="relative flex items-center group">
                  <Mail className="absolute left-3.5 size-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type="email"
                    required
                    className="bg-white/50 text-stone-900 block w-full rounded-xl border border-stone-200/80 pl-11 pr-4 py-3.5 outline-none focus:border-amber-400 focus:bg-white transition-all"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-stone-600 mb-1.5 ml-1">Mật khẩu</label>
                <div className="relative flex items-center group">
                  <KeyRound className="absolute left-3.5 size-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type="password"
                    required
                    className="bg-white/50 text-stone-900 block w-full rounded-xl border border-stone-200/80 pl-11 pr-4 py-3.5 outline-none focus:border-amber-400 focus:bg-white transition-all"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-[13px] font-semibold text-stone-600 mb-1.5 ml-1">Xác nhận mật khẩu</label>
                    <div className="relative flex items-center group">
                      <KeyRound className="absolute left-3.5 size-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                      <input
                        type="password"
                        required={!isLogin}
                        className="bg-white/50 text-stone-900 block w-full rounded-xl border border-stone-200/80 pl-11 pr-4 py-3.5 outline-none focus:border-amber-400 focus:bg-white transition-all"
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && <div className="text-red-700 text-[13px] text-center bg-red-50 p-3 rounded-xl">{error}</div>}
            {successMessage && <div className="text-teal-700 text-[13px] text-center bg-teal-50 p-3 rounded-xl">{successMessage}</div>}

            <div className="flex flex-col gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 text-[15px] font-bold rounded-xl text-white bg-stone-900 hover:bg-stone-800 transition-all disabled:opacity-70"
              >
                {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Tạo tài khoản"}
              </button>

              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="w-full text-sm font-semibold text-stone-600 hover:text-stone-900 py-3.5"
              >
                {isLogin ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer className="bg-transparent relative z-10 border-none mt-auto" />
    </div>
  );
}
