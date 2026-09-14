'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MOCK_SCANS } from '../../../lib/mock-data';
import StatCard from '../../../components/shared/StatCard';
import ProgressBar from '../../../components/shared/ProgressBar';
import CircularProgress from '../../../components/shared/CircularProgress';
import ScoreBadge from '../../../components/shared/ScoreBadge';
import {
  Leaf,
  Camera,
  Utensils,
  Heart,
  Zap,
  TrendingUp,
  Lightbulb,
  History,
  Brain
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  // Get current date greeting
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const recentScans = MOCK_SCANS.slice(0, 4);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden select-none">
        <div className="relative z-10 space-y-4 max-w-xl text-left">
          <div className="space-y-1">
            <span className="text-emerald-100 text-xs font-semibold uppercase tracking-wider block">
              {currentDate}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, Jordan!
            </h2>
            <p className="text-emerald-50 text-xs leading-relaxed max-w-md">
              You are doing great today! You have consumed **1,842 kcal** of your **2,200 kcal** daily target. Keep it up!
            </p>
          </div>
          <div>
            <Link
              href="/scanner"
              className="bg-white hover:bg-slate-50 text-emerald-600 text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md inline-flex items-center gap-2"
            >
              <Camera className="w-4 h-4" strokeWidth={2.2} />
              Scan a New Meal
            </Link>
          </div>
        </div>
        <div className="absolute right-6 bottom-0 translate-y-4 opacity-15 hidden md:block">
          <Leaf className="w-24 h-24 text-white" strokeWidth={1} />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md select-none">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Calories Today
            </span>
            <span className="text-2xl font-bold text-slate-800 block">1,842 / 2,200</span>
            <span className="text-xs font-semibold text-slate-500 block">84% of daily target</span>
          </div>
          <div className="shrink-0 scale-90">
            <CircularProgress value={1842} max={2200} size={70} strokeWidth={6} showText={false} />
          </div>
        </div>

        <StatCard
          label="Meals Scanned"
          value="47"
          trend="Scanned this month"
          icon={<Utensils className="w-5 h-5 text-teal-600" strokeWidth={2} />}
          iconBgClass="bg-teal-500/10 text-teal-650"
        />

        <StatCard
          label="Avg Health Score"
          value="88.4"
          trend="📈 +3.2 vs last week"
          icon={<Heart className="w-5 h-5 text-emerald-600" strokeWidth={2} />}
          iconBgClass="bg-emerald-500/10 text-emerald-650"
        />

        <StatCard
          label="Active Streak"
          value="12 Days"
          trend="🔥 Personal best streak!"
          icon={<Zap className="w-5 h-5 text-amber-650" strokeWidth={2} />}
          iconBgClass="bg-amber-500/10 text-amber-650"
        />
      </div>

      {/* Main Grid: Recent Scans vs Today's Macros */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3): Recent Scans */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center select-none">
            <h3 className="text-base font-extrabold text-slate-800">Recent Food Analyses</h3>
            <Link href="/history" className="text-xs font-bold text-emerald-500 hover:text-emerald-600 transition-colors">
              View History →
            </Link>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => router.push(`/food-detail/${scan.id}`)}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 select-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={scan.imageUrl} alt={scan.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-slate-800 text-xs capitalize truncate select-all">{scan.name}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5 select-none">
                        {scan.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 select-none">
                    <div className="text-right hidden sm:block">
                      <span className="block text-xs font-bold text-slate-700">{scan.calories} kcal</span>
                      <span className="block text-[8px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                        P: {scan.protein}g • C: {scan.carbs}g • F: {scan.fat}g
                      </span>
                    </div>
                    <ScoreBadge score={scan.healthScore} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Macros & Quick Actions */}
        <div className="space-y-6">
          
          {/* Today's Macros */}
          <div className="bg-white border border-slate-200/85 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2.5 select-none">
              Macros Intake
            </h3>
            <div className="space-y-4">
              <ProgressBar label="Protein (g)" value={82} max={120} colorClass="bg-emerald-500" />
              <ProgressBar label="Carbohydrates (g)" value={198} max={250} colorClass="bg-teal-500" />
              <ProgressBar label="Dietary Fats (g)" value={58} max={80} colorClass="bg-amber-500" />
              <ProgressBar label="Dietary Fiber (g)" value={22} max={30} colorClass="bg-purple-500" />
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="bg-white border border-slate-200/85 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-50 pb-2.5 select-none">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <Link
                href="/scanner"
                className="bg-slate-50 border border-slate-150 hover:bg-emerald-50 hover:border-emerald-100 p-3 rounded-2xl transition-all font-semibold text-[10px] text-slate-600 hover:text-emerald-600 flex flex-col items-center justify-center select-none"
              >
                <Camera className="w-5 h-5 mb-1.5" strokeWidth={2.2} />
                Scan Plate
              </Link>
              <Link
                href="/analytics"
                className="bg-slate-50 border border-slate-150 hover:bg-teal-50 hover:border-teal-100 p-3 rounded-2xl transition-all font-semibold text-[10px] text-slate-600 hover:text-teal-600 flex flex-col items-center justify-center select-none"
              >
                <TrendingUp className="w-5 h-5 mb-1.5" strokeWidth={2.2} />
                Trends
              </Link>
              <Link
                href="/recommendations"
                className="bg-slate-50 border border-slate-150 hover:bg-purple-50 hover:border-purple-100 p-3 rounded-2xl transition-all font-semibold text-[10px] text-slate-600 hover:text-purple-600 flex flex-col items-center justify-center select-none"
              >
                <Lightbulb className="w-5 h-5 mb-1.5" strokeWidth={2.2} />
                AI Advices
              </Link>
              <Link
                href="/history"
                className="bg-slate-50 border border-slate-150 hover:bg-slate-100/80 p-3 rounded-2xl transition-all font-semibold text-[10px] text-slate-600 hover:text-slate-800 flex flex-col items-center justify-center select-none"
              >
                <History className="w-5 h-5 mb-1.5" strokeWidth={2.2} />
                Scan Logs
              </Link>
            </div>
          </div>

          {/* AI Tip card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-5 shadow-sm space-y-2 select-none">
            <div className="flex items-center gap-2 text-indigo-900">
              <Brain className="w-4 h-4" strokeWidth={2} />
              <h4 className="text-xs font-bold uppercase tracking-wider">AI Nutrition Tip</h4>
            </div>
            <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
              You have achieved **95%** of your daily fat target. Consider choosing steamed or baked items instead of sautéed food for your evening snack to keep within your calorie budget.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
