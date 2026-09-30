import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded text-xs text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span>LegalEase provides legal information & drafting assistance. Not a substitute for a qualified legal practitioner.</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-lg p-3 text-xs text-slate-400 flex items-start gap-3 shadow-sm">
      <AlertTriangle className="w-4 h-4 text-amber-500/90 shrink-0 mt-0.5" />
      <div>
        <span className="font-medium text-slate-300 mr-1.5">Legal Notice & Disclaimer:</span>
        LegalEase is an artificial intelligence-assisted legal technology platform designed for informational, educational, and preparatory drafting workflows under Indian law. It does not provide legal advice, representation, or establish an advocate-client relationship. Prior to signing or submitting any document in a court or official proceeding, always consult an enrolled advocate or qualified legal practitioner.
      </div>
    </div>
  );
}
