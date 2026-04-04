"use client";

import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

interface LandingHeroProps {
  siteName: string;
}

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export default function LandingHero({ siteName }: LandingHeroProps) {
  return (
    <motion.div
      className="max-w-5xl text-center space-y-12 w-full relative z-10 mx-auto"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* nền hoa văn gia phả */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <Network className="w-[600px] h-[600px] text-stone-700" />
      </div>

      <motion.div
        className="space-y-8 flex flex-col items-center relative z-10"
        variants={fadeIn}
      >
        {/* badge */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-amber-800 bg-white/70 rounded-full border border-amber-200 shadow-sm"
        >
          <Sparkles className="size-4 text-amber-500" />
          Nền tảng gia phả hiện đại & bảo mật
        </motion.div>

        {/* tiêu đề */}
        <h1 className="flex flex-col items-center text-center leading-tight">
          {/* icon họ tộc */}
          <Users className="mb-4 text-emerald-700 w-12 h-12" />

          {/* tên gia phả */}
          <span
            className="
            text-5xl
            sm:text-6xl
            md:text-7xl
            lg:text-[5rem]
            font-serif
            font-bold
            tracking-wide
            bg-gradient-to-r
            from-emerald-700
            via-teal-600
            to-cyan-700
            bg-clip-text
            text-transparent
          "
          >
            {siteName}
          </span>

          {/* địa danh */}
          <span className="mt-4 text-lg sm:text-xl md:text-2xl text-stone-700 font-semibold max-w-3xl">
  Thôn Khúc Lộng – Xã Nghĩa Trụ – Tỉnh Hưng Yên
</span>

          <span className="text-base sm:text-lg md:text-xl text-amber-700 font-medium whitespace-nowrap">
  (Xưa là Xóm Đọ – Thôn Vĩnh Khúc – Mỹ Văn – Văn Giang – Hưng Yên)
</span>
        </h1>

        {/* mô tả */}
        <p className="text-lg sm:text-xl md:text-2xl text-stone-600 max-w-2xl mx-auto leading-relaxed font-light">
          Gìn giữ và lưu truyền những giá trị, cội nguồn và truyền thống tốt
          đẹp của dòng họ cho các thế hệ mai sau.
        </p>
      </motion.div>

      {/* nút đăng nhập */}
      <motion.div
        className="pt-6 flex justify-center"
        variants={fadeIn}
      >
        <Link
          href="/login"
          className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-bold text-white bg-stone-900 rounded-2xl hover:bg-stone-800 transition-all duration-300"
        >
          Đăng nhập để xem gia phả
          <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      {/* tính năng */}
      <motion.div
        className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={staggerContainer}
      >
        {[
          {
            icon: <Users className="size-6 text-emerald-700" />,
            title: "Quản lý thành viên",
            desc: "Lưu trữ thông tin, tiểu sử và hình ảnh từng thành viên trong dòng họ.",
          },
          {
            icon: <Network className="size-6 text-emerald-700" />,
            title: "Sơ đồ gia phả",
            desc: "Hiển thị cây gia phả trực quan theo từng thế hệ.",
          },
          {
            icon: <ShieldCheck className="size-6 text-emerald-700" />,
            title: "Bảo mật dữ liệu",
            desc: "Thông tin được bảo vệ và phân quyền chặt chẽ.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={fadeIn}
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl border shadow-sm hover:shadow-lg transition-all"
          >
            <div className="mb-4">{item.icon}</div>

            <h3 className="text-xl font-bold mb-2">{item.title}</h3>

            <p className="text-stone-600">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
