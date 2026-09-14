'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import FormInput from '@/components/shared/FormInput';
import Toggle from '@/components/shared/Toggle';
import { AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { darkMode, toggleDarkMode } = useTheme();

  // Notification states
  const [pushNotifs, setPushNotifs] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  // Nutrition goals
  const [calories, setCalories] = useState('2200');
  const [protein, setProtein] = useState('120');
  const [carbs, setCarbs] = useState('250');
  const [fat, setFat] = useState('80');
  
  const [goalsSaving, setGoalsSaving] = useState(false);
  const [goalsSaved, setGoalsSaved] = useState(false);

  // Danger Dialog box modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    setGoalsSaving(true);
    setTimeout(() => {
      setGoalsSaved(true);
      setGoalsSaving(false);
      setTimeout(() => setGoalsSaved(false), 2000);
    }, 600);
  };

  const handleDeleteAccount = () => {
    if (deleteInput === 'DELETE') {
      alert('Mock account purge triggered. Purging cookies & databases sessions...');
      window.location.href = '/login';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      
      {/* Page Header */}
      <div className="select-none">
        <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
        <p className="text-xs text-slate-450 mt-0.5">Configure display modes targets, notifications parameters, and nutrition budgets</p>
      </div>

      {/* Notifications and Appearance split grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        
        {/* Appearance preferences */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider border-b border-slate-50 pb-2.5">
            Display Preferences
          </h3>
          <div className="flex justify-between items-center py-1">
            <div>
              <span className="block text-xs font-bold text-slate-750">Toggle Dark Mode</span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Toggle light vs dark display classes</span>
            </div>
            <Toggle checked={darkMode} onChange={toggleDarkMode} />
          </div>
        </div>

        {/* Notifications preferences */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider border-b border-slate-50 pb-2.5">
            Notification Settings
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-1">
              <div>
                <span className="block text-xs font-bold text-slate-750">Push Alerts</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Receive immediate warnings and advices</span>
              </div>
              <Toggle checked={pushNotifs} onChange={setPushNotifs} />
            </div>
            <div className="flex justify-between items-center py-1">
              <div>
                <span className="block text-xs font-bold text-slate-750">Weekly PDF Reports</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Get logs compilations summaries</span>
              </div>
              <Toggle checked={weeklyReport} onChange={setWeeklyReport} />
            </div>
          </div>
        </div>

      </div>

      {/* Nutrition Goals Forms */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
        <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider border-b border-slate-50 pb-2.5 select-none">
          Dietary Target Goals
        </h3>

        <form onSubmit={handleSaveGoals} className="space-y-5">
          {goalsSaved && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200/60 rounded-xl text-emerald-600 text-xs font-semibold select-none">
              ✅ Nutritional goals targets updated!
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <FormInput
              label="Calories Target (kcal)"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              required
            />
            <FormInput
              label="Protein (g)"
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              required
            />
            <FormInput
              label="Carbohydrates (g)"
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              required
            />
            <FormInput
              label="Dietary Fats (g)"
              type="number"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={goalsSaving}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-450 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 select-none"
          >
            {goalsSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Save Dietary Targets'
            )}
          </button>
        </form>
      </div>

      {/* Danger PURGE Zone layout */}
      <div className="bg-red-50/20 border border-red-200/70 rounded-3xl p-6 shadow-sm space-y-4 select-none">
        <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider border-b border-red-150 pb-2.5">
          Danger Zone
        </h3>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="block text-xs font-bold text-slate-800">Purge account and history logs</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              Permanently purges files logs and setups. This cannot be undone.
            </span>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-red-500/5 whitespace-nowrap self-end sm:self-center"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Dialog box Delete Account Overlay Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 select-none animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-sm w-full space-y-5 shadow-2xl animate-scale-up">
            <div className="text-center space-y-2">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" strokeWidth={1.8} />
              <h4 className="text-base font-extrabold text-slate-800">Are you absolutely sure?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                This wipes all scanned photos and USDA history logs databases. Type <strong className="text-red-600">DELETE</strong> to confirm.
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Type DELETE"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full bg-slate-100 border border-transparent focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-2.5 text-center text-xs font-bold text-slate-800 outline-none transition-all"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteInput('');
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== 'DELETE'}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
