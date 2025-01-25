import React from 'react';

interface EmailInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suffix: string;
}

export default function EmailInput({ value, onChange, suffix }: EmailInputProps) {
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-white">
        Email address
      </label>
      <div className="mt-1 flex rounded-md shadow-sm">
        <input
          id="email"
          name="email"
          type="text"
          autoComplete="email"
          required
          value={value}
          onChange={onChange}
          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          placeholder="your.name"
        />
        <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-white/10 bg-white/5 text-gray-300 text-sm">
          {suffix}
        </span>
      </div>
    </div>
  );
}