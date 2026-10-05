'use client';

import React from 'react';
import { ShoppingBag, Sparkles, AlertCircle, CheckCircle2, Clock, Flame, Scale, ArrowRight, ShieldCheck } from 'lucide-react';

interface SmartFoodBasketProps {
  basket?: {
    total_items_count: number;
    fresh_count: number;
    semi_fresh_count: number;
    spoiled_count: number;
    total_estimated_weight_g: number;
    overall_basket_quality_score: number;
    recommended_consumption_priority: Array<{
      food: string;
      freshness: string;
      estimated_shelf_life: string;
      sort_days: number;
    }>;
    action_recommendations: string[];
    total_estimated_calories_kcal: number;
    disclaimer?: string;
  };
}

export default function SmartFoodBasketCard({ basket }: SmartFoodBasketProps) {
  if (!basket || basket.total_items_count === 0) {
    return null;
  }

  const {
    total_items_count,
    fresh_count,
    semi_fresh_count,
    spoiled_count,
    total_estimated_weight_g,
    overall_basket_quality_score,
    recommended_consumption_priority,
    action_recommendations,
    total_estimated_calories_kcal,
    disclaimer
  } = basket;

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'Optimal Quality';
    if (score >= 50) return 'Moderate Freshness';
    return 'Action Needed';
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-700/60 space-y-6 relative overflow-hidden font-sans">
      {/* Subtle background glow decoration */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              Smart Food Basket Analysis
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Multi-Produce Quality Snapshot
            </h2>
          </div>
        </div>

        {/* Quality Score Ring */}
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-2.5 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Basket Quality</div>
            <div className="text-xs font-semibold text-emerald-400">{getScoreBadge(overall_basket_quality_score)}</div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {overall_basket_quality_score}<span className="text-xs text-slate-400 font-bold">/100</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Produce</div>
          <div className="text-xl font-bold text-white">{total_items_count} <span className="text-xs font-normal text-slate-400">items</span></div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {fresh_count} Fresh · {semi_fresh_count} Semi · {spoiled_count} Spoiled
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Scale className="w-3 h-3 text-teal-400" /> Estimated Weight
          </div>
          <div className="text-xl font-bold text-white">{total_estimated_weight_g} <span className="text-xs font-normal text-slate-400">g</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Sum of morphological weights</div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" /> Total Energy
          </div>
          <div className="text-xl font-bold text-white">{total_estimated_calories_kcal} <span className="text-xs font-normal text-slate-400">kcal</span></div>
          <div className="text-[10px] text-slate-400 mt-1">USDA nutritional profile</div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-indigo-400" /> Safety Status
          </div>
          <div className={`text-sm font-bold ${spoiled_count > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {spoiled_count > 0 ? `${spoiled_count} Item(s) Spoiled` : 'Safe to Consume'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Cross-spoilage check</div>
        </div>
      </div>

      {/* Two-Column Section: Consumption Priority & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recommended Consumption Priority */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4.5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            Recommended Consumption Priority
          </div>
          <p className="text-[11px] text-slate-300">
            Sorted by shortest remaining shelf life to minimize food waste:
          </p>

          <div className="space-y-2">
            {recommended_consumption_priority.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/40 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-white capitalize">{item.food}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      item.freshness === 'Fresh'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : item.freshness === 'Semi-Fresh'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {item.freshness}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {item.estimated_shelf_life}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Recommendations */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4.5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              Smart Action Recommendations
            </div>
            <p className="text-[11px] text-slate-300 mt-1 mb-3">
              Actionable insights based on spoilage localization and shelf life:
            </p>

            <div className="space-y-2">
              {action_recommendations.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/40 text-xs text-slate-200"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700/40 text-[10px] text-slate-400 italic">
            * {disclaimer || 'All measurements, shelf life, weight, and nutritional recommendations are computational estimates.'}
          </div>
        </div>
      </div>
    </div>
  );
}
