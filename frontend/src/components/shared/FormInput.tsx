import React, { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}

export default function FormInput({
  label,
  icon,
  error,
  className = '',
  ...props
}: FormInputProps) {
  return (
    <div className="w-full space-y-1.5 font-sans">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest select-none">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 text-slate-400 shrink-0 pointer-events-none select-none text-base">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-slate-100 border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all ${
            icon ? 'pl-11 pr-4' : 'px-4'
          } ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs font-semibold text-red-500 block animate-pulse select-none">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
}
