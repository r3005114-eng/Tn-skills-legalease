import React, { useState } from 'react';
import { 
  Search, 
  Globe, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  User, 
  Check, 
  ChevronDown,
  Sparkles,
  Shield
} from 'lucide-react';
import { useLegal } from '../../context/LegalContext';
import { useAuth } from '../../context/AuthContext';

export default function Topbar() {
  const { 
    jurisdiction, 
    setJurisdiction, 
    theme, 
    toggleTheme, 
    setMobileNavOpen,
    notifications,
    markAllNotificationsRead,
    setActiveView,
    setSettingsOpen
  } = useLegal();

  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showJurisdictionSelect, setShowJurisdictionSelect] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const jurisdictions = [
    'India (All Central & State Laws)',
    'Delhi Jurisdiction (Supreme Court & High Court)',
    'Bombay Jurisdiction (Maharashtra)',
    'Karnataka Jurisdiction (Bengaluru)',
    'Madras Jurisdiction (Tamil Nadu)'
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveView('library');
    }
  };

  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 select-none">
      {/* Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search statutes, case law principles, or clauses (e.g., Section 27, Stamp Act)..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all font-sans"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Current Workspace / Jurisdiction Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowJurisdictionSelect(!showJurisdictionSelect)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="max-w-[150px] lg:max-w-[210px] truncate">{jurisdiction}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showJurisdictionSelect && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0D131F] border border-slate-800 rounded-xl shadow-2xl p-1.5 z-40">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Active Jurisdiction
              </div>
              {jurisdictions.map((j) => (
                <button
                  key={j}
                  onClick={() => {
                    setJurisdiction(j);
                    setShowJurisdictionSelect(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    jurisdiction === j ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="truncate">{j}</span>
                  {jurisdiction === j && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0D131F] border border-slate-800 rounded-xl shadow-2xl p-3 z-40">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-200">Legal Intelligence Updates</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs">
                    <div className="flex items-center justify-between text-slate-200 font-medium">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1 leading-snug">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Profile Avatar / Quick Menu */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-xs text-slate-200"
        >
          <div className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-[11px] font-bold text-blue-400">
            {user?.name ? user.name.charAt(0) : 'P'}
          </div>
          <span className="hidden sm:inline font-medium">{user?.name ? user.name.split(' ')[0] : 'Advocate'}</span>
        </button>
      </div>
    </header>
  );
}
