'use client';

import React, { useState } from 'react';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import FormInput from '@/components/shared/FormInput';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (message.trim().length < 10) {
      setErrorMsg('Message must be at least 10 characters long.');
      setLoading(false);
      return;
    }

    // Mock submission latency
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 600);
  };

  const handleReset = () => {
    setSent(false);
    setEmail('');
    setFirstName('');
    setLastName('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <NavBar />

      <section className="flex-1 py-16 px-6 flex items-center justify-center">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Details */}
          <div className="space-y-6 select-none">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/15 px-3 py-1.5 rounded-full uppercase tracking-wider">
              Help Desk
            </span>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Contact support</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Have questions about nutrition statistics, food detection configurations, or custom API limits? Reach out and we will respond in under 24 hours.
            </p>
            <div className="space-y-3.5 text-xs text-slate-600 font-semibold">
              <div className="flex items-center gap-2">
                <span>📧</span> support@nutrivision.ai
              </div>
              <div className="flex items-center gap-2">
                <span>📍</span> 100 Health Tech Lane, Suite 400
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-md">
            {sent ? (
              <div className="text-center py-10 space-y-4 select-none">
                <span className="text-4xl block">✅</span>
                <h3 className="text-base font-bold text-slate-800">Inquiry Sent Successfully</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Thank you for reaching out! A nutrition specialist will review your request shortly.
                </p>
                <button
                  onClick={handleReset}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-6 py-2.5 rounded-xl transition-all"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3.5 bg-red-50 border border-red-200/60 rounded-xl text-red-500 text-xs font-semibold">
                    ⚠️ {errorMsg}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="John"
                  />
                  <FormInput
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Doe"
                  />
                </div>

                <FormInput
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  icon={<span>📧</span>}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest select-none">
                    Message Body
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full bg-slate-100 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
                    placeholder="How can we help you track targets?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-emerald-500/10 flex items-center justify-center gap-2 select-none"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Submit Inquiry'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
