import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-6 border-2 border-dashed border-slate-200 rounded-2xl max-w-md mx-auto font-sans select-none">
      <span className="text-4xl block mb-3 animate-bounce">{icon}</span>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
