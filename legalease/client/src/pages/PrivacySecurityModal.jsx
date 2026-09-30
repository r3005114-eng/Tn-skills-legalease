import React from 'react';
import Modal from '../components/common/Modal';
import { useLegal } from '../context/LegalContext';
import { ShieldCheck, Lock, FileText, Database, EyeOff, Server } from 'lucide-react';

export default function PrivacySecurityModal() {
  const { privacyOpen, setPrivacyOpen } = useLegal();

  const trustPrinciples = [
    {
      icon: Lock,
      title: "Zero Model Retraining on User Briefs",
      desc: "Uploaded legal briefs, contracts, and confidential party disclosures are strictly processed statelessly and are NEVER used to train foundational AI models."
    },
    {
      icon: Server,
      title: "Backend-Only API Key Isolation",
      desc: "Google Gemini API keys are sequestered strictly in the server environment. Frontend client bundles never contain or expose AI service credentials."
    },
    {
      icon: EyeOff,
      title: "DPDP Act, 2023 Principles",
      desc: "Architected around data fiduciary obligations under India's Digital Personal Data Protection Act, 2023, minimizing personal data retention."
    },
    {
      icon: Database,
      title: "Statutory Neutrality Enforcement",
      desc: "Analysis algorithms strictly differentiate verified Indian central/state statutes from AI inference, preventing false legal certainty."
    }
  ];

  return (
    <Modal
      isOpen={privacyOpen}
      onClose={() => setPrivacyOpen(false)}
      title="Privacy, Security & Legal Trust Architecture"
    >
      <div className="space-y-6">
        <div className="p-3.5 bg-blue-950/30 border border-blue-800/40 rounded-lg text-xs text-blue-200/90 leading-relaxed">
          Legal documents require stringent confidentiality safeguards. LegalEase operates with strict privacy-first guardrails designed for legal professionals, in-house counsel, and citizens.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trustPrinciples.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-slate-100 font-medium text-xs">
                  <Icon className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{item.title}</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 space-y-2">
          <h5 className="font-semibold text-slate-300">Advocate-Client Privilege Advisory</h5>
          <p className="text-[11px] leading-relaxed">
            While LegalEase enforces technical encryption and data segregation, communications with an AI system do not automatically establish statutory advocate-client privilege under Section 126 of the Indian Evidence Act, 1872 / Bharatiya Sakshya Adhiniyam, 2023. For privileged communications, review drafts with your retainers in private consultation.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => setPrivacyOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
