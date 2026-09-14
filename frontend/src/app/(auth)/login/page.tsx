'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FormInput from '../../../components/shared/FormInput';
import PasswordInput from '../../../components/shared/PasswordInput';
import { useAuth } from '../../../context/AuthContext';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Bypassed for local frontend testing
    await login(email);
    setTimeout(() => {
      router.push(redirectPath);
      router.refresh();
      setLoading(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 relative font-sans">
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 text-xs mt-1">Sign in to track dietary targets goals</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <FormInput
            label="Email Address"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. name@example.com"
            icon={<span>📧</span>}
          />
          
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="flex justify-between items-center text-xs pt-1 select-none">
            <span className="text-slate-400 font-medium">Bypass Mode Active</span>
            <Link href="/forgot-password" className="text-emerald-500 hover:text-emerald-600 font-bold transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-emerald-500/10 mt-6 flex items-center justify-center gap-2 select-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-450 select-none">
          <span>Don&apos;t have an account? </span>
          <Link href="/signup" className="text-emerald-500 hover:text-emerald-600 font-bold transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800 font-sans">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
