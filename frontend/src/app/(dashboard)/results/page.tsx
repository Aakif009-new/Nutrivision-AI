'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Flame, Apple, HeartPulse, AlertTriangle, Layers, Eye, CheckCircle2 } from 'lucide-react';
import ImageProcessingVisualizer from '../../../components/ImageProcessingVisualizer';
import ComputerVisionVisualizer from '../../../components/ComputerVisionVisualizer';
import FoodCard from '../../../components/FoodCard';
import UndefinedObjectCard from '../../../components/UndefinedObjectCard';
import { AnalysisResponse } from '../../../services/backendClient';
import { getLatestAnalysis } from '../../../services/storage';

export default function ResultsPage() {
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [selectedDetectionId, setSelectedDetectionId] = useState<number | null>(null);

  useEffect(() => {
    getLatestAnalysis().then((data) => {
      if (data) {
        setAnalysisData(data);
        if (data.detections && data.detections.length > 0) {
          setSelectedDetectionId(data.detections[0].id);
        }
      }
    });
  }, []);

  if (!analysisData) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Active Scan Results</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You haven&apos;t run a food scan in this session yet. Upload a photo or capture a live webcam frame to start.
        </p>
        <button
          onClick={() => router.push('/scanner')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md"
        >
          Go To AI Scanner
        </button>
      </div>
    );
  }

  const { detections, overall_summary, visual_steps, cv_analysis_overlay, processing, warnings } = analysisData;
  const supportedDetections = detections.filter((d) => d.is_supported);
  const undefinedDetections = detections.filter((d) => !d.is_supported);

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans pb-16">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="space-y-1">
          <button
            onClick={() => router.push('/scanner')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Scanner
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Food Analysis & Quality Report</h1>
        </div>

        <button
          onClick={() => router.push('/scanner')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Scan Another Dish
        </button>
      </div>

      {/* Warnings Bar if non-food detected */}
      {warnings && warnings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong>Academic Rejection Triggered: </strong>
            {warnings.join(' ')}
          </div>
        </div>
      )}

      {/* Top Highlights Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Total Detected Items
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {overall_summary?.total_objects_detected || detections.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {overall_summary?.supported_foods_count || 0} recognized · {overall_summary?.undefined_objects_count || 0} undefined
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
            Freshness Index
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {overall_summary?.overall_health_score || 0}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Weighted produce freshness ratio</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            Total Calories
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {overall_summary?.total_calories_kcal || 0} <span className="text-sm font-semibold text-slate-500">kcal</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Scaled by custom regression weight</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Primary Produce
          </div>
          <div className="text-2xl font-bold text-slate-900 truncate">
            {overall_summary?.primary_food || 'None'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Verified USDA database match</div>
        </div>
      </div>

      {/* SECTION 1: DEDICATED IMAGE PROCESSING VISUALIZER */}
      <ImageProcessingVisualizer
        visualSteps={visual_steps || {}}
        techniques={processing?.techniques_applied || []}
      />

      {/* SECTION 2: DEDICATED COMPUTER VISION VISUALIZER */}
      <ComputerVisionVisualizer
        overlayImage={cv_analysis_overlay}
        detections={detections}
        overallSummary={overall_summary}
      />

      {/* SECTION 3: MULTI-OBJECT ANALYSIS CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Apple className="w-5 h-5 text-emerald-600" />
            Identified Food Items ({supportedDetections.length})
          </h2>
          <span className="text-xs text-slate-500">Click any card to highlight</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {supportedDetections.map((det) => (
            <FoodCard
              key={det.id}
              detection={det}
              isSelected={selectedDetectionId === det.id}
              onSelect={() => setSelectedDetectionId(det.id)}
            />
          ))}
        </div>
      </div>

      {/* SECTION 4: UNDEFINED / UNKNOWN OBJECT REJECTION CARDS */}
      {undefinedDetections.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200/60">
          <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Undefined / Rejected Objects ({undefinedDetections.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {undefinedDetections.map((det) => (
              <UndefinedObjectCard key={det.id} detection={det} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
