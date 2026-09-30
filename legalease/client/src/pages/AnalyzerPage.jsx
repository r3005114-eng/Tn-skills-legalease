import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  MessageSquare, 
  Clock, 
  DollarSign, 
  Users, 
  ShieldAlert, 
  HelpCircle, 
  ArrowRight,
  Save,
  RotateCw,
  FileCheck,
  FileCode,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { useLegal } from '../context/LegalContext';
import ClauseCard from '../components/legal/ClauseCard';
import Badge from '../components/common/Badge';
import SkeletonLoader from '../components/common/SkeletonLoader';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

export default function AnalyzerPage() {
  const { setActiveDocument, setActiveView, addNotification } = useLegal();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentMetadata, setDocumentMetadata] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'clauses' | 'parties' | 'risks'
  const [exporting, setExporting] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      processSelectedFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processSelectedFile(selected);
    }
  };

  const processSelectedFile = async (selectedFile) => {
    setFile(selectedFile);
    setUploading(true);
    setUploadProgress(20);

    try {
      // Simulate real file progress upload
      const progressTimer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressTimer);
            return 85;
          }
          return prev + 25;
        });
      }, 150);

      const uploadRes = await api.uploadDocument(selectedFile);
      clearInterval(progressTimer);
      setUploadProgress(100);
      setUploading(false);

      if (uploadRes.success) {
        setDocumentMetadata(uploadRes.document);
        // Start 10-point analysis
        triggerAnalysis(uploadRes.document.id);
      }
    } catch (err) {
      setUploading(false);
      alert(`File upload failed: ${err.message}`);
    }
  };

  const triggerAnalysis = async (documentId) => {
    setAnalyzing(true);
    try {
      const res = await api.analyzeDocument({ documentId });
      if (res.success) {
        setAnalysis(res.analysis);
        addNotification('Analysis Complete', `10-point analysis ready for ${documentMetadata?.fileName || 'document'}.`);
      }
    } catch (err) {
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = async (format) => {
    if (!documentMetadata?.id) return;
    try {
      setExporting(true);
      const blob = await api.exportDocumentReport(documentMetadata.id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentMetadata.fileName}_Analysis_Report.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert(`Export failed: ${e.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleAskQuestions = () => {
    if (documentMetadata) {
      setActiveDocument({
        ...documentMetadata,
        rawText: analysis?.executiveSummary || ''
      });
      setActiveView('assistant');
    }
  };

  // Sample quick test document loader
  const handleLoadSample = async () => {
    const sampleText = `RESIDENTIAL LEASE AGREEMENT
This Agreement made on 01-04-2026 at Bengaluru between Shri R. Sharma (Lessor) and Shri A. Gupta (Lessee).
1. Premises: 3BHK Apartment, Indiranagar, Bengaluru.
2. Term: 11 Months commencing from 01-04-2026.
3. Monthly Rent: INR 35,000 payable on or before 5th of each month.
4. Security Deposit: INR 2,00,000 refundable upon peaceful handover.
5. Notice Period: 30 days prior written notice by either party.
6. Governing Law: Laws of India and courts in Bengaluru shall have exclusive jurisdiction.
7. Confidentiality & Restrictions: Lessee shall not sublet without prior written consent.`;

    setDocumentMetadata({
      id: 'doc_sample_lease_01',
      fileName: 'Sample_Bengaluru_Residential_Lease.pdf',
      fileType: 'application/pdf',
      fileSize: 45200,
      pageCount: 3,
      previewText: sampleText
    });

    setAnalyzing(true);
    try {
      const res = await api.analyzeDocument({
        rawText: sampleText,
        fileName: 'Sample_Bengaluru_Residential_Lease.pdf'
      });
      if (res.success) {
        setAnalysis(res.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-500" />
            <span>Document Analyzer</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Deep 10-point clause extraction, neutral risk indicators, and legal counsel questions under Indian law.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!analysis && (
            <button
              onClick={handleLoadSample}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
            >
              Load Sample Lease
            </button>
          )}

          {analysis && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAskQuestions}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-md shadow-blue-500/10"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask Questions</span>
              </button>

              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                title="Download Summary Report (PDF)"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>PDF Report</span>
              </button>

              <button
                onClick={() => handleExport('docx')}
                disabled={exporting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                title="Download Word Report (DOCX)"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span>DOCX</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Zone (Shown prominently or as collapsed bar if document analyzed) */}
      {!analysis ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="p-8 sm:p-12 border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl bg-[#090D17]/70 text-center transition-all flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
            <Upload className="w-6 h-6" />
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-slate-100">
            Drop your legal document here
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Supports PDF, DOCX, and TXT files up to 15MB. Encrypted and processed in compliance with DPDP 2023.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/10"
            >
              Select File from Device
            </button>
          </div>

          {/* Upload progress indicator */}
          {uploading && (
            <div className="w-full max-w-md mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Uploading {file?.name}...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-200" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Document Mini Banner */
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-200 text-sm">{documentMetadata?.fileName}</span>
              <div className="text-slate-400 text-[11px] mt-0.5">
                {documentMetadata?.pageCount} Page(s) &bull; {(documentMetadata?.fileSize / 1024).toFixed(1)} KB &bull; Type: <span className="text-blue-400 font-medium">{analysis.documentType}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setAnalysis(null); setDocumentMetadata(null); }}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Analyze Another Document
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {analyzing && (
        <div className="space-y-4">
          <SkeletonLoader text="Analyzing document structure and extracting clauses..." lines={4} />
          <SkeletonLoader text="Reviewing statutory obligations under Indian law..." lines={3} />
        </div>
      )}

      {/* 10-Point Analysis Output */}
      {analysis && !analyzing && (
        <div className="space-y-6">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
            {[
              { id: 'overview', label: '1. Executive Overview & Dates' },
              { id: 'clauses', label: '2. Important Clauses & Attention Points' },
              { id: 'parties', label: '3. Parties, Financials & Obligations' },
              { id: 'lawyer', label: '4. Questions to Ask a Lawyer' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Overview & Dates */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 1. Executive Summary */}
              <div className="p-5 rounded-xl bg-[#0B101D] border border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                  1. Executive Summary
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {analysis.executiveSummary}
                </p>
              </div>

              {/* 2. Document Type & 4. Important Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-[#0B101D] border border-slate-800 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    2. Document Type Classification
                  </div>
                  <h4 className="text-sm font-semibold text-white">{analysis.documentType}</h4>
                  <p className="text-xs text-slate-400">
                    Governed by the Indian Contract Act, 1872 and related domain-specific statutes.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[#0B101D] border border-slate-800 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>4. Critical Contractual Dates</span>
                  </div>
                  <div className="space-y-2">
                    {(analysis.importantDates || []).map((date, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-slate-900/60 border border-slate-800/60">
                        <span className="font-medium text-slate-300">{date.label}</span>
                        <span className="font-mono text-blue-400">{date.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 7. Termination Conditions */}
              <div className="p-5 rounded-xl bg-[#0B101D] border border-slate-800 space-y-3">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>7. Termination Conditions & Notice Periods</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(analysis.terminationConditions || []).map((term, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                      <span className="font-semibold text-slate-200 block">{term.clause}</span>
                      <div className="text-slate-400 text-[11px]">Notice: <span className="text-blue-400 font-mono">{term.noticePeriod}</span></div>
                      {term.curePeriod && <div className="text-slate-400 text-[11px]">Cure Period: <span className="text-slate-300">{term.curePeriod}</span></div>}
                      <p className="text-[11px] text-slate-400 mt-1">{term.consequences}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Important Clauses & Attention Points */}
          {activeTab === 'clauses' && (
            <div className="space-y-6">
              {/* 9. Potential Areas Requiring Attention */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>9. Potential Areas Requiring Attention</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Neutral Observation &bull; Non-Adjudicative</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(analysis.attentionPoints || []).map((point, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#0C1220] border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-100">{point.title}</span>
                        <Badge level={point.severity} />
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {point.description}
                      </p>
                      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                        <span className="text-blue-400 font-medium mr-1">Recommendation:</span>
                        {point.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 8. Important Clauses Breakdown */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>8. Key Clauses Plain-Language Analysis</span>
                </div>

                <div className="space-y-3">
                  {(analysis.importantClauses || []).map((clause, idx) => (
                    <ClauseCard key={idx} clause={clause} defaultOpen={idx === 0} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Parties, Financials & Obligations */}
          {activeTab === 'parties' && (
            <div className="space-y-6">
              {/* 3. Parties */}
              <div className="p-5 rounded-xl bg-[#0B101D] border border-slate-800 space-y-3">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>3. Contracting Parties</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(analysis.parties || []).map((p, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                      <span className="text-[10px] uppercase font-mono text-blue-400 font-semibold">{p.role}</span>
                      <div className="text-sm font-semibold text-slate-100">{p.name}</div>
                      <div className="text-slate-400 text-[11px]">{p.details}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Financial Terms */}
              <div className="p-5 rounded-xl bg-[#0B101D] border border-slate-800 space-y-3">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>5. Financial Terms & Consideration</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(analysis.financialTerms || []).map((f, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                      <span className="text-slate-400 text-[11px]">{f.label}</span>
                      <div className="text-base font-bold text-emerald-400 font-mono">{f.amount}</div>
                      <div className="text-slate-400 text-[11px]">{f.frequency} &bull; {f.details}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Obligations */}
              <div className="p-5 rounded-xl bg-[#0B101D] border border-slate-800 space-y-3">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  6. Substantive Contractual Obligations
                </div>
                <div className="space-y-2">
                  {(analysis.obligations || []).map((o, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs flex items-start justify-between gap-3">
                      <div>
                        <span className="text-blue-400 font-medium mr-2">[{o.party}]</span>
                        <span className="text-slate-200">{o.obligation}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono shrink-0 ${
                        o.priority === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {o.priority} Priority
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Questions to Ask a Lawyer */}
          {activeTab === 'lawyer' && (
            <div className="p-6 rounded-xl bg-[#0B101D] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>10. Specific Questions to Ask an Enrolled Advocate</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Take these targeted questions to your legal consultation to clarify jurisdiction specifics, state stamp duty, and liability exposure.
              </p>

              <div className="space-y-3 pt-2">
                {(analysis.questionsForLawyer || []).map((q, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-200 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-mono text-[11px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{q}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500">Need immediate elaboration on any clause?</span>
                <button
                  onClick={handleAskQuestions}
                  className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium"
                >
                  <span>Open AI Assistant with this Document</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <DisclaimerBanner />
        </div>
      )}
    </div>
  );
}
