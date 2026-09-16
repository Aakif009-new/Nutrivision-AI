'use client';

import React, { useState } from 'react';
import FormInput from './FormInput';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function PasswordInput({ label, error, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <FormInput
        label={label}
        type={show ? 'text' : 'password'}
        error={error}
        icon={<span>🔒</span>}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-[32px] text-slate-400 hover:text-slate-600 select-none text-base outline-none"
      >
        {show ? '👁️' : '👁️‍🗨️'}
      </button>
    </div>
  );
}
