'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';
import { MOCK_WEEKLY_CALORIES, MOCK_WEEKLY_MACROS, MOCK_SCORE_TREND } from '../../../lib/mock-data';
import StatCard from '../../../components/shared/StatCard';
import { Flame, Activity, Utensils, Trophy } from 'lucide-react';

export default function AnalyticsPage() {
  
  // Donut split values
  const macroDonutData = [
    { name: 'Protein', value: 28, color: '#22C55E' },
    { name: 'Carbs', value: 45, color: '#14B8A6' },
    { name: 'Fat', value: 27, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <div className="select-none">
        <h1 className="text-2xl font-bold text-slate-800">Nutrition Analytics</h1>
        <p className="text-xs text-slate-450 mt-0.5">Aggregate weekly stats, macros split metrics, and health score trends</p>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Avg Daily Calories"
          value="1,934 kcal"
          trend="📉 -4.2% vs last week"
          icon={<Flame className="w-5 h-5 text-emerald-600" strokeWidth={2} />}
          iconBgClass="bg-emerald-500/10 text-emerald-650"
        />
        <StatCard
          label="Protein Goal coverage"
          value="87 %"
          trend="👍 Consistently target matching"
          icon={<Activity className="w-5 h-5 text-teal-600" strokeWidth={2} />}
          iconBgClass="bg-teal-500/10 text-teal-650"
        />
        <StatCard
          label="Meals Tracked"
          value="47 Meals"
          trend="Scanned this month"
          icon={<Utensils className="w-5 h-5 text-purple-650" strokeWidth={2} />}
          iconBgClass="bg-purple-500/10 text-purple-650"
        />
        <StatCard
          label="Best Health Score"
          value="97 Rating"
          trend="🔥 Achieved on Tuesday"
          icon={<Trophy className="w-5 h-5 text-amber-650" strokeWidth={2} />}
          iconBgClass="bg-amber-500/10 text-amber-650"
        />
      </div>

      {/* Grid: Weekly Area Chart & Health Score Lines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 select-none">
        
        {/* Weekly Calories Area Chart */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
            <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider">Weekly Caloric Intake</h3>
            <span className="text-[10px] text-slate-450 font-bold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">7 Days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_WEEKLY_CALORIES}>
                <defs>
                  <linearGradient id="calGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[1200, 2500]} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <ReferenceLine y={2200} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Goal (2,200)', fill: '#EF4444', fontSize: 9, position: 'top' }} />
                <Area type="monotone" dataKey="calories" stroke="#22C55E" strokeWidth={2.5} fillOpacity={1} fill="url(#calGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Score Trend Line Chart */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
            <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider">Health Score Index Curve</h3>
            <span className="text-[10px] text-slate-450 font-bold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">Weekly Average</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_SCORE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[70, 100]} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="score" stroke="#14B8A6" strokeWidth={3} dot={{ fill: '#14B8A6', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Macros Grouped Bars vs Macros Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 select-none">
        
        {/* Macros Grouped Bar Chart (2/3) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider border-b border-slate-50 pb-2.5">
            Macronutrients Daily Splits
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_WEEKLY_MACROS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Protein" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Carbs" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Fat" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macros Share Donut PieChart (1/3) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col items-center">
          <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider border-b border-slate-50 pb-2.5 w-full text-left">
            Dietary Share Breakdown
          </h3>

          <div className="h-52 w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="75%"
                  paddingAngle={3}
                  dataKey="value"
                >
                  {macroDonutData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legends list */}
          <div className="w-full grid grid-cols-3 gap-2 text-center text-[10px] text-slate-450 font-bold border-t border-slate-50 pt-3">
            <div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block mr-1" />
              Protein (28%)
            </div>
            <div>
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block mr-1" />
              Carbs (45%)
            </div>
            <div>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block mr-1" />
              Fat (27%)
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
