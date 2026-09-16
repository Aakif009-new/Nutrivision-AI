import React from 'react';

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number; // width/height in px
  strokeWidth?: number;
  colorClass?: string;
  showText?: boolean;
}

export default function CircularProgress({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  colorClass = 'stroke-emerald-500',
  showText = true,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-100 fill-transparent"
          strokeWidth={strokeWidth}
        />
        {/* Fill track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`fill-transparent transition-all duration-300 ${colorClass}`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <div className="absolute flex flex-col items-center justify-center font-sans select-none">
          <span className="text-xl font-bold text-slate-800">{value}</span>
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            of {max} kcal
          </span>
        </div>
      )}
    </div>
  );
}
