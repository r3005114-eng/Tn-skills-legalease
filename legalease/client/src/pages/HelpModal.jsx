import React from 'react';
import Modal from '../components/common/Modal';
import { useLegal } from '../context/LegalContext';
import { HelpCircle, BookOpen, FileCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function HelpModal() {
  const { helpOpen, setHelpOpen } = useLegal();

  const faqs = [
    {
      q: "Can I use generated documents directly in court?",
      a: "No. LegalEase generates structured first-pass drafts and executive legal information. Under Indian law, contracts and notices must be reviewed, engrossed on stamp paper of appropriate denomination, signed, and registered (if required by Section 17 of the Registration Act, 1908)."
    },
    {
      q: "How does Document Analyzer classify risk?",
      a: "Rather than labeling clauses as 'illegal' (which requires judicial adjudication), we use 3 neutral indicators: 'Informational', 'Review recommended', and 'Important to verify' to assist legal practitioners in spot-checking ambiguity."
    },
    {
      q: "Does LegalEase support vernacular languages?",
      a: "Yes. In the AI Assistant, you can request explanations in languages such as simple Tamil, Hindi, Kannada, Telugu, etc. The assistant provides vernacular conceptual summaries followed by standard statutory terms in English."
    },
    {
      q: "What file formats can I upload for analysis?",
      a: "PDF (.pdf), Microsoft Word (.docx), and plain text (.txt) up to 15MB. Scanned documents should have optical character recognition (OCR) or clean digital text."
    }
  ];

  return (
    <Modal
      isOpen={helpOpen}
      onClose={() => setHelpOpen(false)}
      title="LegalEase Platform Guidance & Indian Legal Standards"
    >
      <div className="space-y-5">
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-300">
          Welcome to LegalEase. Here is how to get the most out of your legal-tech workspace.
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-3 bg-[#0B101B] border border-slate-800 rounded-lg text-xs">
              <div className="font-semibold text-slate-100 mb-1 flex items-start gap-2">
                <span className="text-blue-400 font-mono">Q{idx + 1}.</span>
                <span>{faq.q}</span>
              </div>
              <p className="text-slate-400 pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Statutory compliance in India varies across Union legislation and State-specific enactments (e.g., State Stamp Acts, Rent Control Acts). Always verify with local practice rules.</span>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => setHelpOpen(false)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </Modal>
  );
}
