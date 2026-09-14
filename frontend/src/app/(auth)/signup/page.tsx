'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FormInput from '../../../components/shared/FormInput';
import PasswordInput from '../../../components/shared/PasswordInput';
import { useAuth } from '../../../context/AuthContext';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const { register } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Bypassed for local frontend testing
    await register(username, email);
    setSuccessMsg('Account registered successfully! Redirecting...');
    setTimeout(() => {
      window.location.href = '/dashboard';
      setLoading(false);
    }, 850);
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Create Account</h2>
          <p className="text-slate-500 text-xs mt-1">Start tracking food fresh statistics for free</p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200/60 rounded-xl text-emerald-600 text-xs font-semibold">
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <FormInput
            label="User Name"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. jsmith"
            icon={<span>👤</span>}
          />

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

          <div className="flex items-center gap-2.5 text-xs pt-1 select-none">
            <input
              type="checkbox"
              id="terms"
              defaultChecked
              className="w-4 h-4 accent-emerald-500 rounded border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor="terms" className="text-slate-400 font-medium">
              I agree to the <Link href="/privacy" className="text-emerald-500 hover:text-emerald-600 font-bold transition-colors">Terms and Privacy Policy</Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-emerald-500/10 mt-6 flex items-center justify-center gap-2 select-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-450 select-none">
          <span>Already have an account? </span>
          <Link href="/login" className="text-emerald-500 hover:text-emerald-600 font-bold transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
