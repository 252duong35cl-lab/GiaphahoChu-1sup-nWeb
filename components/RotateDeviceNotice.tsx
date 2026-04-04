"use client";
import { useEffect, useState } from "react";

export default function RotateDeviceNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);

    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center text-white text-center p-6">
      <div>
        <div className="text-5xl mb-4">📱🔄</div>
        <h2 className="text-xl font-bold mb-2">
          Xoay ngang màn hình
        </h2>
        <p>
          Để xem cây gia phả đầy đủ hơn.
        </p>
      </div>
    </div>
  );
}
