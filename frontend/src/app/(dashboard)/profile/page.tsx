'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import FormInput from '@/components/shared/FormInput';
import StatCard from '@/components/shared/StatCard';
import { Camera, Settings, Utensils, Heart, Zap } from 'lucide-react';

export default function ProfilePage() {
  const { profile } = useAuth();

  const [name, setName] = useState(profile?.username || 'Jordan');
  const [email, setEmail] = useState(profile?.email || 'jordan@example.com');
  const [age, setAge] = useState('26');
  const [weight, setWeight] = useState('72');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Dietary tags select filters
  const [tags, setTags] = useState([
    { id: '1', label: 'Vegetarian', active: true },
    { id: '2', label: 'Gluten-Sensitive', active: true },
    { id: '3', label: 'Low Sodium', active: true },
    { id: '4', label: 'High Protein', active: false },
    { id: '5', label: 'Mediterranean', active: false },
    { id: '6', label: 'Keto Friendly', active: false },
  ]);

  const toggleTag = (id: string) => {
    setTags((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaved(true);
      setSaving(false);
      setTimeout(() => setSaved(false), 2000);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Profile Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-5 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left select-none">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-white text-2xl relative shadow-md shadow-emerald-500/10 select-none">
            {name[0].toUpperCase()}
            {/* Camera Overlay mock button */}
            <span className="absolute bottom-0 right-0 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center border border-white cursor-pointer select-none">
              <Camera className="w-3 h-3 text-white" strokeWidth={2.5} />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <h2 className="text-lg font-bold text-slate-800 capitalize select-all">{name}</h2>
              <span className="bg-emerald-500/10 border border-emerald-500/15 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full select-none">
                Pro Member
              </span>
            </div>
            <span className="text-[10px] text-slate-450 font-semibold select-all block mt-0.5">{email}</span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block mt-1 select-none">
              Member since: July 2026
            </span>
          </div>
        </div>

        <button
          onClick={() => window.location.href = '/settings'}
          className="bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold px-5 py-3 rounded-xl transition-all flex items-center gap-1.5 select-none"
        >
          <Settings className="w-4 h-4" strokeWidth={2.2} /> Edit Settings
        </button>
      </div>

      {/* Profile Stat Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
        <StatCard
          label="Total Scans Logged"
          value="47 Meals"
          trend="Scanned this month"
          icon={<Utensils className="w-5 h-5 text-purple-650" strokeWidth={2} />}
          iconBgClass="bg-purple-500/10 text-purple-650"
        />
        <StatCard
          label="Avg Health Score"
          value="88.4 Rating"
          trend="Excellent standard"
          icon={<Heart className="w-5 h-5 text-emerald-600" strokeWidth={2} />}
          iconBgClass="bg-emerald-500/10 text-emerald-650"
        />
        <StatCard
          label="Active Streak"
          value="12 Days"
          trend="🔥 3 days to gold badge!"
          icon={<Zap className="w-5 h-5 text-amber-650" strokeWidth={2} />}
          iconBgClass="bg-amber-500/10 text-amber-650"
        />
      </div>

      {/* Grid forms details vs Dietary preferences tags */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Personal Details (2/3) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-50 pb-2.5 select-none">
            Personal Parameters
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            {saved && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/60 rounded-xl text-emerald-600 text-xs font-semibold">
                ✅ Changes saved successfully!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <FormInput
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<span>📧</span>}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Age (years)"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
              <FormInput
                label="Weight (kg)"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-450 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 select-none"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Save Profile Changes'
              )}
            </button>
          </form>
        </div>

        {/* Dietary Preferences Tags (1/3) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4 select-none">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-50 pb-2.5">
            Dietary Preferences
          </h3>

          <p className="text-[10px] text-slate-400 leading-normal">
            Click tags below to toggle dietary filter profiles used to customize AI recommendations.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  tag.active
                    ? 'bg-emerald-50 border-emerald-200/60 text-emerald-600 shadow-sm'
                    : 'bg-slate-50 border-slate-150 text-slate-450 hover:bg-slate-100 hover:text-slate-600'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
