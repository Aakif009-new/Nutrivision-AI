import React from 'react';
import ScoreBadge from './ScoreBadge';
import { formatNutrient } from '../../utils/formatters';

interface FoodCardProps {
  name: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence?: number;
  freshnessScore?: number;
  healthScore?: number;
  onClick?: () => void;
}

export default function FoodCard({
  name,
  imageUrl,
  calories,
  protein,
  carbs,
  fat,
  confidence,
  freshnessScore,
  healthScore,
  onClick,
}: FoodCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/85 rounded-2xl overflow-hidden shadow-sm flex flex-col font-sans transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''
      }`}
    >
      {/* Food thumbnail image */}
      <div className="h-40 w-full bg-slate-100 relative">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl select-none">
            🥗
          </div>
        )}
        
        {confidence !== undefined && (
          <span className="absolute top-3 left-3 bg-zinc-950/70 backdrop-blur-md text-white font-bold text-[9px] px-2 py-0.5 rounded-full select-none">
            {Math.round(confidence * 100)}% Match
          </span>
        )}

        {healthScore !== undefined && (
          <div className="absolute top-3 right-3 select-none">
            <ScoreBadge score={healthScore} />
          </div>
        )}
      </div>

      {/* Info elements */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          <h4 className="font-bold text-slate-800 text-sm capitalize truncate pr-1 select-all">{name}</h4>
          {freshnessScore !== undefined && (
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5 select-none">
              Freshness Index: {freshnessScore}%
            </span>
          )}
        </div>

        {/* Nutritional grid */}
        <div className="grid grid-cols-4 gap-1.5 pt-2.5 border-t border-slate-100 text-center select-none">
          <div className="bg-slate-50/50 rounded-lg p-1.5">
            <span className="text-[8px] font-bold text-slate-400 uppercase block">Cal</span>
            <span className="text-xs font-bold text-emerald-500 block mt-0.5">{Math.round(calories)}</span>
          </div>
          <div className="bg-slate-50/50 rounded-lg p-1.5">
            <span className="text-[8px] font-bold text-slate-400 uppercase block">Prot</span>
            <span className="text-xs font-semibold text-slate-700 block mt-0.5">{formatNutrient(protein)}g</span>
          </div>
          <div className="bg-slate-50/50 rounded-lg p-1.5">
            <span className="text-[8px] font-bold text-slate-400 uppercase block">Carb</span>
            <span className="text-xs font-semibold text-slate-700 block mt-0.5">{formatNutrient(carbs)}g</span>
          </div>
          <div className="bg-slate-50/50 rounded-lg p-1.5">
            <span className="text-[8px] font-bold text-slate-400 uppercase block">Fat</span>
            <span className="text-xs font-semibold text-slate-700 block mt-0.5">{formatNutrient(fat)}g</span>
          </div>
        </div>
      </div>
    </div>
  );
}
