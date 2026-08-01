'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Leaf } from 'lucide-react';

export default function NavBar() {
  const pathname = usePathname();

  const navLinks = [
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Privacy', path: '/privacy' },
  ];

  return (
    <header className="sticky top-0 z-50 h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex items-center px-6 justify-between font-sans">
      <Link href="/" className="flex items-center gap-2.5 group select-none">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-emerald-500/10">
          <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-slate-800 text-sm tracking-tight">
          NutriVision AI
        </span>
      </Link>

      {/* Nav Link Lists */}
      <nav className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`text-xs font-semibold select-none transition-colors ${
                isActive ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Auth Actions Buttons */}
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-xs font-bold text-slate-600 hover:text-slate-800 px-4 py-2 rounded-xl hover:bg-slate-100/60 transition-all select-none"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/15 hover:shadow-emerald-500/20 select-none"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}
