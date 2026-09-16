'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CircularProgress from '../../../components/shared/CircularProgress';
import { Leaf, Lightbulb, Camera, Utensils, CheckCircle } from 'lucide-react';

type ScanState = 'idle' | 'uploading' | 'analyzing' | 'done';

export default function ScannerPage() {
  const [state, setState] = useState<ScanState>('idle');
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state === 'uploading') {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 40) {
            clearInterval(interval);
            setState('analyzing');
            return 40;
          }
          return prev + 5;
        });
      }, 100);
    } else if (state === 'analyzing') {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setState('done');
            return 100;
          }
          return prev + 4;
        });
      }, 120);
    }

    return () => clearInterval(interval);
  }, [state]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startScanFlow();
    }
  };

  const startScanFlow = () => {
    setProgress(0);
    setState('uploading');
  };

  // Steps check verification ticks
  const getStepStatus = (minProgress: number) => {
    if (progress >= minProgress) return '✅ Complete';
    if (state === 'analyzing' && progress < minProgress && progress >= minProgress - 15) return '⏳ Processing...';
    return '⚪ Pending';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans select-none">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold text-slate-800">AI Food Scanner</h1>
        <p className="text-sm text-slate-500 font-normal">Snap a photo or upload your dish for immediate analysis.</p>
      </div>

      {state === 'idle' && (
        <div className="space-y-6">
          {/* Upload card box */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all flex flex-col items-center justify-center min-h-[300px] cursor-pointer ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                : 'border-slate-200 bg-white hover:border-emerald-400'
            }`}
            onClick={startScanFlow}
          >
            <Leaf className="w-12 h-12 text-emerald-500 mb-4 animate-bounce" strokeWidth={1.5} />
            <h3 className="text-base font-bold text-slate-800">Drag & drop your food photo</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Supports JPG, PNG images. Maximum photo size 10MB.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startScanFlow();
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md mt-6"
            >
              Choose Image File
            </button>
          </div>

          {/* Quick instructions tips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center">
              <Lightbulb className="w-5 h-5 text-emerald-600 mb-2" strokeWidth={2} />
              <h5 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Good Lighting</h5>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Ensure shadows don&apos;t obscure plate ingredients.</p>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center">
              <Camera className="w-5 h-5 text-emerald-600 mb-2" strokeWidth={2} />
              <h5 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Clear Focus</h5>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Keep camera steady to capture sharp boundaries outlines.</p>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center">
              <Utensils className="w-5 h-5 text-emerald-600 mb-2" strokeWidth={2} />
              <h5 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Full Plate View</h5>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Position items inside frame viewport angles.</p>
            </div>
          </div>
        </div>
      )}

      {(state === 'uploading' || state === 'analyzing') && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md flex flex-col items-center justify-center space-y-6 min-h-[300px]">
          <CircularProgress value={progress} max={100} size={100} strokeWidth={8} showText={false} />
          
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              {state === 'uploading' ? 'Uploading Image...' : 'Analyzing Ingredients...'}
            </h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Inference Progress: {progress}%
            </p>
          </div>

          {state === 'analyzing' && (
            <div className="w-full max-w-md bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3 text-xs text-left">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-slate-500">1. Running object detection (YOLOv8)</span>
                <span className={progress >= 55 ? 'text-emerald-500 font-bold' : 'text-slate-450'}>
                  {getStepStatus(55)}
                </span>
              </div>
              <div className="flex justify-between items-center font-semibold">
                <span className="text-slate-500">2. Querying USDA nutrient databases</span>
                <span className={progress >= 70 ? 'text-emerald-500 font-bold' : 'text-slate-450'}>
                  {getStepStatus(70)}
                </span>
              </div>
              <div className="flex justify-between items-center font-semibold">
                <span className="text-slate-500">3. Classifying freshness timelines (EfficientNet)</span>
                <span className={progress >= 85 ? 'text-emerald-500 font-bold' : 'text-slate-450'}>
                  {getStepStatus(85)}
                </span>
              </div>
              <div className="flex justify-between items-center font-semibold">
                <span className="text-slate-500">4. Processing customized dietary advisories</span>
                <span className={progress >= 98 ? 'text-emerald-500 font-bold' : 'text-slate-450'}>
                  {getStepStatus(98)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {state === 'done' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-md text-center space-y-6 min-h-[300px] flex flex-col items-center justify-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mb-2 animate-bounce" strokeWidth={1.8} />
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-800">Food Analysis Complete!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              We identified 3 ingredients from your plate. The aggregate nutritional breakdown is ready for review.
            </p>
          </div>

          <div className="flex justify-center gap-4 w-full max-w-xs">
            <button
              onClick={() => setState('idle')}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-3.5 rounded-xl transition-all"
            >
              Scan Another
            </button>
            <button
              onClick={() => router.push('/results')}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-500/10"
            >
              View Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
