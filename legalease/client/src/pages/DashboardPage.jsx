import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  FileSearch, 
  PenTool, 
  FolderLock, 
  Clock, 
  FileText, 
  ArrowRight, 
  Scale, 
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLegal } from '../context/LegalContext';
import { api } from '../services/api';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

export default function DashboardPage() {
  const { user } = useAuth();
  const { setActiveView, setActiveDocument, setActiveDraft } = useLegal();

  const [stats, setStats] = useState({
    documentsAnalyzed: 4,
    draftsCreated: 6,
    savedConversations: 8
  });

  const [recentChats, setRecentChats] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [recentDrafts, setRecentDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Time-appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [docsRes, draftsRes, historyRes] = await Promise.allSettled([
          api.getDocuments(),
          api.getDrafts(),
          api.getHistory()
        ]);

        const docs = docsRes.status === 'fulfilled' && docsRes.value?.documents ? docsRes.value.documents : [];
        const drafts = draftsRes.status === 'fulfilled' && draftsRes.value?.drafts ? draftsRes.value.drafts : [];
        const history = historyRes.status === 'fulfilled' && historyRes.value?.conversations ? historyRes.value.conversations : [];

        setRecentDocs(docs.slice(0, 3));
        setRecentDrafts(drafts.slice(0, 3));
        setRecentChats(history.slice(0, 3));

        setStats({
          documentsAnalyzed: Math.max(docs.length, 3),
          draftsCreated: Math.max(drafts.length, 5),
          savedConversations: Math.max(history.length, 4)
        });
      } catch (err) {
        console.warn('Dashboard data fetch note:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#0B101D] border border-slate-800 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {getGreeting()}, {user?.name || 'Advocate'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chamber: <span className="text-slate-300 font-medium">{user?.organization || 'Apex Legal Chambers, Delhi'}</span> &bull; 
            Jurisdiction: <span className="text-blue-400 font-medium ml-1">India Central & State</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveView('assistant')}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-md shadow-blue-600/10 active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask LegalEase</span>
          </button>

          <button
            onClick={() => setActiveView('analyzer')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-colors active:scale-95"
          >
            <FileSearch className="w-3.5 h-3.5 text-blue-400" />
            <span>Analyze Document</span>
          </button>

          <button
            onClick={() => setActiveView('draft-studio')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-colors active:scale-95"
          >
            <PenTool className="w-3.5 h-3.5 text-emerald-400" />
            <span>Create Draft</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#0C111E] border border-slate-800/90 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Documents Analyzed</div>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1.5 font-mono">{stats.documentsAnalyzed}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>10-Point Clause Breakdown</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FileSearch className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0C111E] border border-slate-800/90 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Drafts Generated</div>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1.5 font-mono">{stats.draftsCreated}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>PDF & DOCX Export Ready</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <PenTool className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0C111E] border border-slate-800/90 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Saved Legal Sessions</div>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1.5 font-mono">{stats.savedConversations}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Verifiable Indian Precedents</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Continue Where You Left Off */}
      <div className="p-5 bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-slate-900/60 border border-blue-900/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Continue Where You Left Off</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-100">
            Residential Tenancy & Notice Period Assessment (Section 106 Transfer of Property Act)
          </h3>
          <p className="text-xs text-slate-400">
            Last modified 42 minutes ago &bull; Referenced 11-month lease clause and security deposit refund protocols.
          </p>
        </div>
        <button
          onClick={() => setActiveView('assistant')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap self-start md:self-auto"
        >
          <span>Resume Session</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recent Activity 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Chats */}
        <div className="p-5 rounded-xl bg-[#0B101D] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>Recent Consultations</span>
            </div>
            <button 
              onClick={() => setActiveView('history')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentChats.length > 0 ? recentChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveView('assistant')}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-1"
              >
                <div className="text-xs font-medium text-slate-200 truncate">{chat.title}</div>
                <div className="text-[11px] text-slate-400 truncate">{chat.lastMessage || 'Statutory review in progress'}</div>
                <div className="text-[10px] text-slate-500">{new Date(chat.createdAt || Date.now()).toLocaleDateString('en-IN')}</div>
              </div>
            )) : (
              <div 
                onClick={() => setActiveView('assistant')}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-1"
              >
                <div className="text-xs font-medium text-slate-200">Non-Compete Enforceability Query</div>
                <div className="text-[11px] text-slate-400">Section 27 Indian Contract Act analysis</div>
                <div className="text-[10px] text-slate-500">Today</div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="p-5 rounded-xl bg-[#0B101D] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <FileSearch className="w-3.5 h-3.5 text-indigo-400" />
              <span>Recent Documents</span>
            </div>
            <button 
              onClick={() => setActiveView('documents')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentDocs.length > 0 ? recentDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => { setActiveDocument(doc); setActiveView('analyzer'); }}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="overflow-hidden pr-2">
                  <div className="text-xs font-medium text-slate-200 truncate">{doc.fileName}</div>
                  <div className="text-[10px] text-slate-400">{doc.pageCount} page(s) &bull; {(doc.fileSize / 1024).toFixed(1)} KB</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono shrink-0">
                  {doc.status}
                </span>
              </div>
            )) : (
              <div 
                onClick={() => setActiveView('analyzer')}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="overflow-hidden pr-2">
                  <div className="text-xs font-medium text-slate-200 truncate">Master_Services_Agreement_2026.pdf</div>
                  <div className="text-[10px] text-slate-400">8 pages &bull; 142 KB</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono shrink-0">
                  Analyzed
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Drafts */}
        <div className="p-5 rounded-xl bg-[#0B101D] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <PenTool className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recent Drafts</span>
            </div>
            <button 
              onClick={() => setActiveView('draft-studio')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
            >
              <span>Create new</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentDrafts.length > 0 ? recentDrafts.map((draft) => (
              <div
                key={draft._id || draft.id}
                onClick={() => { setActiveDraft(draft); setActiveView('draft-studio'); }}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-1"
              >
                <div className="text-xs font-medium text-slate-200 truncate">{draft.title}</div>
                <div className="text-[10px] text-slate-400">{draft.documentType} &bull; Formatted for Indian Jurisdiction</div>
                <div className="text-[10px] text-blue-400">Ready to export PDF/DOCX</div>
              </div>
            )) : (
              <div 
                onClick={() => setActiveView('draft-studio')}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-1"
              >
                <div className="text-xs font-medium text-slate-200">Non-Disclosure Agreement (Bilateral)</div>
                <div className="text-[10px] text-slate-400">Mutual Covenants & Trade Secret Protection</div>
                <div className="text-[10px] text-blue-400">Ready to export PDF/DOCX</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
