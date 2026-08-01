import React from 'react';
import { getScoreColor } from '../../utils/score';

interface ScoreBadgeProps {
  score: number;
  className?: string;
}

export default function ScoreBadge({ score, className = '' }: ScoreBadgeProps) {
  const colors = getScoreColor(score);
  
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none ${className}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.base}30`,
      }}
    >
      {colors.label} ({score})
    </span>
  );
}
