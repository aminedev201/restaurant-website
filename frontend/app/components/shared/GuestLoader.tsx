// components/GuestLoader.tsx
'use client';

export default function GuestLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 transition-colors duration-300 z-[999] relative">
      <div className="flex flex-col items-center gap-8">

        {/* Spinner */}
        <div className="relative w-16 h-16">
          {/* Soft halo */}
          <div className="absolute inset-[-6px] rounded-full bg-amber-100 dark:bg-amber-900/20 animate-pulse" />
          {/* Outer spinning arc */}
          <svg
            className="absolute inset-0 w-full h-full animate-spin"
            style={{ animationDuration: '1.6s' }}
            viewBox="0 0 64 64"
          >
            <defs>
              <linearGradient id="guestGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#f59e0b" stopOpacity="1" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke="url(#guestGrad1)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="50 130"
            />
          </svg>
          {/* Inner counter-spinning arc */}
          <svg
            className="absolute inset-0 w-full h-full animate-spin"
            style={{ animationDuration: '2.4s', animationDirection: 'reverse' }}
            viewBox="0 0 64 64"
          >
            <defs>
              <linearGradient id="guestGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#fbbf24" stopOpacity="1" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle
              cx="32" cy="32" r="17"
              fill="none"
              stroke="url(#guestGrad2)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="25 85"
            />
          </svg>
          {/* Center fork & knife icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
          </div>
        </div>

        {/* Text + dots */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-400 dark:text-gray-500">
            Please wait
          </p>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500"
                style={{
                  animation: 'guestDot 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Skeleton bars — generic content hint, no dashboard grid */}
        <div className="w-64 space-y-2.5 opacity-30">
          {[1, 0.75, 0.9, 0.6].map((w, i) => (
            <div
              key={i}
              className="h-3 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"
              style={{
                width: `${w * 100}%`,
                animationDelay: `${i * 0.12}s`,
              }}
            />
          ))}
          <div className="pt-1 grid grid-cols-2 gap-2">
            {[0, 1].map(i => (
              <div
                key={i}
                className="h-8 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse"
                style={{ animationDelay: `${0.5 + i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes guestDot {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.35; }
          40%            { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  );
}