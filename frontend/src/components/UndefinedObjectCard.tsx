'use client';

import React from 'react';
import { AlertOctagon, HelpCircle, ShieldX } from 'lucide-react';

interface UndefinedObjectCardProps {
  detection: any;
}

export default function UndefinedObjectCard({ detection }: UndefinedObjectCardProps) {
  const { confidence, reason } = detection;

  return (
    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              Undefined / Unsupported Object
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                Confidence: {Math.round(confidence * 100)}%
              </span>
            </h3>
            <p className="text-xs text-amber-800/80 mt-0.5 font-medium">
              Academic Confidence Rejection Filter Triggered
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60 text-xs text-slate-700 space-y-1">
        <p className="font-semibold text-amber-900">Faculty Constraint Rule Applied:</p>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {reason || "The detected object is either not in the supported 10-food taxonomy or fell below the strict detection confidence threshold. In accordance with academic guidelines, the system refuses to force an incorrect label."}
        </p>
      </div>
    </div>
  );
}
