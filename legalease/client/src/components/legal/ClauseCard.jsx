import React, { useState } from 'react';
import Badge from '../common/Badge';
import { ChevronDown, ChevronUp, FileText, ArrowRight } from 'lucide-react';

export default function ClauseCard({ clause, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-[#0B101B] border border-slate-800/90 rounded-xl overflow-hidden transition-all hover:border-slate-700/80">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 cursor-pointer select-none bg-slate-900/40 hover:bg-slate-900/70"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
          <h4 className="text-sm font-semibold text-slate-100">{clause.title}</h4>
        </div>
        <div className="flex items-center gap-3">
          <Badge level={clause.attentionLevel} />
          {clause.sourceReference && (
            <span className="text-xs font-mono text-slate-400 hidden sm:inline-block bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
              {clause.sourceReference}
            </span>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3.5 text-xs text-slate-300">
          <div>
            <div className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>Plain-Language Explanation</span>
            </div>
            <p className="leading-relaxed text-slate-200 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
              {clause.plainLanguageExplanation}
            </p>
          </div>

          <div>
            <div className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-[11px]">
              Why It Matters
            </div>
            <p className="leading-relaxed text-slate-300">
              {clause.whyItMatters}
            </p>
          </div>

          {clause.sourceReference && (
            <div className="pt-1 flex items-center gap-2 text-slate-400">
              <span className="font-mono text-[11px] text-blue-400">Document Anchor:</span>
              <span className="text-[11px]">{clause.sourceReference}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
