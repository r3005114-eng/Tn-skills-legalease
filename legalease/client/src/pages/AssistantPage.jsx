import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Copy, 
  Check, 
  RotateCw, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  Scale, 
  AlertCircle, 
  BookOpen, 
  Plus, 
  Search, 
  FileText, 
  ChevronRight, 
  X,
  Sparkles,
  Layers,
  HelpCircle,
  FileCheck2,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';
import { useLegal } from '../context/LegalContext';
import CitationBox from '../components/legal/CitationBox';
import SkeletonLoader from '../components/common/SkeletonLoader';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

export default function AssistantPage() {
  const { jurisdiction, activeDocument, setActiveDocument, addNotification } = useLegal();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const quickPrompts = [
    { label: "Rental Agreement Check", query: "Help me understand my rental agreement and statutory notice requirements in India." },
    { label: "Pre-Contract Checklist", query: "What should I check before signing a commercial or employment contract?" },
    { label: "Simple Tamil Explanation", query: "Explain Section 27 non-compete rules and contract essentials in simple Tamil." },
    { label: "Create Legal Notice", query: "Create a first-pass legal notice for non-payment of professional dues under Indian law." },
    { label: "Explain Legal Term", query: "Explain 'Liquidated Damages' vs 'Penalty' under Section 74 of the Indian Contract Act." }
  ];

  // Load conversation history on mount
  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await api.getHistory();
        if (res.conversations && res.conversations.length > 0) {
          setConversations(res.conversations);
          // Load first conversation
          loadConversation(res.conversations[0].id);
        } else {
          startNewConversation();
        }
      } catch (err) {
        startNewConversation();
      }
    }
    loadConversations();
  }, []);

  const loadConversation = async (id) => {
    try {
      setActiveConversationId(id);
      const res = await api.getConversationById(id);
      if (res.conversation) {
        setMessages(res.conversation.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([
      {
        sender: 'assistant',
        content: 'Welcome to LegalEase AI Legal Assistant. You can ask complex legal questions, analyze terms, or request first-pass legal drafts under Indian law.',
        structuredResponse: {
          answer: 'Welcome to LegalEase. I am an AI legal information assistant designed to provide clear, neutral information grounded in Indian statutes and judicial principles.',
          keyPoints: [
            'All responses distinguish general legal information from user facts.',
            'Citations refer to authentic Indian statutes (Contract Act, IT Act, Consumer Protection, DPDP).',
            'No fabricated case laws or hallucinated statutory provisions.'
          ],
          relevantContext: 'Operating in: ' + jurisdiction,
          considerations: [
            'For litigation or high-stakes filings, consultation with an advocate is strongly recommended.'
          ],
          nextSteps: [
            'Select a quick prompt below or type your legal question.',
            'Attach a contract (PDF/DOCX) if you want specific clause interpretation.'
          ],
          sources: [
            {
              title: "Indian Contract Act, 1872",
              authority: "Parliament of India",
              relevantSection: "Section 10",
              link: "https://www.indiacode.nic.in/handle/123456789/2187"
            }
          ],
          verificationNote: "Information is curated for Indian legal jurisdictions."
        }
      }
    ]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputValue;
    if (!text.trim() && !attachment) return;

    const userMessage = {
      sender: 'user',
      content: text,
      attachments: attachment ? [attachment] : [],
      createdAt: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    const currentAttachment = attachment;
    setAttachment(null);
    setLoading(true);

    try {
      const res = await api.sendChatMessage({
        message: text,
        conversationId: activeConversationId,
        documentContext: activeDocument ? activeDocument.rawText : '',
        jurisdiction,
        attachments: currentAttachment ? [currentAttachment] : []
      });

      if (res.success) {
        if (!activeConversationId && res.conversationId) {
          setActiveConversationId(res.conversationId);
          // Refresh conversation list
          const hist = await api.getHistory();
          if (hist.conversations) setConversations(hist.conversations);
        }
        setMessages(prev => [...prev, res.message]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          content: 'Unable to process query at this moment. ' + (err.message || 'Please check connection.'),
          structuredResponse: {
            answer: 'A temporary service interruption occurred while processing your legal query.',
            keyPoints: ['Please retry with a simplified query or verify your network connection.'],
            relevantContext: 'Gemini service resilience protocol active.',
            considerations: ['Ensure confidential files are within supported 15MB limits.'],
            nextSteps: ['Click regenerate below to retry.'],
            sources: []
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadRes = await api.uploadDocument(file);
      if (uploadRes.success) {
        setAttachment({
          fileName: uploadRes.document.fileName,
          fileType: uploadRes.document.fileType,
          fileSize: uploadRes.document.fileSize,
          id: uploadRes.document.id
        });
        addNotification('File Attached', `${uploadRes.document.fileName} is ready for context analysis.`);
      }
    } catch (err) {
      alert(`File upload failed: ${err.message}`);
    }
  };

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFeedback = async (messageIndex, type) => {
    try {
      if (activeConversationId) {
        await api.sendChatFeedback({
          conversationId: activeConversationId,
          messageIndex,
          feedback: type
        });
        addNotification('Feedback Recorded', 'Thank you for helping refine legal precision.');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleExportChat = (msg) => {
    const blob = new Blob([msg.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LegalEase_Response_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-[#070A12] -m-4 md:-m-6">
      {/* LEFT: Conversation History Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-[#090D17] border-r border-slate-800/80 shrink-0">
        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Consultations
          </span>
          <button
            onClick={startNewConversation}
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              className={`p-2.5 rounded-lg text-xs cursor-pointer transition-all flex items-start justify-between group ${
                activeConversationId === conv.id
                  ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="overflow-hidden pr-2">
                <div className="font-medium truncate text-slate-200">{conv.title}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{conv.lastMessage || 'Active consultation'}</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0 mt-0.5" />
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500">
              No previous consultations. Start a new query.
            </div>
          )}
        </div>
      </div>

      {/* CENTER: Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full bg-[#080C14] overflow-hidden relative">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            const structured = msg.structuredResponse;

            return (
              <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-4xl mx-auto w-full`}>
                {isUser ? (
                  /* User Message Bubble */
                  <div className="max-w-2xl bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-xs sm:text-sm shadow-md">
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-blue-500/50 flex items-center gap-2 text-xs text-blue-100">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Attached: {msg.attachments[0].fileName}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* AI Structured Response Card */
                  <div className="w-full bg-[#0B101D] border border-slate-800/90 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
                    {/* Header badge */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <Scale className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-200">LegalEase Structured Intelligence</span>
                        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">&bull; Indian Jurisdiction</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <button
                          onClick={() => handleCopy(msg.content, idx)}
                          className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                          title="Copy response"
                        >
                          {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleExportChat(msg)}
                          className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                          title="Export Markdown"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(idx, 'up')}
                          className="p-1.5 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                          title="Helpful & Accurate"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(idx, 'down')}
                          className="p-1.5 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                          title="Flag for Review"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Section 1: Executive Answer */}
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Legal Information Summary
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                        {structured?.answer || msg.content}
                      </p>
                    </div>

                    {/* Section 2: Key Points */}
                    {structured?.keyPoints && structured.keyPoints.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-400" />
                          <span>Key Statutory & Contractual Points</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {structured.keyPoints.map((point, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2">
                              <span className="text-blue-400 font-bold shrink-0">&bull;</span>
                              <span className="leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Section 3: Relevant Context & Considerations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {structured?.relevantContext && (
                        <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs">
                          <span className="font-semibold text-slate-300 block mb-1 text-[11px] uppercase tracking-wider">
                            Legal Context
                          </span>
                          <p className="text-slate-400 leading-relaxed">
                            {structured.relevantContext}
                          </p>
                        </div>
                      )}

                      {structured?.considerations && structured.considerations.length > 0 && (
                        <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs">
                          <span className="font-semibold text-amber-400/90 block mb-1 text-[11px] uppercase tracking-wider">
                            Important Considerations
                          </span>
                          <ul className="space-y-1 text-slate-400">
                            {structured.considerations.map((c, cIdx) => (
                              <li key={cIdx} className="flex items-start gap-1.5">
                                <span className="text-amber-400 shrink-0">&bull;</span>
                                <span className="leading-snug">{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Section 4: Next Steps */}
                    {structured?.nextSteps && structured.nextSteps.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1.5">
                          Suggested Practical Next Steps
                        </span>
                        <div className="space-y-1 text-xs text-slate-300">
                          {structured.nextSteps.map((step, sIdx) => (
                            <div key={sIdx} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] flex items-center justify-center font-mono shrink-0 mt-0.5">
                                {sIdx + 1}
                              </span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 5: Verified Citations Box */}
                    <CitationBox 
                      sources={structured?.sources || []} 
                      verificationNote={structured?.verificationNote} 
                    />

                    {/* Mandatory Disclaimer footer */}
                    <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 italic">
                      LegalEase provides general legal information and drafting assistance. It is not a substitute for advice from a qualified legal professional.
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="max-w-4xl mx-auto w-full">
              <SkeletonLoader text="Analyzing legal statutes and preparing structured response..." lines={4} />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 border-t border-slate-800/60 bg-[#090D16] overflow-x-auto flex items-center gap-2 custom-scrollbar">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            Quick Prompts:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-[#090D17]">
          {attachment && (
            <div className="mb-2 flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 max-w-md">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">{attachment.fileName}</span>
                <span className="text-[10px] text-slate-500">({(attachment.fileSize / 1024).toFixed(1)} KB)</span>
              </div>
              <button 
                onClick={() => setAttachment(null)}
                className="p-1 hover:text-red-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-slate-700 transition-colors shrink-0"
              title="Attach legal document (PDF, DOCX, TXT)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => alert("Voice transcription interface placeholder ready. Browser audio capture can be connected.")}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-slate-700 transition-colors shrink-0"
              title="Voice legal query"
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a legal question or describe your situation..."
              className="flex-1 bg-slate-900/90 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 font-sans"
            />

            <button
              type="submit"
              disabled={loading || (!inputValue.trim() && !attachment)}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium transition-all shadow-md shadow-blue-500/20 shrink-0"
              title="Send legal query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-2 text-center text-[10px] text-slate-500">
            LegalEase provides general legal information and drafting assistance. It is not a substitute for advice from a qualified legal professional.
          </div>
        </div>
      </div>

      {/* RIGHT: Context Panel */}
      {rightPanelOpen ? (
        <div className="hidden xl:flex flex-col w-72 bg-[#090D17] border-l border-slate-800/80 p-4 space-y-4 shrink-0 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Legal Context Panel
            </span>
            <button
              onClick={() => setRightPanelOpen(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Jurisdiction */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Active Jurisdiction
            </div>
            <div className="text-xs font-medium text-blue-400">
              {jurisdiction}
            </div>
            <div className="text-[10px] text-slate-500">
              Central Acts + High Court Precedents
            </div>
          </div>

          {/* Active Document Context */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Document in Context</span>
              {activeDocument && (
                <button 
                  onClick={() => setActiveDocument(null)} 
                  className="text-slate-500 hover:text-red-400 text-[10px]"
                >
                  Detach
                </button>
              )}
            </div>
            {activeDocument ? (
              <div>
                <div className="text-xs font-medium text-slate-200 truncate">{activeDocument.fileName}</div>
                <div className="text-[10px] text-slate-400">{activeDocument.pageCount} page(s) loaded into AI prompt</div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500">
                No active document attached. Upload or analyze a document to reference specific clauses.
              </div>
            )}
          </div>

          {/* Quick Statutory References */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Statutory Fast-Track
            </div>
            <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800 text-[11px] space-y-1">
              <span className="text-slate-300 font-medium block">Section 27, Contract Act</span>
              <span className="text-slate-400 block text-[10px]">Restraint of trade void; post-employment non-compete general unenforceability.</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800 text-[11px] space-y-1">
              <span className="text-slate-300 font-medium block">Section 106, Transfer of Property</span>
              <span className="text-slate-400 block text-[10px]">15-day statutory tenancy termination notice period defaults.</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800 text-[11px] space-y-1">
              <span className="text-slate-300 font-medium block">Section 10A, IT Act 2000</span>
              <span className="text-slate-400 block text-[10px]">Statutory validity of contracts formed via electronic means.</span>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setRightPanelOpen(true)}
          className="hidden xl:flex fixed right-2 top-20 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          title="Open Legal Context"
        >
          <BookOpen className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
