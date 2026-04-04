"use client";

export default function ZaloButton() {
  return (
    <a
      href="https://zalo.me/0908303639"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg transition-all">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
          alt="Zalo"
          className="w-6 h-6"
        />
        <span className="font-semibold">Chat Zalo</span>
      </div>
    </a>
  );
}
