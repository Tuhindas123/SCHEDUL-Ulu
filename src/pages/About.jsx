import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";

export default function About() {
  const [showMeme, setShowMeme] = useState(false);

  return (
    <AppShell>
      <div
        className="min-h-[80vh] flex items-center justify-center p-3 sm:p-5 relative bg-cover bg-center rounded-3xl overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(rgba(244,244,244,0.45), rgba(244,244,244,0.45)), url('/bg.jpg')",
        }}
      >
        <div className="max-w-3xl w-full bg-[#F4F4F4] rounded-[2.5rem] p-6 sm:p-12 shadow-xl flex flex-col md:flex-row items-center gap-5 sm:gap-10">
          {/* Photo */}
          <div className="w-full md:w-5/12 flex justify-center">
            <img
              src="/tuhin-photo.jpg"
              alt="Tuhin Das"
              className="w-44 h-52 sm:w-72 sm:h-80 object-cover rounded-3xl border-4 border-white shadow-md"
            />
          </div>

          {/* Content */}
          <div className="w-full md:w-7/12 flex flex-col justify-between space-y-5 sm:space-y-8">
            <div>
              <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-4">
                <img
                  src="/yellow-quotes.jpg"
                  alt=""
                  className="w-8 h-8 sm:w-12 sm:h-12 object-contain mix-blend-multiply -mt-1 sm:-mt-2"
                />
                <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-none">
                  Hello!
                </h1>
                <img
                  src="/green-quotes.jpg"
                  alt=""
                  className="w-8 h-8 sm:w-12 sm:h-12 object-contain mix-blend-multiply -mt-1 sm:-mt-2"
                />
              </div>

              <p className="text-base sm:text-xl font-medium text-gray-600 leading-relaxed">
                I'm <span className="font-bold text-black">Tuhin Das</span> — turning caffeine into
                strategy, business ideas into reality, and keeping the flow smooth.
              </p>
            </div>

            {/* Connect */}
            <div className="pt-4 sm:pt-5 border-t-2 border-gray-200">
              <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-gray-400 mb-3 sm:mb-4">
                Connect With Me
              </p>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=tuhindas085@gmail.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Email"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white transition-all shadow-sm border border-gray-200"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </a>

                <a
                  href="https://www.linkedin.com/in/tuhindas2004/"
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white transition-all shadow-sm border border-gray-200"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </a>

                <a
                  href="https://www.instagram.com/l_millennium_l/"
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white transition-all shadow-sm border border-gray-200"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                <a
                  href="https://www.facebook.com/TuhinDas333/"
                  target="_blank"
                  rel="noreferrer"
                  title="Facebook"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white transition-all shadow-sm border border-gray-200"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                <button
                  onClick={() => setShowMeme(true)}
                  title="Call Me"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-black hover:text-white transition-all shadow-sm border border-gray-200 cursor-pointer"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMeme && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
          onClick={() => setShowMeme(false)}
        >
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowMeme(false)}
              className="absolute -top-12 right-0 text-white font-bold text-lg hover:text-gray-300 transition-colors"
            >
              ✕ Close
            </button>
            <img
              src="/meme.jpg"
              alt="Meme"
              className="w-full h-auto rounded-xl shadow-2xl border-4 border-gray-800"
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
