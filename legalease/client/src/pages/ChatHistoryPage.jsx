import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  MessageSquare, 
  Paperclip, 
  Trash2, 
  Edit2, 
  Check, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { useLegal } from '../context/LegalContext';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

export default function ChatHistoryPage() {
  const { setActiveView, addNotification } = useLegal();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getHistory();
      if (res.conversations) {
        setConversations(res.conversations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpen = (conv) => {
    setActiveView('assistant');
  };

  const handleStartRename = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = async (id, e) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    try {
      await api.renameConversation(id, editTitle.trim());
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: editTitle.trim() } : c));
      setEditingId(null);
      addNotification('Session Renamed', 'Conversation title updated.');
    } catch (err) {
      alert(`Rename failed: ${err.message}`);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this consultation record?")) return;
    try {
      await api.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      addNotification('Session Deleted', 'Conversation deleted.');
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-500" />
            <span>Chat History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access past legal inquiries, clause interpretations, and research sessions.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search consultation records..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleOpen(conv)}
              className="p-4 rounded-xl bg-[#0B101D] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3 overflow-hidden flex-1">
                <div className="w-9 h-9 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>

                <div className="overflow-hidden flex-1">
                  {editingId === conv.id ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-slate-950 border border-blue-500 rounded px-2 py-1 text-xs text-slate-100 w-full max-w-md"
                        autoFocus
                      />
                      <button
                        onClick={(e) => handleSaveRename(conv.id, e)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                        {conv.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {conv.lastMessage || 'General legal discussion'}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(conv.createdAt || Date.now()).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    {conv.hasAttachments && (
                      <span className="flex items-center gap-1 text-blue-400">
                        <Paperclip className="w-3 h-3" />
                        <span>Contract attached</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={(e) => handleStartRename(conv, e)}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Rename consultation"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleDelete(conv.id, e)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Delete consultation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all text-xs font-medium ml-2">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center bg-[#090D17] border border-slate-800 rounded-2xl space-y-3">
            <History className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No consultation records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start a new session with the AI Assistant to discuss legal provisions.
            </p>
            <button
              onClick={() => setActiveView('assistant')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Start New Consultation
            </button>
          </div>
        )}
      </div>

      <DisclaimerBanner />
    </div>
  );
}
