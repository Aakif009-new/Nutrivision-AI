'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Scan,
  CheckSquare,
  Lightbulb,
  History,
  TrendingUp,
  Settings,
  Leaf
} from 'lucide-react';

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AppSidebar({ isOpen = false, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Scanner', path: '/scanner', icon: Scan },
    { label: 'Results Grid', path: '/results', icon: CheckSquare },
    { label: 'AI Recs', path: '/recommendations', icon: Lightbulb },
    { label: 'Scans History', path: '/history', icon: History },
    { label: 'Analytics', path: '/analytics', icon: TrendingUp },
    { label: 'Profile Settings', path: '/profile', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar container panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 font-sans transition-transform duration-350 ease-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 border-b border-slate-200/60 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/10">
                <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-slate-800 text-sm tracking-tight">NutriVision AI</span>
            </div>
            {/* Close button on mobile sidebar top */}
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-650 transition-all outline-none"
              >
                ✕
              </button>
            )}
          </div>

          {/* Navigation list */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/15'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={2.2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile & Logout */}
        <div className="p-4 border-t border-slate-200/60 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 py-1.5 mb-3.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-sm select-none">
              {profile?.username ? profile.username[0].toUpperCase() : 'J'}
            </div>
            <div className="truncate text-left">
              <span className="block text-xs font-bold text-slate-800 truncate select-all">{profile?.username || 'Jordan'}</span>
              <span className="block text-[10px] text-slate-450 font-semibold truncate select-all">{profile?.email || 'jordan@example.com'}</span>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200/60 text-slate-500 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all select-none"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
