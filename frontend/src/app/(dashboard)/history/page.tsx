'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_SCANS, MockScan } from '../../../lib/mock-data';
import FoodCard from '../../../components/shared/FoodCard';
import ScoreBadge from '../../../components/shared/ScoreBadge';
import EmptyState from '../../../components/shared/EmptyState';
import { FileText, Search, LayoutGrid, List, Trash2 } from 'lucide-react';
import { fetchScanHistory, downloadPdfReport } from '../../../services/backendClient';
import { saveLatestAnalysis } from '../../../services/storage';

interface ExtendedScan extends MockScan {
  fullData?: any;
}

export default function HistoryPage() {
  const router = useRouter();
  const [scans, setScans] = useState<ExtendedScan[]>(MOCK_SCANS);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    fetchScanHistory().then((liveHistory) => {
      if (liveHistory && liveHistory.length > 0) {
        const parsed: ExtendedScan[] = liveHistory.map((item: any, idx: number) => {
          const summary = item.overall_summary || {};
          const primaryFood = summary.primary_food || 'Scanned Food';
          const totalCals = summary.total_calories_kcal || 0;
          const healthScore = summary.overall_health_score || 85;
          const rawDate = item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Today';
          
          return {
            id: item.scan_id || item._id || `scan-${idx}`,
            name: primaryFood,
            date: rawDate,
            calories: totalCals,
            protein: 12,
            carbs: 28,
            fat: 5,
            fiber: 3,
            shelfLife: summary.min_shelf_life_days || 5,
            confidence: 0.92,
            freshnessScore: healthScore,
            healthScore: healthScore,
            freshnessStatus: healthScore > 75 ? 'fresh' : 'moderate',
            imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
            fullData: item
          };
        });
        setScans(parsed);
      }
    });
  }, []);

  const filteredScans = useMemo(() => {
    return scans.filter((scan) =>
      scan.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [scans, search]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setScans((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSelectScan = async (scan: ExtendedScan) => {
    if (scan.fullData) {
      await saveLatestAnalysis(scan.fullData);
      router.push('/results');
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const scanId = scans.length > 0 ? scans[0].id : 'latest';
      await downloadPdfReport(scanId);
      setExported(true);
      setTimeout(() => setExported(false), 2000);
    } catch {
      // Fallback
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Scans History</h1>
          <p className="text-xs text-slate-450 mt-0.5">
            Directory lists of all {scans.length} nutritional plate logs recorded
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-450 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
        >
          {exporting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : exported ? (
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> PDF Report Downloaded!
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Export PDF Report
            </span>
          )}
        </button>
      </div>

      {/* Toolbar filters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search input field */}
        <div className="w-full sm:max-w-xs relative flex items-center">
          <Search className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search logged food items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-850 placeholder-slate-400 outline-none transition-all"
          />
        </div>

        {/* View Mode controls */}
        <div className="flex items-center gap-2 select-none self-end sm:self-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">View layout:</span>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all border flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-slate-100 border-slate-250 text-slate-800'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" strokeWidth={2.2} />
            List Table
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all border flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-slate-100 border-slate-250 text-slate-800'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" strokeWidth={2.2} />
            Grid Cards
          </button>
        </div>
      </div>

      {/* Primary listings cards or tables list */}
      {filteredScans.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No food logs found"
          description="Try checking for a different term or scan a new plate photo."
          action={
            <button
              onClick={() => setSearch('')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md select-none"
            >
              Clear Search Query
            </button>
          }
        />
      ) : viewMode === 'grid' ? (
        /* Grid view cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScans.map((scan) => (
            <FoodCard
              key={scan.id}
              name={scan.name}
              imageUrl={scan.imageUrl}
              calories={scan.calories}
              protein={scan.protein}
              carbs={scan.carbs}
              fat={scan.fat}
              confidence={scan.confidence}
              freshnessScore={scan.freshnessScore}
              healthScore={scan.healthScore}
              onClick={() => handleSelectScan(scan)}
            />
          ))}
        </div>
      ) : (
        /* List view table */
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider select-none">
                  <th className="px-6 py-4">Food Item</th>
                  <th className="px-6 py-4">Logged Date</th>
                  <th className="px-6 py-4">Calories</th>
                  <th className="px-6 py-4">Health Index</th>
                  <th className="px-6 py-4">Freshness</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredScans.map((scan) => (
                  <tr
                    key={scan.id}
                    onClick={() => handleSelectScan(scan)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer text-slate-650"
                  >
                    <td className="px-6 py-4 font-bold text-slate-800 capitalize select-all">
                      {scan.name}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-400 select-none">
                      {scan.date}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-850 select-all">
                      {scan.calories} kcal
                    </td>
                    <td className="px-6 py-4 select-none">
                      <ScoreBadge score={scan.healthScore} />
                    </td>
                    <td className="px-6 py-4 select-none font-bold uppercase">
                      <span className={scan.freshnessStatus === 'fresh' ? 'text-emerald-500' : 'text-amber-500'}>
                        {scan.freshnessStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center select-none">
                      <button
                        onClick={(e) => handleDelete(scan.id, e)}
                        className="bg-red-50 hover:bg-red-100 text-red-500 font-bold px-3 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 mx-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
