'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import ScoreBadge from '../../../components/shared/ScoreBadge';
import { Check, AlertTriangle } from 'lucide-react';

interface ScannedFoodItem {
  id: string;
  name: string;
  confidence: number;
  freshnessScore: number;
  freshnessStatus: 'fresh' | 'moderate' | 'spoiled';
  shelfLife: number;
  weightG: number;
  baseCaloriesPerGram: number; // base reference value
  baseProteinPerGram: number;
  baseCarbsPerGram: number;
  baseFatPerGram: number;
}

export default function ResultsPage() {
  const router = useRouter();

  // Scanned plate components
  const [items, setItems] = useState<ScannedFoodItem[]>([
    {
      id: '1',
      name: 'Sourdough Toast slice',
      confidence: 0.99,
      freshnessScore: 98,
      freshnessStatus: 'fresh',
      shelfLife: 5,
      weightG: 80,
      baseCaloriesPerGram: 2.25, // 180 kcal / 80g
      baseProteinPerGram: 0.075,
      baseCarbsPerGram: 0.40,
      baseFatPerGram: 0.025,
    },
    {
      id: '2',
      name: 'Avocado spread portion',
      confidence: 0.97,
      freshnessScore: 92,
      freshnessStatus: 'fresh',
      shelfLife: 2,
      weightG: 100,
      baseCaloriesPerGram: 1.6, // 160 kcal / 100g
      baseProteinPerGram: 0.02,
      baseCarbsPerGram: 0.08,
      baseFatPerGram: 0.15,
    },
    {
      id: '3',
      name: 'Poached Eggs x2',
      confidence: 0.98,
      freshnessScore: 95,
      freshnessStatus: 'fresh',
      shelfLife: 6,
      weightG: 100,
      baseCaloriesPerGram: 1.45, // 145 kcal / 100g
      baseProteinPerGram: 0.125,
      baseCarbsPerGram: 0.01,
      baseFatPerGram: 0.095,
    },
  ]);

  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(false);

  // Recalculate nutrient totals dynamically when weight is adjusted
  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.calories += Math.round(item.weightG * item.baseCaloriesPerGram);
        acc.protein += Math.round(item.weightG * item.baseProteinPerGram);
        acc.carbs += Math.round(item.weightG * item.baseCarbsPerGram);
        acc.fat += Math.round(item.weightG * item.baseFatPerGram);
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [items]);

  const handleWeightChange = (id: string, newWeight: number) => {
    const val = Math.max(0, newWeight);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, weightG: val } : item))
    );
  };

  const handleSaveLog = () => {
    setLogging(true);
    setTimeout(() => {
      setLogged(true);
      setLogging(false);
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    }, 600);
  };

  // RDI radar data mapping
  const radarData = [
    { subject: 'Vit C', A: 90, B: 110, fullMark: 150 },
    { subject: 'Iron', A: 65, B: 85, fullMark: 150 },
    { subject: 'Calcium', A: 80, B: 95, fullMark: 150 },
    { subject: 'Fiber', A: 75, B: 90, fullMark: 150 },
    { subject: 'Omega-3', A: 92, B: 105, fullMark: 150 },
    { subject: 'Antioxidants', A: 88, B: 98, fullMark: 150 },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upper header action controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Scan Results</h1>
          <p className="text-xs text-slate-450 mt-0.5">3 food items segment bounding boxes mapped successfully</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => router.push('/scanner')}
            className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-5 py-3 rounded-xl transition-all"
          >
            New Scan
          </button>
          <button
            onClick={handleSaveLog}
            disabled={logging || logged}
            className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
          >
            {logging ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : logged ? (
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4" strokeWidth={2.5} /> Logged!
              </span>
            ) : (
              'Log Meal to History'
            )}
          </button>
        </div>
      </div>

      {/* Aggregate Score Swatches */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-md space-y-1">
          <span className="text-[9px] font-bold text-emerald-100 uppercase tracking-widest block">Plate Health Score</span>
          <span className="text-3xl font-extrabold block">92</span>
          <span className="text-[10px] text-emerald-50 block font-semibold">Excellent nutritional mix</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Calculated Calories</span>
          <span className="text-3xl font-extrabold text-slate-800 block">{totals.calories} kcal</span>
          <span className="text-[10px] text-slate-450 block font-semibold">Real-time weight adjustment</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Protein</span>
          <span className="text-3xl font-extrabold text-slate-800 block">{totals.protein} g</span>
          <span className="text-[10px] text-slate-450 block font-semibold">Protein target progress</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Freshness Status</span>
          <span className="text-3xl font-extrabold text-emerald-500 block">96%</span>
          <span className="text-[10px] text-slate-450 block font-semibold">Eat fresh warnings cleared</span>
        </div>
      </div>

      {/* Content layout splitting: Items adjusters vs Radar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bounding items lists column (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-extrabold text-slate-800 select-none">Detected Ingredients Details</h3>
          
          <div className="space-y-4">
            {items.map((item) => {
              const currentCal = Math.round(item.weightG * item.baseCaloriesPerGram);
              const currentProt = Math.round(item.weightG * item.baseProteinPerGram);
              const currentCarb = Math.round(item.weightG * item.baseCarbsPerGram);
              const currentFat = Math.round(item.weightG * item.baseFatPerGram);

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/85 rounded-2xl p-5 shadow-sm space-y-4 font-sans"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-800 text-sm capitalize select-all">{item.name}</h4>
                        <span className="bg-slate-100 text-slate-500 font-bold text-[9px] px-2 py-0.5 rounded-full select-none">
                          {Math.round(item.confidence * 100)}% Match
                        </span>
                        <ScoreBadge score={item.freshnessScore} />
                      </div>
                      <span className="text-[10px] text-slate-450 font-semibold flex items-center gap-1 select-none">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
                        Freshness Index: {item.freshnessScore}% • Shelf life: {item.shelfLife} days remaining
                      </span>
                    </div>

                    {/* Weight portions adjuster input */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-xs font-semibold text-slate-500 select-none">Portion weight:</span>
                      <input
                        type="number"
                        value={item.weightG}
                        onChange={(e) => handleWeightChange(item.id, parseInt(e.target.value) || 0)}
                        className="w-20 bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-center text-xs font-bold text-slate-800 outline-none transition-all"
                      />
                      <span className="text-xs font-semibold text-slate-500 select-none">g</span>
                    </div>
                  </div>

                  {/* Micro nutrition statistics tiles */}
                  <div className="grid grid-cols-4 gap-2 text-center pt-3 border-t border-slate-100 select-none">
                    <div className="bg-slate-50/50 rounded-xl p-2">
                      <span className="text-[8px] font-bold text-slate-400 uppercase block">Calories</span>
                      <span className="text-xs font-bold text-emerald-500 block mt-0.5">{currentCal} kcal</span>
                    </div>
                    <div className="bg-slate-50/50 rounded-xl p-2">
                      <span className="text-[8px] font-bold text-slate-400 uppercase block">Protein</span>
                      <span className="text-xs font-semibold text-slate-700 block mt-0.5">{currentProt}g</span>
                    </div>
                    <div className="bg-slate-50/50 rounded-xl p-2">
                      <span className="text-[8px] font-bold text-slate-400 uppercase block">Carbohydrates</span>
                      <span className="text-xs font-semibold text-slate-700 block mt-0.5">{currentCarb}g</span>
                    </div>
                    <div className="bg-slate-50/50 rounded-xl p-2">
                      <span className="text-[8px] font-bold text-slate-400 uppercase block">Dietary Fat</span>
                      <span className="text-xs font-semibold text-slate-700 block mt-0.5">{currentFat}g</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Radar Charts column (1/3) */}
        <div className="space-y-4 select-none">
          <h3 className="text-base font-extrabold text-slate-800">Nutrients RDI Profile</h3>
          
          <div className="bg-white border border-slate-200/85 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center block w-full border-b border-slate-50 pb-2.5">
              Micronutrients RDI Coverage
            </span>

            {/* Recharts radar container */}
            <div className="w-full h-64 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
                  <Radar name="Coverage" dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.2} />
                  <Radar name="RDI Target" dataKey="B" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full text-[10px] text-slate-400 space-y-1.5 pt-2 border-t border-slate-50 font-medium">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Detected Intake Coverage</span>
                <span className="font-bold text-slate-650">Avg 81.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Optimum Target RDI</span>
                <span className="font-bold text-slate-650">100.0%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
