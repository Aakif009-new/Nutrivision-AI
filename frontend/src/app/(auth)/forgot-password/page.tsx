'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FormInput from '@/components/shared/FormInput';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock reset notification dispatch latency
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 font-sans relative">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 select-none">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">
              🥗
            </div>
            <span className="font-bold text-slate-800 text-sm tracking-tight">
              NutriVision AI
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Recover Password</h2>
          <p className="text-slate-500 text-xs mt-1">We will email you a mockup recovery link</p>
        </div>

        {sent ? (
          <div className="text-center py-6 space-y-4 select-none">
            <span className="text-4xl block">📬</span>
            <h3 className="text-sm font-bold text-slate-800">Check your inbox</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We have sent a password recovery link to:<br />
              <strong className="text-slate-700 block mt-1 select-all">{email}</strong>
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              icon={<span>📧</span>}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-emerald-500/10 flex items-center justify-center gap-2 select-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send Recovery Link'
              )}
            </button>

            <div className="text-center mt-4">
              <Link href="/login" className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
