import React from 'react';
import { Info, AlertCircle, HelpCircle } from 'lucide-react';

export default function Badge({ level, className = '' }) {
  const norm = (level || 'Informational').toLowerCase();

  if (norm.includes('verify') || norm.includes('important')) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}>
        <AlertCircle className="w-3 h-3" />
        Important to verify
      </span>
    );
  }

  if (norm.includes('review') || norm.includes('recommended')) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 ${className}`}>
        <HelpCircle className="w-3 h-3" />
        Review recommended
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/60 ${className}`}>
      <Info className="w-3 h-3 text-slate-400" />
      Informational
    </span>
  );
}
