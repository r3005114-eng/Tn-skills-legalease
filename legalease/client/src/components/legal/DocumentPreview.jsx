import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  Copy, 
  Check, 
  Edit3, 
  Save, 
  Printer, 
  RefreshCw,
  FileCode,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';

export default function DocumentPreview({ 
  title, 
  content, 
  onContentChange, 
  onSave, 
  onRegenerateSection, 
  isGenerating = false,
  disclaimer = ''
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = async (format) => {
    try {
      setExporting(true);
      if (format === 'txt') {
        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } else {
        const blob = await api.exportDraftFile(format, title, content);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      alert(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0E17] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-800 bg-slate-900/70">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Live Document Preview
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
            {isEditing ? 'Editing Mode' : 'Formal Preview'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isEditing 
                ? 'bg-blue-600 text-white border-blue-500' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Finish Editing' : 'Edit Text'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
            title="Copy draft to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Export dropdown / buttons */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={exporting}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-blue-600 rounded transition-colors font-medium"
              title="Export formatted PDF"
            >
              PDF
            </button>
            <span className="text-slate-600 text-xs">|</span>
            <button
              onClick={() => handleDownload('docx')}
              disabled={exporting}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-blue-600 rounded transition-colors font-medium"
              title="Export Microsoft Word (.docx)"
            >
              DOCX
            </button>
            <span className="text-slate-600 text-xs">|</span>
            <button
              onClick={() => handleDownload('txt')}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-blue-600 rounded transition-colors font-medium"
              title="Export plain text"
            >
              TXT
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Print document"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Workspace Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#070A11] custom-scrollbar flex justify-center">
        <div className="w-full max-w-3xl min-h-[750px] p-8 md:p-12 legal-paper rounded-lg relative">
          {/* Header watermark */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800 text-[11px] text-slate-500 font-mono">
            <span>LEGALEASE FIRST-PASS DRAFT</span>
            <span>INDIAN JURISDICTION COMPLIANT</span>
          </div>

          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full h-[650px] bg-transparent text-slate-200 font-mono text-sm leading-relaxed p-2 focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded resize-none"
              placeholder="Edit draft content..."
            />
          ) : (
            <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed font-serif">
              {content.split('\n').map((line, idx) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('# ')) {
                  return (
                    <h1 key={idx} className="text-xl md:text-2xl font-bold font-sans text-center text-slate-100 tracking-wide uppercase my-6 pb-2 border-b border-slate-800">
                      {trimmed.replace('# ', '')}
                    </h1>
                  );
                }
                if (trimmed.startsWith('## ')) {
                  return (
                    <h2 key={idx} className="text-base md:text-lg font-semibold font-sans text-slate-100 mt-6 mb-3">
                      {trimmed.replace('## ', '')}
                    </h2>
                  );
                }
                if (trimmed.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-sm font-semibold font-sans text-blue-400 uppercase tracking-wider mt-5 mb-2">
                      {trimmed.replace('### ', '')}
                    </h3>
                  );
                }
                if (trimmed === '---') {
                  return <hr key={idx} className="my-6 border-slate-800" />;
                }
                if (!trimmed) {
                  return <div key={idx} className="h-3" />;
                }
                return (
                  <p key={idx} className="my-2.5 text-slate-300 leading-relaxed text-justify">
                    {trimmed}
                  </p>
                );
              })}
            </div>
          )}

          {/* Legal Stamp Duty & Verification Notice */}
          <div className="mt-12 pt-6 border-t border-slate-800/80 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-amber-400/90 font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Statutory Execution Notice (Indian Law)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {disclaimer || "This document is an AI-assisted first-pass draft prepared for informational and preparatory drafting purposes. Under the Indian Stamp Act, 1899 and applicable State Stamp Duty laws, this agreement must be engrossed on non-judicial stamp paper of appropriate denomination and registered if required by Section 17 of the Registration Act, 1908. Consult an advocate to finalize covenants."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
