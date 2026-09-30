import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  CheckCircle, 
  Calendar, 
  Building, 
  Scale, 
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

export default function LegalLibraryPage() {
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedArticleId, setExpandedArticleId] = useState(null);

  useEffect(() => {
    loadLibrary();
  }, [selectedCategory]);

  const loadLibrary = async () => {
    try {
      setLoading(true);
      const res = await api.getLibraryArticles({
        category: selectedCategory !== 'All' ? selectedCategory : '',
        search: searchQuery
      });
      if (res.articles) {
        setArticles(res.articles);
        if (res.categories) setCategories(res.categories);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLibrary();
  };

  const toggleExpand = (id) => {
    setExpandedArticleId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-amber-500" />
            <span>Legal Knowledge Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authoritative, uninvented Indian statutory analyses & core legal doctrines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Zero Fabricated Citations</span>
          </span>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search statutes or sections..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </form>
      </div>

      {/* Articles Grid */}
      <div className="space-y-4">
        {articles.length > 0 ? (
          articles.map((item) => {
            const isExpanded = expandedArticleId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-xl bg-[#0B101D] border border-slate-800 hover:border-slate-700/80 transition-all overflow-hidden"
              >
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-start justify-between gap-4 select-none"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {item.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {item.statute}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-100 hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.shortExplanation}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>Source: <strong className="text-slate-300">{item.source}</strong></span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Last Updated: <strong className="text-slate-300">{item.lastUpdated}</strong></span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {item.sourceUrl && (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="View Official Government Statute Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Full Statutory Analysis */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-800/80 bg-slate-950/60 space-y-4 text-xs text-slate-300">
                    <div>
                      <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-2">
                        Statutory Analysis & Judicial Principles
                      </div>
                      <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-line leading-relaxed font-sans bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                        {item.fullContent}
                      </div>
                    </div>

                    {item.relevantSections && item.relevantSections.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">Relevant Sections:</span>
                        {item.relevantSections.map((sec, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono text-[11px]">
                            {sec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center bg-[#090D17] border border-slate-800 rounded-2xl space-y-2">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No matching articles found</h3>
            <p className="text-xs text-slate-500">Try adjusting your category filter or search keywords.</p>
          </div>
        )}
      </div>

      <DisclaimerBanner />
    </div>
  );
}
