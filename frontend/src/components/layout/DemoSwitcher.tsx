'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Scan,
  CheckSquare,
  Lightbulb,
  History,
  TrendingUp,
  User,
  Settings
} from 'lucide-react';

interface SwitchItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export default function DemoSwitcher() {
  const pathname = usePathname();

  const switchItems: SwitchItem[] = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Login', path: '/login', icon: LogIn },
    { label: 'Register', path: '/signup', icon: UserPlus },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Scanner', path: '/scanner', icon: Scan },
    { label: 'Results', path: '/results', icon: CheckSquare },
    { label: 'Recs', path: '/recommendations', icon: Lightbulb },
    { label: 'History', path: '/history', icon: History },
    { label: 'Trends', path: '/analytics', icon: TrendingUp },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-lg md:max-w-2xl px-4 select-none">
      <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-2 shadow-2xl flex items-center justify-start overflow-x-auto no-scrollbar scroll-smooth gap-1 max-w-full">
        {switchItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className="relative px-3.5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors duration-150 flex items-center gap-1.5 whitespace-nowrap shrink-0 group outline-none"
            >
              {/* Highlight sliding background indicator */}
              {isActive && (
                <motion.div
                  layoutId="switcher-active"
                  className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 dark:border-emerald-500/30 rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              {/* Hover sliding bg overlay */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-slate-50 dark:bg-zinc-900 -z-10 transition-opacity duration-150" />

              <Icon
                className={`w-3.5 h-3.5 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-emerald-500' : 'text-slate-500 dark:text-zinc-400 group-hover:text-slate-800 dark:group-hover:text-zinc-200'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`transition-colors font-sans ${
                  isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-zinc-400 group-hover:text-slate-800 dark:group-hover:text-zinc-200'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
