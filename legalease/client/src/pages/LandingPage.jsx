import React from 'react';
import { 
  Scale, 
  MessageSquare, 
  FileSearch, 
  PenTool, 
  BookOpen, 
  ShieldCheck, 
  Lock, 
  CheckCircle, 
  ArrowRight, 
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useLegal } from '../context/LegalContext';
import { useAuth } from '../context/AuthContext';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

export default function LandingPage() {
  const { setActiveView } = useLegal();
  const { user, demoLogin } = useAuth();

  const handleStartAssistant = () => {
    setActiveView('assistant');
  };

  const handleStartAnalyzer = () => {
    setActiveView('analyzer');
  };

  const handleDashboard = async () => {
    await demoLogin();
    setActiveView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col selection:bg-blue-600/30">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-[#090D17]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center border border-blue-400/20">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white">LegalEase</span>
            <span className="text-[10px] ml-1.5 font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">INDIA</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs text-slate-400 font-medium">
          <button onClick={() => setActiveView('assistant')} className="hover:text-slate-200 transition-colors">AI Assistant</button>
          <button onClick={() => setActiveView('analyzer')} className="hover:text-slate-200 transition-colors">Document Analyzer</button>
          <button onClick={() => setActiveView('draft-studio')} className="hover:text-slate-200 transition-colors">Draft Studio</button>
          <button onClick={() => setActiveView('library')} className="hover:text-slate-200 transition-colors">Legal Library</button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDashboard}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/10"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Subtle badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Indian Legal Intelligence & Drafting Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white font-sans max-w-4xl leading-[1.15]">
          Legal clarity, powered by AI.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl font-normal leading-relaxed">
          Understand legal documents, explore legal information, and create first-pass legal drafts — all in one secure workspace.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleStartAssistant}
            className="flex items-center gap-2.5 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Start with AI Assistant</span>
          </button>

          <button
            onClick={handleStartAnalyzer}
            className="flex items-center gap-2.5 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-sm font-semibold rounded-xl transition-all active:scale-[0.98]"
          >
            <FileSearch className="w-4 h-4 text-blue-400" />
            <span>Analyze a Document</span>
          </button>
        </div>

        {/* Professional Product Preview / Mock Dashboard */}
        <div className="mt-14 w-full max-w-5xl rounded-2xl border border-slate-800 bg-[#0B101D] shadow-2xl overflow-hidden p-2 sm:p-4 text-left">
          {/* Mock Window Controls */}
          <div className="flex items-center justify-between pb-3 px-3 border-b border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" />
              <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" />
              <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" />
              <span className="ml-3 font-mono text-slate-500 text-[11px]">app.legalease.in/workspace</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Workspace: India (Central & State Jurisdiction)</span>
            </div>
          </div>

          {/* Mock Workspace Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                <FileSearch className="w-4 h-4" />
                <span>10-Point Analysis Engine</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Residential Lease Agreement</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Executive summary generated. Clause 7 identified: 15-day statutory notice check under Section 106, Transfer of Property Act.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Review recommended
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <PenTool className="w-4 h-4" />
                <span>Live Split-Screen Studio</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Non-Disclosure Agreement (NDA)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bilateral trade secret protection formatted. Enforceability aligned with Section 27, Indian Contract Act. Exportable to PDF & DOCX.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Draft Ready for Review
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Verified Legal Sources</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Indian Statutory Repository</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Exact statutory sections referenced. Zero fabricated case law citations. Clear attribution to official gazettes and high courts.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Statute Verified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="px-6 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Purpose-Built for Indian Legal Workflows
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Not a generic chatbot wrapper. An institutional-grade platform with structured clause intelligence and verifiable statutory references.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-xl bg-[#0C111E] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">AI Legal Assistant</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visually structured query resolution distinguishing user facts, legal context, considerations, and verified Indian statutory provisions.
              </p>
            </div>
            <button 
              onClick={() => setActiveView('assistant')}
              className="mt-6 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              <span>Open Assistant</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-xl bg-[#0C111E] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Document Analyzer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload PDF, DOCX, or text files for instant 10-point breakdowns: parties, dates, obligations, termination conditions, and questions for counsel.
              </p>
            </div>
            <button 
              onClick={() => setActiveView('analyzer')}
              className="mt-6 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <span>Analyze Contract</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-xl bg-[#0C111E] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-600/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <PenTool className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Draft Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multi-step guided wizards for 9 essential Indian legal documents (NDAs, Leases, Employment, RTI, Legal Notices) with live preview and DOCX export.
              </p>
            </div>
            <button 
              onClick={() => setActiveView('draft-studio')}
              className="mt-6 flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              <span>Create Draft</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-xl bg-[#0C111E] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-600/15 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Legal Knowledge Library</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Curated statutory repository covering the Indian Contract Act, IT Act 2000, Consumer Protection Act 2019, Transfer of Property, and DPDP Act.
              </p>
            </div>
            <button 
              onClick={() => setActiveView('library')}
              className="mt-6 flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              <span>Browse Knowledge</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="px-6 py-16 bg-[#090D18] border-t border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Safety, Privacy & Institutional Trust
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
              Built with the rigor demanded by legal departments and judicial conventions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>Privacy-Focused Architecture</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Your legal documents, trade secrets, and party identities are never exposed in public models or retained for foundational model training.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>AI-Assisted, Human-Reviewed Workflow</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Designed to accelerate review and first drafts for advocates, legal teams, and citizens. Always intended for qualified professional oversight.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Zero Fabricated Citations</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Explicit rules prohibit hallucinating legal sections or fictional case precedents. When uncertain, the platform advises source verification.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <span>Informational Purpose Only</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                We make no false claims of being an "AI Lawyer". LegalEase provides legal information and drafting technology, not authorized legal representation.
              </p>
            </div>
          </div>

          <DisclaimerBanner />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 py-8 border-t border-slate-800/80 bg-[#070A12] text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-300">LegalEase India</span>
            <span>&copy; 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Supreme Court & High Court Benchmarks</span>
            <span>&bull;</span>
            <span>DPDP Act 2023 Compliant</span>
            <span>&bull;</span>
            <button onClick={handleDashboard} className="text-blue-400 hover:underline">
              Enter Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
