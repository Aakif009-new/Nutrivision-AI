import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans select-none">
      <div className="text-center max-w-md space-y-6">
        <div className="relative">
          <span className="text-8xl font-bold text-slate-100 tracking-tight block">404</span>
          <span className="absolute inset-0 flex items-center justify-center text-5xl">🥗</span>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">Page not found</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            The page you are looking for does not exist or has been moved. Check the URL or use the switcher to return to dashboard.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/"
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-6 py-3 rounded-xl transition-all"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
