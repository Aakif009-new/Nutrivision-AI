import React from 'react';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  const sections = [
    { title: '1. Information We Collect', text: 'We collect uploaded food photograph bitmaps to process model inference, along with account username parameters and profile targets goals.' },
    { title: '2. How We Use Your Data', text: 'Scanned pictures are processed strictly to identify bounding coordinate boxes and classify freshness parameters. We do not use user images to train external public models without explicit opt-in consent.' },
    { title: '3. Data Security & Encryption', text: 'All storage parameters are hosted inside encrypted Supabase databases (AES-256 keys, TLS 1.3 edge tunnels). Network access controls meet standard SOC 2 guidelines.' },
    { title: '4. Your Data Rights', text: 'You maintain full data portability and deletion rights. You can purge your entire history log feed directly in the settings panel, which wipes files instantly from storage buckets.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <NavBar />

      <section className="flex-1 py-16 px-6 max-w-3xl mx-auto space-y-8 select-none">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/15 px-3 py-1.5 rounded-full uppercase tracking-wider">
            Legal Terms
          </span>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400">Last updated: August 1, 2026</p>
        </div>

        <div className="space-y-6">
          {sections.map((sec, idx) => (
            <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-2.5">
              <h3 className="text-sm font-bold text-slate-800">{sec.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{sec.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
