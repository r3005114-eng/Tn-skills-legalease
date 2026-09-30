import React from 'react';
import { Loader2 } from 'lucide-react';

export default function SkeletonLoader({ text = "Preparing response...", lines = 3, showCard = true }) {
  return (
    <div className={`w-full ${showCard ? 'p-5 bg-slate-900/60 border border-slate-800 rounded-xl' : ''}`}>
      <div className="flex items-center gap-2.5 text-xs text-blue-400 font-medium mb-3">
        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
        <span>{text}</span>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3.5 rounded skeleton-shimmer"
            style={{ width: i === lines - 1 ? '65%' : i % 2 === 0 ? '92%' : '84%' }}
          />
        ))}
      </div>
    </div>
  );
}
