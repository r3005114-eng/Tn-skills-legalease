import React from 'react';
import { 
  Scale, 
  LayoutDashboard, 
  MessageSquare, 
  FileSearch, 
  PenTool, 
  FolderLock, 
  History, 
  BookOpen, 
  Settings, 
  ShieldCheck, 
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useLegal } from '../../context/LegalContext';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { 
    activeView, 
    setActiveView, 
    setSettingsOpen, 
    setPrivacyOpen, 
    setHelpOpen 
  } = useLegal();

  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Assistant', icon: MessageSquare, badge: 'Active' },
    { id: 'analyzer', label: 'Document Analyzer', icon: FileSearch },
    { id: 'draft-studio', label: 'Draft Studio', icon: PenTool },
    { id: 'documents', label: 'My Documents', icon: FolderLock },
    { id: 'history', label: 'Chat History', icon: History },
    { id: 'library', label: 'Legal Library', icon: BookOpen },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#090D16] border-r border-slate-800/80 h-screen select-none shrink-0 z-30">
      {/* Brand Header */}
      <div 
        onClick={() => setActiveView('dashboard')}
        className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/80 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/10 border border-blue-400/20 group-hover:scale-105 transition-transform">
          <Scale className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-white font-sans">LegalEase</span>
            <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.2 rounded font-semibold">IN</span>
          </div>
          <span className="text-[11px] text-slate-400 block tracking-wide">Legal Intelligence SaaS</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Legal Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          System & Settings
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all border border-transparent"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>
      </div>

      {/* Bottom Profile & Trust Section */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 space-y-2">
        <div className="flex items-center justify-between px-2 text-xs">
          <button 
            onClick={() => setPrivacyOpen(true)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">Privacy & Trust</span>
          </button>
          <button 
            onClick={() => setHelpOpen(true)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">Help</span>
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
              {user?.name ? user.name.charAt(0) : 'P'}
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-slate-200 truncate">{user?.name || 'Advocate Priya Sharma'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.role || 'Senior Counsel'}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
