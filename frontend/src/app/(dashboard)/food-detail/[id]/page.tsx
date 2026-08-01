'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MOCK_SCANS } from '../../../../lib/mock-data';
import ScoreBadge from '../../../../components/shared/ScoreBadge';
import {
  ArrowLeft,
  FileText,
  Snowflake,
  Heart,
  AlertTriangle,
  Activity,
  Brain,
  Zap,
  Shield,
  Info
} from 'lucide-react';

export default function FoodDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const food = MOCK_SCANS.find((scan) => scan.id === id) || MOCK_SCANS[0];

  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Nutrition Facts', icon: FileText },
    { label: 'Storage Guidance', icon: Snowflake },
    { label: 'Health Benefits', icon: Heart },
    { label: 'Dietary Risks', icon: AlertTriangle },
  ];

  // Detailed 14-row USDA nutrition breakdown matching items
  const nutritionRows = [
    { name: 'Calories', val: `${food.calories} kcal`, rdi: '20%' },
    { name: 'Total Fat', val: `${food.fat} g`, rdi: '28%' },
    { name: 'Saturated Fat', val: '2.5 g', rdi: '12%' },
    { name: 'Trans Fat', val: '0 g', rdi: '0%' },
    { name: 'Cholesterol', val: '185 mg', rdi: '61%' },
    { name: 'Sodium', val: '310 mg', rdi: '13%' },
    { name: 'Total Carbohydrate', val: `${food.carbs} g`, rdi: '14%' },
    { name: 'Dietary Fiber', val: `${food.fiber} g`, rdi: '24%' },
    { name: 'Sugars', val: '4 g', rdi: '--' },
    { name: 'Protein', val: `${food.protein} g`, rdi: '52%' },
    { name: 'Vitamin D', val: '2.1 mcg', rdi: '10%' },
    { name: 'Calcium', val: '120 mg', rdi: '12%' },
    { name: 'Iron', val: '3.2 mg', rdi: '18%' },
    { name: 'Potassium', val: '450 mg', rdi: '10%' },
  ];

  const benefits = [
    { title: 'Cardiovascular Support', icon: Heart, iconColor: 'text-emerald-500', text: 'High healthy monounsaturated fat proportions aid cholesterol regulation parameters.' },
    { title: 'Cognitive Health', icon: Brain, iconColor: 'text-purple-500', text: 'Choline from organic eggs maintains cognitive pathways and cell membranes.' },
    { title: 'Sustained Energy', icon: Zap, iconColor: 'text-amber-500', text: 'Sourdough complex carbohydrates release glucose gradually, preventing insulin spikes.' },
    { title: 'Cellular Defense', icon: Shield, iconColor: 'text-blue-500', text: 'Vitamin E and lutein antioxidants scavenge free radicals inside tissues.' },
  ];

  const risks = [
    { name: 'High Cholesterol Alert', severity: 'moderate' as const, text: 'Egg yolk content raises daily cholesterol index values. Eat in moderation if monitoring heart stats.' },
    { name: 'Sodium Warning', severity: 'low' as const, text: 'Artisanal sourdough and toppings contain salt. Limit added table salt during subsequent meals.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Back navigation link controls */}
      <div className="select-none">
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
          Back to previous page
        </button>
      </div>

      {/* Hero card details summary */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row">
        <div className="h-56 md:h-auto md:w-80 bg-slate-100 shrink-0 relative select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 bg-zinc-950/70 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            {Math.round(food.confidence * 100)}% Confidence
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-extrabold text-slate-800 capitalize select-all">{food.name}</h2>
              <ScoreBadge score={food.healthScore} />
            </div>
            <p className="text-xs text-slate-500 font-semibold select-none">
              Analyzed on {food.date} • Freshness status matches:
              <span className={`font-bold ml-1 uppercase ${
                food.freshnessStatus === 'fresh' ? 'text-emerald-500' : 'text-amber-500'
              }`}>
                {food.freshnessStatus}
              </span>
            </p>
          </div>

          {/* Quick macro statistics numbers grids */}
          <div className="grid grid-cols-4 gap-2 text-center select-none">
            <div className="bg-slate-50 rounded-xl p-2.5">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">Calories</span>
              <span className="text-sm font-bold text-emerald-500 block mt-0.5">{food.calories} kcal</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">Protein</span>
              <span className="text-sm font-bold text-slate-700 block mt-0.5">{food.protein}g</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">Carbohydrates</span>
              <span className="text-sm font-bold text-slate-700 block mt-0.5">{food.carbs}g</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">Fat</span>
              <span className="text-sm font-bold text-slate-700 block mt-0.5">{food.fat}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs panels headers navigation */}
      <div className="flex border-b border-slate-200/80 gap-2 md:gap-4 overflow-x-auto select-none">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === idx;
          const Icon = tab.icon;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`py-3 px-3.5 border-b-2 text-xs font-bold tracking-wide transition-all whitespace-nowrap outline-none flex items-center gap-1.5 ${
                isActive
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={2.2} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm min-h-[300px]">
        {activeTab === 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 select-none">
              <h3 className="text-sm font-bold text-slate-800">USDA Nutrient Breakdown</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">% Daily Value *</span>
            </div>
            <div className="divide-y divide-slate-100">
              {nutritionRows.map((row, idx) => (
                <div key={idx} className="flex justify-between py-2.5 text-xs">
                  <span className="font-semibold text-slate-650">{row.name}</span>
                  <div className="flex gap-6 font-bold select-all">
                    <span className="text-slate-800">{row.val}</span>
                    <span className="text-slate-500 w-8 text-right select-none">{row.rdi}</span>
                  </div>
                </div>
              ))}
            </div>
            <span className="block text-[9px] text-slate-400 leading-normal pt-4 border-t border-slate-50 select-none">
              * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs targets.
            </span>
          </div>
        )}

        {activeTab === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
            <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 space-y-3 flex flex-col justify-start items-start">
              <div className="flex items-center gap-2 text-slate-800">
                <Snowflake className="w-5 h-5 text-sky-500" strokeWidth={2} />
                <h4 className="text-xs font-bold uppercase tracking-wide">Refrigerator Storage</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Avocados decay quickly once cut open. Store the remaining portion wrapped tightly in plastic film with the pit inside to retard oxidation. Consume within **48 hours**.
              </p>
            </div>
            <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 space-y-3 flex flex-col justify-start items-start">
              <div className="flex items-center gap-2 text-slate-800">
                <Activity className="w-5 h-5 text-emerald-500" strokeWidth={2} />
                <h4 className="text-xs font-bold uppercase tracking-wide">Freshness Index warnings</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                This meal scored a **{food.freshnessScore}% freshness rating**. Eggs are fresh, and sourdough bread remains within safe consumption window limits. Best consumed immediately.
              </p>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 select-none">
            {benefits.map((ben, idx) => {
              const BenefitIcon = ben.icon;
              return (
                <div key={idx} className="bg-slate-50/30 border border-slate-150 rounded-2xl p-5 space-y-2 hover:shadow-md transition-all duration-200 flex flex-col justify-start items-start">
                  <div className="flex items-center gap-2 text-slate-850">
                    <BenefitIcon className={`w-5 h-5 ${ben.iconColor}`} strokeWidth={2} />
                    <h4 className="text-xs font-bold capitalize">{ben.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{ben.text}</p>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 select-none">Dietary Concerns & Advisories</h3>
            
            <div className="space-y-3">
              {risks.map((risk, idx) => (
                <div
                  key={idx}
                  className={`border rounded-2xl p-5 flex items-start gap-3.5 select-none ${
                    risk.severity === 'moderate'
                      ? 'bg-amber-50/30 border-amber-200/60 text-amber-900'
                      : 'bg-blue-50/30 border-blue-200/60 text-blue-900'
                  }`}
                >
                  {risk.severity === 'moderate' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" strokeWidth={2} />
                  ) : (
                    <Info className="w-5 h-5 text-blue-500 shrink-0" strokeWidth={2} />
                  )}
                  <div>
                    <h5 className="text-xs font-bold capitalize">{risk.name}</h5>
                    <p className="text-[11px] opacity-80 mt-1 leading-relaxed">{risk.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
