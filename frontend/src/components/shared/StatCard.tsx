import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string; // e.g. '+3.2 vs last week'
  icon: React.ReactNode;
  iconBgClass?: string; // e.g. 'bg-emerald-500/10'
}

export default function StatCard({
  label,
  value,
  trend,
  icon,
  iconBgClass = 'bg-emerald-500/10',
}: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between font-sans transition-all duration-200 hover:shadow-md">
      <div className="space-y-1 select-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
          {label}
        </span>
        <span className="text-2xl font-bold text-slate-800 block">
          {value}
        </span>
        {trend && (
          <span className="text-xs font-semibold text-slate-500 block">
            {trend}
          </span>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${iconBgClass}`}>
        {icon}
      </div>
    </div>
  );
}
