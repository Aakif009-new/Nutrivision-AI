'use client';

import React, { useState } from 'react';
import AppSidebar from '../../components/layout/AppSidebar';
import AppTopbar from '../../components/layout/AppTopbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* App Shell Sidebar (left / overlay drawer on mobile) */}
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main workspace container (right) */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopbar onMenuToggle={() => setSidebarOpen(true)} />
        
        {/* Render child pages */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto pb-24 md:pb-6 no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
