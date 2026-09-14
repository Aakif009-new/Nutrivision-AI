import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  colorClass?: string; // e.g. 'bg-emerald-500', 'bg-teal-500'
}

export default function ProgressBar({
  value,
  max,
  label,
  colorClass = 'bg-emerald-500',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className="w-full space-y-1.5 font-sans">
      {label && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 select-none">
          <span>{label}</span>
          <span className="text-slate-800">
            {value} / {max}
          </span>
        </div>
      )}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full progress-bar-fill ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
