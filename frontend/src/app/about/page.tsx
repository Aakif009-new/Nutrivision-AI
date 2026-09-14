'use client';

import React from 'react';
import Link from 'next/link';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  const stats = [
    { label: 'Registered Users', value: '50K+' },
    { label: 'Meals Analyzed', value: '15M+' },
    { label: 'Cuisines Supported', value: '120+' },
    { label: 'Server Uptime', value: '99.9%' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <NavBar />

      {/* Hero Section */}
      <section className="py-16 md:py-20 px-6 bg-white border-b border-slate-100 select-none">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/15 px-3 py-1.5 rounded-full uppercase tracking-wider">
            Our Mission
          </span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-800 leading-tight">
            Making food tracking <br />
            as simple as taking a photo
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed pt-2">
            NutriVision AI was founded by a team of computer vision engineers and clinical nutritionists who believe that understanding what you eat shouldn&apos;t require manual logging or lookup databases.
          </p>
        </div>
      </section>

      {/* Stat Counter Grid */}
      <section className="py-12 px-6 select-none bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center shadow-sm space-y-1">
              <span className="block text-3xl font-bold text-slate-800">{stat.value}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Founding story split */}
      <section className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight select-none">Technical Architecture & Training</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We leverage custom-trained **YOLOv8** (You Only Look Once) networks optimized to identify food components on complex dining plates. This handles multi-object localization and coordinate mappings in under 1 second.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              For quality parameters and freshness detection, we integrate **EfficientNet** classification networks trained on food quality decay timelines, mapping decay curves to estimate exact remaining shelf life and alert users before spoilage occurs.
            </p>
            <div className="pt-2">
              <Link
                href="/signup"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-emerald-500/15"
              >
                Join NutriVision Today
              </Link>
            </div>
          </div>

          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 relative shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=400&fit=crop"
              alt="Healthy Foods Basket"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
