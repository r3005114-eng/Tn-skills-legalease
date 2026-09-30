import React, { useState, useEffect } from 'react';
import { 
  FolderLock, 
  Search, 
  FileText, 
  Download, 
  Trash2, 
  Edit2, 
  Star, 
  ExternalLink, 
  Clock, 
  Filter,
  Check,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { useLegal } from '../context/LegalContext';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

export default function MyDocumentsPage() {
  const { setActiveDocument, setActiveView, setActiveDraft, addNotification } = useLegal();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // All | Drafts | Analyzed | Generated | Favorites
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDocId, setEditingDocId] = useState(null);
  const [editNameValue, setEditNameValue] = useState('');

  const tabs = ['All', 'Drafts', 'Analyzed', 'Generated', 'Favorites'];

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.getDocuments();
      if (res.documents) {
        setDocuments(res.documents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    if (activeTab === 'Favorites' && !doc.isFavorite) return false;
    if (activeTab !== 'All' && activeTab !== 'Favorites' && doc.category !== activeTab) return false;
    if (searchQuery.trim()) {
      return doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleOpenDoc = (doc) => {
    if (doc.category === 'Generated' || doc.category === 'Drafts') {
      setActiveDraft(doc);
      setActiveView('draft-studio');
    } else {
      setActiveDocument(doc);
      setActiveView('analyzer');
    }
  };

  const handleToggleFavorite = async (doc, e) => {
    e.stopPropagation();
    try {
      const nextFav = !doc.isFavorite;
      await api.getDocuments(); // endpoint patch
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, isFavorite: nextFav } : d));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleStartRename = (doc, e) => {
    e.stopPropagation();
    setEditingDocId(doc.id);
    setEditNameValue(doc.fileName);
  };

  const handleSaveRename = async (id, e) => {
    e.stopPropagation();
    if (!editNameValue.trim()) return;
    try {
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, fileName: editNameValue.trim() } : d));
      setEditingDocId(null);
      addNotification('Document Renamed', `File renamed to ${editNameValue.trim()}`);
    } catch (err) {
      alert(`Failed to rename: ${err.message}`);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this document from your workspace?")) return;
    try {
      await api.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      addNotification('Document Deleted', 'File removed from your workspace.');
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleDownload = async (doc, e) => {
    e.stopPropagation();
    try {
      const blob = await api.exportDocumentReport(doc.id, 'pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      // Fallback text download
      const element = document.createElement("a");
      const file = new Blob([`LegalEase Document: ${doc.fileName}\nStatus: ${doc.status}`], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${doc.fileName}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderLock className="w-6 h-6 text-blue-500" />
            <span>My Documents</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your analyzed legal files, contract drafts, and verified exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('analyzer')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-md shadow-blue-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload New Document</span>
          </button>
        </div>
      </div>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => handleOpenDoc(doc)}
              className="p-5 rounded-xl bg-[#0B101D] border border-slate-800/90 hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    {editingDocId === doc.id ? (
                      <div className="flex items-center gap-1.5 flex-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          className="bg-slate-950 border border-blue-500 rounded px-2 py-0.5 text-xs text-slate-100 w-full"
                          autoFocus
                        />
                        <button
                          onClick={(e) => handleSaveRename(doc.id, e)}
                          className="p-1 hover:text-emerald-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                          {doc.fileName}
                        </h4>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {doc.category || 'Draft'} &bull; {(doc.fileSize / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleToggleFavorite(doc, e)}
                    className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    <Star className={`w-3.5 h-3.5 ${doc.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono">
                    {doc.status || 'Active'}
                  </span>
                  <span>&bull;</span>
                  <span>{new Date(doc.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                <span className="text-[11px] text-blue-400 group-hover:underline flex items-center gap-1">
                  <span>Open workspace</span>
                  <ExternalLink className="w-3 h-3" />
                </span>

                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={(e) => handleStartRename(doc, e)}
                    className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                    title="Rename document"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDownload(doc, e)}
                    className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                    title="Download document"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(doc.id, e)}
                    className="p-1.5 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-[#090D17] border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">No documents found in this section</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload a contract to Document Analyzer or create a first-pass draft in Draft Studio.
          </p>
          <button
            onClick={() => setActiveView('analyzer')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Analyze Document
          </button>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}
