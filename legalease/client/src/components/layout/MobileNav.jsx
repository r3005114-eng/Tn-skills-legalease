import React from 'react';
import { 
  X, 
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
  LogOut
} from 'lucide-react';
import { useLegal } from '../../context/LegalContext';
import { useAuth } from '../../context/AuthContext';

export default function MobileNav() {
  const { 
    mobileNavOpen, 
    setMobileNavOpen, 
    activeView, 
    setActiveView,
    setSettingsOpen,
    setPrivacyOpen,
    setHelpOpen
  } = useLegal();

  const { user, logout } = useAuth();

  if (!mobileNavOpen) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
    { id: 'analyzer', label: 'Document Analyzer', icon: FileSearch },
    { id: 'draft-studio', label: 'Draft Studio', icon: PenTool },
    { id: 'documents', label: 'My Documents', icon: FolderLock },
    { id: 'history', label: 'Chat History', icon: History },
    { id: 'library', label: 'Legal Library', icon: BookOpen },
  ];

  const handleNavClick = (id) => {
    setActiveView(id);
    setMobileNavOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setMobileNavOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-[#090D16] border-r border-slate-800 h-full flex flex-col z-10 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-white">LegalEase</span>
          </div>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-800/80 my-2 space-y-1">
            <button
              onClick={() => { setSettingsOpen(true); setMobileNavOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800/60"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => { setPrivacyOpen(true); setMobileNavOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800/60"
            >
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Privacy & Security</span>
            </button>
            <button
              onClick={() => { setHelpOpen(true); setMobileNavOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800/60"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Help & Guidelines</span>
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs">
            <div className="font-medium text-slate-200">{user?.name || 'Advocate'}</div>
            <div className="text-[10px] text-slate-500">{user?.email || 'counsel@legalease.in'}</div>
          </div>
          <button
            onClick={() => { logout(); setMobileNavOpen(false); }}
            className="p-2 text-slate-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
