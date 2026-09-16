'use client';

import React, { useState } from 'react';
import { MOCK_RECOMMENDATIONS } from '../../../lib/mock-data';
import ProgressBar from '../../../components/shared/ProgressBar';
import { Brain, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function RecommendationsPage() {
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedback((prev) => ({
      ...prev,
      [id]: type,
    }));
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <div className="select-none">
        <h1 className="text-2xl font-bold text-slate-800">AI Recommendations</h1>
        <p className="text-xs text-slate-450 mt-0.5">Custom dietary advices compiled based on today&apos;s logged macros gaps</p>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-lg flex items-center gap-6 select-none">
        <Brain className="w-8 h-8 text-purple-100 shrink-0" strokeWidth={2} />
        <div className="space-y-2 text-left">
          <h3 className="text-sm font-bold uppercase tracking-wider text-purple-100">Nutrition Advisor Insight</h3>
          <p className="text-xs opacity-90 leading-relaxed max-w-2xl">
            Based on your last **47 meal analyses**, you frequently achieve your Carbohydrates daily goals, but remain **18% under target for Protein** and **32% under target for heart-healthy Polyunsaturated Fats**. Focus on adding seeds and seafood items.
          </p>
        </div>
      </div>

      {/* Layout Split: Recommendations Cards vs Target Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recommendations Lists (2/3) */}
        <div className="lg:col-span-2 space-y-5">
          <h3 className="text-base font-extrabold text-slate-800 select-none">Personalized Food Suggestions</h3>

          <div className="space-y-6">
            {MOCK_RECOMMENDATIONS.map((rec) => {
              const userFb = feedback[rec.id];

              return (
                <div
                  key={rec.id}
                  className="bg-white border border-slate-200/85 rounded-3xl overflow-hidden shadow-sm flex flex-col sm:flex-row"
                >
                  <div className="h-44 sm:h-auto sm:w-48 bg-slate-100 shrink-0 relative select-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover" />
                    <span className={`absolute top-3 left-3 text-[9px] font-bold px-2 py-0.5 rounded-full text-white capitalize ${
                      rec.priority === 'high' ? 'bg-red-500' : rec.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-500'
                    }`}>
                      {rec.priority} Priority
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5 text-left">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block select-none">
                        {rec.category}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm capitalize select-all">{rec.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{rec.desc}</p>
                    </div>

                    {/* Feedback & Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 select-none">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Helpful?</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFeedback(rec.id, 'up')}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors border ${
                              userFb === 'up'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                : 'bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-500'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" strokeWidth={2.2} />
                          </button>
                          <button
                            onClick={() => handleFeedback(rec.id, 'down')}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors border ${
                              userFb === 'down'
                                ? 'bg-red-50 border-red-200 text-red-600'
                                : 'bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-500'
                            }`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" strokeWidth={2.2} />
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => window.location.href = rec.actionUrl}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
                      >
                        Try Suggestion
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Target Trackers (1/3) */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-800 select-none">Nutrition Target Goals</h3>
          
          <div className="bg-white border border-slate-200/85 rounded-3xl p-5 shadow-sm space-y-5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2.5 select-none">
              Weekly Progress Aggregates
            </span>
            <div className="space-y-5">
              <ProgressBar label="Daily Calories budget coverage" value={1842} max={2200} colorClass="bg-emerald-500" />
              <ProgressBar label="Daily Protein intake budget" value={82} max={120} colorClass="bg-teal-500" />
              <ProgressBar label="Weekly Dietary Fiber values" value={22} max={30} colorClass="bg-purple-500" />
              <ProgressBar label="Weekly Omega-3 targets index" value={1.1} max={2.2} colorClass="bg-indigo-500" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
