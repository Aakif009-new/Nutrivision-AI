import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'text';
  count?: number;
}

export default function LoadingSkeleton({ variant = 'card', count = 1 }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === 'table') {
    return (
      <div className="w-full space-y-4 animate-skeleton">
        <div className="h-6 bg-slate-200 rounded-lg w-full" />
        <div className="h-10 bg-slate-100 rounded-lg w-full" />
        <div className="h-10 bg-slate-100 rounded-lg w-full" />
        <div className="h-10 bg-slate-100 rounded-lg w-full" />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className="space-y-2.5 animate-skeleton">
        <div className="h-4 bg-slate-200 rounded-md w-1/3" />
        <div className="h-3 bg-slate-100 rounded-md w-3/4" />
        <div className="h-3 bg-slate-100 rounded-md w-1/2" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-skeleton">
          <div className="h-40 bg-slate-100 rounded-xl w-full" />
          <div className="h-4 bg-slate-200 rounded-md w-1/2" />
          <div className="h-3 bg-slate-100 rounded-md w-3/4" />
        </div>
      ))}
    </div>
  );
}
