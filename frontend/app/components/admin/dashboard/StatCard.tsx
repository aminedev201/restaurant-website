'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'amber' | 'emerald' | 'blue' | 'rose' | 'violet' | 'orange' | 'cyan' | 'pink';
  badge?: string;
}

const colorMap = {
  amber:   { bg: 'bg-amber-50 dark:bg-amber-950/30',   icon: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',  text: 'text-amber-600 dark:text-amber-400',  ring: 'ring-amber-200 dark:ring-amber-800' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-200 dark:ring-emerald-800' },
  blue:    { bg: 'bg-blue-50 dark:bg-blue-950/30',    icon: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',   text: 'text-blue-600 dark:text-blue-400',   ring: 'ring-blue-200 dark:ring-blue-800' },
  rose:    { bg: 'bg-rose-50 dark:bg-rose-950/30',    icon: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',   text: 'text-rose-600 dark:text-rose-400',   ring: 'ring-rose-200 dark:ring-rose-800' },
  violet:  { bg: 'bg-violet-50 dark:bg-violet-950/30',  icon: 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400', text: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-200 dark:ring-violet-800' },
  orange:  { bg: 'bg-orange-50 dark:bg-orange-950/30',  icon: 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-200 dark:ring-orange-800' },
  cyan:    { bg: 'bg-cyan-50 dark:bg-cyan-950/30',    icon: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400',   text: 'text-cyan-600 dark:text-cyan-400',   ring: 'ring-cyan-200 dark:ring-cyan-800' },
  pink:    { bg: 'bg-pink-50 dark:bg-pink-950/30',    icon: 'bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400',   text: 'text-pink-600 dark:text-pink-400',   ring: 'ring-pink-200 dark:ring-pink-800' },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color, badge }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`relative rounded-2xl p-5 ring-1 ${c.bg} ${c.ring} transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}>
      {badge && (
        <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${c.icon} ${c.text}`}>
          {badge}
        </span>
      )}
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 rounded-xl p-3 ${c.icon}`}>
          <Icon size={22} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 truncate">{title}</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white tabular-nums">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}