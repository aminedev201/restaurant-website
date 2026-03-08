'use client';

export default function DashboardLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="flex flex-col items-center gap-8">

        {/* Animated logo mark */}
        <div className="relative w-20 h-20">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-amber-200 dark:border-amber-900 animate-pulse" />
          {/* Spinning arc */}
          <svg
            className="absolute inset-0 w-full h-full animate-spin"
            style={{ animationDuration: '1.4s' }}
            viewBox="0 0 80 80"
          >
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="url(#spinGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="60 160"
            />
            <defs>
              <linearGradient id="spinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          {/* Counter-spinning inner arc */}
          <svg
            className="absolute inset-0 w-full h-full animate-spin"
            style={{ animationDuration: '2.1s', animationDirection: 'reverse' }}
            viewBox="0 0 80 80"
          >
            <circle
              cx="40" cy="40" r="22"
              fill="none"
              stroke="url(#spinGrad2)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="30 110"
            />
            <defs>
              <linearGradient id="spinGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fb923c" stopOpacity="1" />
                <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-amber-400 dark:bg-amber-500 shadow-lg shadow-amber-400/50 dark:shadow-amber-500/40 animate-pulse" />
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-400 dark:text-gray-500">
            Loading Dashboard
          </p>
          {/* Animated dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500"
                style={{
                  animation: 'dashDot 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Skeleton preview — gives a sense of content coming */}
        <div className="w-72 space-y-3 opacity-40">
          <div className="grid grid-cols-3 gap-2">
            {[1, 0.7, 0.85].map((w, i) => (
              <div
                key={i}
                className="h-12 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <div
            className="h-24 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"
            style={{ animationDelay: '0.1s' }}
          />
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map(i => (
              <div
                key={i}
                className="h-14 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes dashDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}