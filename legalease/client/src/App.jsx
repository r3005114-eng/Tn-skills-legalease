import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { LegalProvider, useLegal } from './context/LegalContext';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import MobileNav from './components/layout/MobileNav';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AssistantPage from './pages/AssistantPage';
import AnalyzerPage from './pages/AnalyzerPage';
import DraftStudioPage from './pages/DraftStudioPage';
import MyDocumentsPage from './pages/MyDocumentsPage';
import ChatHistoryPage from './pages/ChatHistoryPage';
import LegalLibraryPage from './pages/LegalLibraryPage';

// Modals
import SettingsModal from './pages/SettingsModal';
import PrivacySecurityModal from './pages/PrivacySecurityModal';
import HelpModal from './pages/HelpModal';

function AppContent() {
  const { activeView } = useLegal();

  // If on landing page view, render full-bleed landing page
  if (activeView === 'landing') {
    return (
      <>
        <LandingPage />
        <SettingsModal />
        <PrivacySecurityModal />
        <HelpModal />
      </>
    );
  }

  // Render workspace layout with persistent sidebar and topbar
  const renderCurrentPage = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardPage />;
      case 'assistant':
        return <AssistantPage />;
      case 'analyzer':
        return <AnalyzerPage />;
      case 'draft-studio':
        return <DraftStudioPage />;
      case 'documents':
        return <MyDocumentsPage />;
      case 'history':
        return <ChatHistoryPage />;
      case 'library':
        return <LegalLibraryPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080C14] text-slate-100">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Responsive Mobile Drawer */}
      <MobileNav />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <Topbar />

        {/* Dynamic Workspace Page */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-[#080C14]">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Global Modals */}
      <SettingsModal />
      <PrivacySecurityModal />
      <HelpModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LegalProvider>
        <AppContent />
      </LegalProvider>
    </AuthProvider>
  );
}
