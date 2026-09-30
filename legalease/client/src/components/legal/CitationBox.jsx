import React from 'react';
import { ExternalLink, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CitationBox({ sources = [], verificationNote = '' }) {
  const hasSources = sources && sources.length > 0;

  return (
    <div className="mt-4 border-t border-slate-800/80 pt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span>Statutory Authorities & Verified Sources</span>
        </div>
        {hasSources ? (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Verified Indian Statute
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] text-amber-400/90 font-medium">
            <AlertCircle className="w-3 h-3" />
            Source verification is recommended
          </span>
        )}
      </div>

      {hasSources ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {sources.map((src, idx) => (
            <div 
              key={idx}
              className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-slate-200">{src.title}</span>
                {src.link && (
                  <a
                    href={src.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors p-0.5"
                    title="View statutory authority"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="text-slate-400 text-[11px] mt-1">
                Authority: <span className="text-slate-300">{src.authority}</span>
              </div>
              {src.relevantSection && (
                <div className="text-blue-400/90 text-[11px] font-mono mt-0.5">
                  Section: {src.relevantSection}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-dashed border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Source verification is recommended. No unambiguous central statute explicitly governs this factual scenario without judicial interpretation.</span>
        </div>
      )}

      {verificationNote && (
        <p className="mt-2 text-[11px] text-slate-400 italic">
          Note: {verificationNote}
        </p>
      )}
    </div>
  );
}
