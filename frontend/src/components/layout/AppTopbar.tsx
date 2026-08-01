'use client';

import React from 'react';
import Link from 'next/link';

import { Leaf, Bell, Menu } from 'lucide-react';

interface AppTopbarProps {
  onMenuToggle?: () => void;
}

export default function AppTopbar({ onMenuToggle }: AppTopbarProps) {
  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl px-6 flex items-center justify-between md:justify-end shrink-0 font-sans">
      {/* Mobile menu trigger and brand logo (hidden on desktop) */}
      <div className="md:hidden flex items-center gap-2">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all outline-none"
            aria-label="Toggle Sidebar Menu"
          >
            <Menu className="w-4 h-4" strokeWidth={2.2} />
          </button>
        )}
        <Link href="/" className="flex items-center gap-2 ml-1">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-slate-800 text-sm tracking-tight">NutriVision AI</span>
        </Link>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4 select-none">
        <button className="w-8 h-8 bg-slate-100 hover:bg-slate-200/60 rounded-xl flex items-center justify-center text-sm relative transition-colors outline-none">
          <Bell className="w-4 h-4 text-slate-600" strokeWidth={2} />
          {/* Active notification indicator dot */}
          <span className="absolute top-[3px] right-[3px] w-2 h-2 bg-emerald-500 rounded-full border border-white" />
        </button>
        <span className="text-[10px] text-emerald-600 bg-emerald-500/10 border border-emerald-500/15 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
          Demo Sandbox
        </span>
      </div>
    </header>
  );
}
