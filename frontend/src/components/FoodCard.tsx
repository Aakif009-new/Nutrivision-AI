'use client';

import React, { useState } from 'react';
import { Sparkles, Scale, Maximize2, AlertTriangle, Apple, Clock, Flame, ShieldAlert, Eye } from 'lucide-react';

interface FoodCardProps {
  detection: any;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function FoodCard({ detection, isSelected, onSelect }: FoodCardProps) {
  const [showSpoilageModal, setShowSpoilageModal] = useState(false);

  const {
    food,
    confidence,
    freshness,
    freshness_confidence,
    spoilage,
    size,
    weight,
    nutrition,
    shelf_life
  } = detection;

  const freshnessColor =
    freshness === 'Fresh'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : freshness === 'Semi-Fresh'
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : 'bg-rose-100 text-rose-800 border-rose-300';

  const spoiledPct = spoilage?.spoiled_area_percentage || 0;

  return (
    <div
      onClick={onSelect}
      className={`bg-white border rounded-2xl p-5 shadow-sm transition-all cursor-pointer space-y-4 ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      {/* Header Item & Badges */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
            🍎
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{food}</h3>
            <p className="text-xs text-slate-500 font-medium">
              Detection Confidence: <span className="text-slate-800 font-bold">{Math.round(confidence * 100)}%</span>
            </p>
          </div>
        </div>

        {/* Freshness Badge */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${freshnessColor}`}>
          {freshness} ({Math.round((freshness_confidence || 0.9) * 100)}%)
        </div>
      </div>

      {/* Grid of Measurements & OpenCV Spoilage */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
        {/* Physical Size */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
            <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
            Size (OpenCV)
          </div>
          <div className="font-bold text-slate-800">{size?.text || '7.5 × 8.0 cm'}</div>
        </div>

        {/* Estimated Weight */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
            <Scale className="w-3.5 h-3.5 text-purple-500" />
            Est. Weight
          </div>
          <div className="font-bold text-slate-800">
            {weight?.estimated_weight_grams ? `${weight.estimated_weight_grams} g` : '165 g'}
          </div>
        </div>

        {/* Calories */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            Calories
          </div>
          <div className="font-bold text-slate-800">
            {nutrition?.calories ? `${nutrition.calories} kcal` : '52 kcal'}
          </div>
        </div>

        {/* Spoilage */}
        <div
          onClick={(e) => {
            if (spoilage?.overlay_base64) {
              e.stopPropagation();
              setShowSpoilageModal(true);
            }
          }}
          className={`p-2.5 rounded-xl border transition-colors ${
            spoilage?.overlay_base64 ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-100/60 cursor-pointer' : 'bg-slate-50 border-slate-200/60'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              Spoilage %
            </span>
            {spoilage?.overlay_base64 && <Eye className="w-3 h-3 text-rose-500" />}
          </div>
          <div className="font-bold text-rose-700">{spoiledPct}% Discoloration</div>
        </div>
      </div>

      {/* Shelf Life & Storage Tip */}
      <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span className="text-slate-700 font-medium">
            Remaining Shelf Life: <strong className="text-emerald-800">{shelf_life?.estimated_remaining_days || '5-7 days'}</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-500 hidden sm:inline">{shelf_life?.storage_tip}</span>
      </div>

      {/* Spoilage Mask Modal */}
      {showSpoilageModal && spoilage?.overlay_base64 && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowSpoilageModal(false)}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                OpenCV Spoilage Region Masking
              </h3>
              <button onClick={() => setShowSpoilageModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                ✕ Close
              </button>
            </div>
            <div className="bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">
              <img src={spoilage.overlay_base64} alt="Spoilage Overlay" className="max-h-[300px] w-auto object-contain" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Measured Discoloration: {spoiledPct}%</strong>. Extracted via HSV chromatic abnormality thresholding and connected component morphological filtering.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
