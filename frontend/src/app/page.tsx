'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import NavBar from '../components/layout/NavBar';
import Footer from '../components/layout/Footer';
import ScoreBadge from '../components/shared/ScoreBadge';

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const features = [
    { title: 'AI-Powered Detection', desc: 'Identify multiple food items instantly from a single image capture.', gradient: 'from-emerald-400 to-emerald-600', icon: '📷' },
    { title: 'Deep Nutrition Analysis', desc: 'Retrieve full caloric and macronutrient statistics in seconds.', gradient: 'from-teal-400 to-teal-600', icon: '📊' },
    { title: 'Instant Freshness Scoring', desc: 'Understand item quality ratings and estimate shelf-life days.', gradient: 'from-amber-400 to-orange-500', icon: '🍎' },
    { title: 'Privacy First Storage', desc: 'All uploads are secure. You maintain full ownership of your data.', gradient: 'from-purple-400 to-indigo-500', icon: '🔒' },
    { title: 'Track Smart Trends', desc: 'Monitor aggregate calorie totals and progress curves over time.', gradient: 'from-rose-400 to-pink-500', icon: '📈' },
    { title: 'Custom Health Scoring', desc: 'Receive personalized recommendations based on your USDA targets.', gradient: 'from-blue-400 to-indigo-600', icon: '💡' },
  ];

  const steps = [
    { num: '1', title: 'Snap or Upload', desc: 'Take a photo of your plate or drop an image into the scanner workspace.' },
    { num: '2', title: 'AI Analyzes', desc: 'Our computer vision engine detects items, checks freshness, and maps USDA metrics.' },
    { num: '3', title: 'Get Insights', desc: 'Receive real-time macro breakdowns, health advice, and logs summaries.' },
  ];

  const testimonials = [
    { name: 'Sarah Jenkins', role: 'Fitness Coach', quote: 'NutriVision transformed how my clients track calories. They snap a photo and they are done!' },
    { name: 'David Chen', role: 'Daily User', quote: 'The freshness analysis is incredibly helpful. I know exactly what to cook before it goes bad.' },
    { name: 'Dr. Emily Carter', role: 'Nutritionist', quote: 'The USDA database integration makes the nutritional aggregates very accurate. Highly recommend.' },
  ];

  const faqs = [
    { q: 'How accurate is the AI detection?', a: 'Our models are trained on large food classification datasets, achieving over 97% detection accuracy on common dishes and ingredients.' },
    { q: 'How does it analyze freshness?', a: 'We use EfficientNet classifiers to inspect visual parameters like discoloration or spots, estimating remaining shelf life.' },
    { q: 'Is my data private?', a: 'Yes. All scans are secured, and we never share your personal health details or images with third parties.' },
    { q: 'Can I customize my target goals?', a: 'Yes. In your settings dashboard, you can configure custom budgets for calories, proteins, carbohydrates, and fats.' },
    { q: 'Is there a mobile application?', a: 'NutriVision AI is fully responsive. It works perfectly on smartphones as a PWA directly in your browser.' },
  ];

  const toggleFaq = (idx: number) => {
    setFaqOpen(faqOpen === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <NavBar />

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 px-6 bg-gradient-to-br from-emerald-50/40 via-teal-50/20 to-blue-50/30 overflow-hidden flex-1 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero details */}
          <div className="space-y-6 text-left select-none">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/15 uppercase tracking-wider">
              ✨ AI-Powered Nutrition Analysis
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-800 leading-[1.1]">
              Know exactly <br />
              what&apos;s <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">in your food</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-lg">
              Snap a photo. Get instant AI analysis — calories, macros, vitamins, freshness score, and personalized health recommendations in under 2 seconds.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/signup"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/25"
              >
                Try for Free
              </Link>
              <Link
                href="/scanner"
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-6 py-3.5 rounded-xl transition-all"
              >
                Scan Mock Demo
              </Link>
            </div>
            
            {/* Stat tags */}
            <div className="grid grid-cols-3 gap-4 pt-6 max-w-md border-t border-slate-200/60">
              <div>
                <span className="block text-lg font-bold text-slate-800">15K+</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Foods Detected</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-slate-800">97.3%</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">AI Accuracy</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-slate-800">&lt; 2s</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Response Time</span>
              </div>
            </div>
          </div>

          {/* Right Live Demo Card */}
          <div className="flex justify-center relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/10 to-transparent blur-2xl rounded-full" />
            
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative w-full max-w-md space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop"
                  alt="Greek Salad Bowl"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <ScoreBadge score={92} />
                </div>
                <div className="absolute top-4 left-4 bg-zinc-950/70 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full select-none">
                  98.7% Confidence
                </div>
              </div>

              <div className="flex justify-between items-center select-none">
                <div>
                  <h4 className="font-bold text-slate-800 text-base">Greek Salad Bowl</h4>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
                    Freshness Index: 96%
                  </span>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/15 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-xl">
                  🥗 Balanced Meal
                </div>
              </div>

              {/* Nutrition Tiles */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center select-none">
                <div className="bg-slate-50 rounded-xl p-2">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Calories</span>
                  <span className="text-xs font-bold text-emerald-500 block mt-0.5">210 kcal</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-2">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Protein</span>
                  <span className="text-xs font-semibold text-slate-700 block mt-0.5">8g</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-2">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Carbs</span>
                  <span className="text-xs font-semibold text-slate-700 block mt-0.5">18g</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-2">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Fat</span>
                  <span className="text-xs font-semibold text-slate-700 block mt-0.5">12g</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-white border-y border-slate-100 select-none">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">AI Nutrition Features</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Equipped with deep learning models to process your plate in secondary intervals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 text-left space-y-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center text-xl text-white shadow-md`}>
                  {feat.icon}
                </div>
                <h3 className="font-bold text-slate-800 text-base">{feat.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works (Dark) */}
      <section className="py-20 px-6 bg-zinc-900 border-b border-zinc-800 text-zinc-400 select-none">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">How It Works</h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              Scan, analyze, and track targets in three straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="space-y-4 text-center">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto shadow-lg shadow-emerald-500/10">
                  {step.num}
                </div>
                <h3 className="font-bold text-white text-base">{step.title}</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white select-none">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Loved by Health Enthusiasts</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Hear what our community says about their scanning tracking journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 text-left space-y-4">
                <div className="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</div>
                <p className="text-xs text-slate-600 italic leading-relaxed">&ldquo;{test.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-700">
                    {test.name[0]}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{test.name}</h5>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-200/60 select-none">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-sm">
              Quick answers to common questions about our AI food scanners.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = faqOpen === idx;
              return (
                <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-200">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center px-6 py-4.5 text-left font-bold text-slate-800 text-sm outline-none"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs text-slate-500 leading-relaxed border-t border-slate-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center select-none">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Ready to map your plate?</h2>
          <p className="text-emerald-50 text-sm max-w-md mx-auto leading-relaxed">
            Create an account instantly and unlock full access to scanner canvas boxes, detailed macros splits, and downloadable PDF logs history.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="bg-white hover:bg-slate-50 text-emerald-600 font-bold px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
