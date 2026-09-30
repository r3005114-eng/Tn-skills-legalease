import React, { useState, useEffect } from 'react';
import { 
  PenTool, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  RotateCw, 
  Download, 
  Save, 
  Layers,
  HelpCircle,
  Building,
  Calendar,
  FileCheck2,
  DollarSign
} from 'lucide-react';
import { api } from '../services/api';
import { useLegal } from '../context/LegalContext';
import DocumentPreview from '../components/legal/DocumentPreview';
import SkeletonLoader from '../components/common/SkeletonLoader';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

export default function DraftStudioPage() {
  const { jurisdiction, activeDraft, setActiveDraft, addNotification } = useLegal();

  const [step, setStep] = useState(1);
  const [documentType, setDocumentType] = useState('Non-Disclosure Agreement (NDA)');
  const [formData, setFormData] = useState({
    party1Name: 'InnovateTech Solutions Pvt. Ltd.',
    party1Address: 'Plot 42, Electronics City Phase 1, Bengaluru, Karnataka - 560100',
    party1Role: 'Disclosing Party',
    party2Name: 'Shri Vikramaditya Verma',
    party2Address: 'Flat 402, Mayflower Apartments, Indiranagar, Bengaluru - 560038',
    party2Role: 'Receiving Party',
    effectiveDate: new Date().toISOString().split('T')[0],
    duration: '24 Months',
    noticePeriod: '30 Days written notice',
    consideration: 'mutual exchange of proprietary technical concepts and business discussions',
    governingLaw: 'Laws of India',
    arbitrationCity: 'Bengaluru, Karnataka',
    instructions: 'Include non-solicitation of key personnel and ensure compliance with Section 27 of the Indian Contract Act, 1872.'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [disclaimer, setDisclaimer] = useState('');

  const documentTypes = [
    { id: 'Non-Disclosure Agreement (NDA)', desc: 'Mutual or unilateral confidentiality and trade secret covenants.' },
    { id: 'Employment Agreement', desc: 'Appointment terms, duties, probation, and IP assignment clauses.' },
    { id: 'Freelance Agreement', desc: 'Scope of work, milestone deliverables, and copyright vesting.' },
    { id: 'Residential / Commercial Lease', desc: 'Premises description, 11-month term, security deposit, maintenance.' },
    { id: 'Formal Offer Letter', desc: 'Remuneration breakdown, designation, and conditions precedent.' },
    { id: 'Master Services Agreement', desc: 'SLA definitions, fee schedules, liability limits, and warranties.' },
    { id: 'Legal Notice (Statutory)', desc: 'Demand for payment or rectification prior to civil suit filing.' },
    { id: 'Consumer Complaint Draft', desc: 'Formal petition structure under Consumer Protection Act, 2019.' },
    { id: 'Right to Information (RTI) Draft', desc: 'Statutory petition to CPIO under Section 6 of RTI Act, 2005.' }
  ];

  // If active draft loaded from dashboard/documents
  useEffect(() => {
    if (activeDraft) {
      setDocumentType(activeDraft.documentType || 'Non-Disclosure Agreement (NDA)');
      setGeneratedDraft(activeDraft);
      setPreviewContent(activeDraft.generatedContent || '');
      setStep(5);
    }
  }, [activeDraft]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generateDraft({
        documentType,
        inputData: {
          ...formData,
          jurisdiction: formData.arbitrationCity || jurisdiction
        },
        instructions: formData.instructions
      });

      if (res.success) {
        setGeneratedDraft(res.draft);
        setPreviewContent(res.draft.generatedContent);
        setDisclaimer(res.disclaimer || '');
        addNotification('Draft Ready', `${documentType} generated for review.`);
      }
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!generatedDraft?._id && !generatedDraft?.id) {
      alert("Draft must be generated first.");
      return;
    }
    try {
      await api.saveDraft(generatedDraft._id || generatedDraft.id, {
        generatedContent: previewContent,
        title: `${documentType} - Updated`
      });
      addNotification('Draft Saved', 'Your edits have been recorded in My Documents.');
    } catch (err) {
      alert(`Failed to save draft: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <PenTool className="w-6 h-6 text-emerald-500" />
            <span>Draft Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Structured multi-step document generation tailored for Indian legal compliance.
          </p>
        </div>

        {generatedDraft && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-md shadow-blue-500/10"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {/* Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Multi-Step Input Wizard (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0B101D] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6 shadow-xl">
          {/* Step Progress Indicators */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`flex items-center gap-1.5 font-mono text-xs transition-colors ${
                  step === s 
                    ? 'text-blue-400 font-bold' 
                    : step > s 
                    ? 'text-emerald-400' 
                    : 'text-slate-600'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === s 
                    ? 'bg-blue-600 text-white' 
                    : step > s 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {step > s ? <Check className="w-3 h-3" /> : s}
                </span>
                <span className="hidden sm:inline">Step {s}</span>
              </button>
            ))}
          </div>

          {/* STEP 1: Select Document Type */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Step 1: Select Document Type</h3>
                <p className="text-xs text-slate-400 mt-0.5">Choose the standard Indian instrument to create.</p>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                {documentTypes.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setDocumentType(doc.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      documentType === doc.id
                        ? 'bg-blue-600/15 border-blue-500 text-slate-100'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{doc.id}</span>
                      {documentType === doc.id && <Check className="w-4 h-4 text-blue-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{doc.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <span>Continue to Parties</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Enter Parties */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Step 2: Contracting Parties</h3>
                <p className="text-xs text-slate-400 mt-0.5">Specify legal names, roles, and registered addresses.</p>
              </div>

              {/* Party 1 */}
              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-mono font-semibold text-blue-400 uppercase">Party of the First Part</span>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Full Legal Name / Entity</label>
                  <input
                    type="text"
                    value={formData.party1Name}
                    onChange={(e) => handleInputChange('party1Name', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Registered Address</label>
                  <input
                    type="text"
                    value={formData.party1Address}
                    onChange={(e) => handleInputChange('party1Address', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Party 2 */}
              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase">Party of the Second Part</span>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Full Legal Name / Entity</label>
                  <input
                    type="text"
                    value={formData.party2Name}
                    onChange={(e) => handleInputChange('party2Name', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Residential / Operating Address</label>
                  <input
                    type="text"
                    value={formData.party2Address}
                    onChange={(e) => handleInputChange('party2Address', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <span>Continue to Dates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Enter Important Dates */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Step 3: Important Dates & Duration</h3>
                <p className="text-xs text-slate-400 mt-0.5">Define operative commencement and duration.</p>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Effective / Commencement Date</label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Contract Duration / Term</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g. 11 Months / 2 Years / Indefinite until terminated"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Notice Period for Termination</label>
                <input
                  type="text"
                  value={formData.noticePeriod}
                  onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                  placeholder="e.g. 30 days prior written notice"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <span>Continue to Terms</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Terms and Conditions */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Step 4: Terms & Consideration</h3>
                <p className="text-xs text-slate-400 mt-0.5">Financial consideration and dispute jurisdiction.</p>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Consideration / Remuneration / Rent</label>
                <input
                  type="text"
                  value={formData.consideration}
                  onChange={(e) => handleInputChange('consideration', e.target.value)}
                  placeholder="e.g. INR 50,000 / month or Mutual exchange of confidential details"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Arbitration Seat & Court Jurisdiction</label>
                <input
                  type="text"
                  value={formData.arbitrationCity}
                  onChange={(e) => handleInputChange('arbitrationCity', e.target.value)}
                  placeholder="e.g. New Delhi / Bengaluru / Mumbai / Chennai"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Governing Law</label>
                <input
                  type="text"
                  value={formData.governingLaw}
                  onChange={(e) => handleInputChange('governingLaw', e.target.value)}
                  disabled
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-400 opacity-80"
                />
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <span>Additional Instructions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Additional Instructions & Generate */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Step 5: Additional Covenants & Generate</h3>
                <p className="text-xs text-slate-400 mt-0.5">Include custom covenants or statutory caveats.</p>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Specific Instructions for AI Legal Engine</label>
                <textarea
                  rows={4}
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  placeholder="e.g. Emphasize indemnity capped to fees paid; insert reciprocal 15-day cure period for breach..."
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-lg text-[11px] text-blue-300">
                Summary: Generating a structured <strong>{documentType}</strong> between <strong>{formData.party1Name}</strong> and <strong>{formData.party2Name}</strong>.
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => setStep(4)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-blue-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Drafting with Gemini...' : 'Generate Legal Draft'}</span>
                </button>
              </div>

              {isGenerating && (
                <div className="pt-2">
                  <SkeletonLoader text="Generating structured first-pass legal clauses under Indian Contract Act..." lines={3} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live Split-Screen Document Preview (7 Cols) */}
        <div className="lg:col-span-7 h-[700px] lg:h-[780px]">
          {previewContent ? (
            <DocumentPreview
              title={`${documentType} Draft`}
              content={previewContent}
              onContentChange={setPreviewContent}
              onSave={handleSaveDraft}
              isGenerating={isGenerating}
              disclaimer={disclaimer}
            />
          ) : (
            <div className="h-full bg-[#0A0E17] border border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-medium text-slate-300">Live Preview Awaiting Generation</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Complete the guided steps on the left and click "Generate Legal Draft" to view formatted first-pass clauses.
              </p>
              <button
                onClick={handleGenerate}
                className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
              >
                Generate Standard NDA Now
              </button>
            </div>
          )}
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
