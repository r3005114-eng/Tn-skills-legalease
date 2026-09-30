import React, { createContext, useContext, useState, useEffect } from 'react';

const LegalContext = createContext();

export function LegalProvider({ children }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [jurisdiction, setJurisdiction] = useState('India (All Central & State Laws)');
  const [activeDocument, setActiveDocument] = useState(null);
  const [activeDraft, setActiveDraft] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  // Modals
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Global Toast / Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Bharatiya Nyaya Sanhita (BNS)', text: 'New statutory alignment benchmarks active for 2026.', time: '10m ago', unread: true },
    { id: 2, title: 'Document Ready', text: 'Non-Disclosure Agreement draft generated with statutory boilerplate.', time: '1h ago', unread: false }
  ]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const addNotification = (title, text) => {
    const newNotif = {
      id: Date.now(),
      title,
      text,
      time: 'Just now',
      unread: true
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <LegalContext.Provider value={{
      activeView,
      setActiveView,
      jurisdiction,
      setJurisdiction,
      activeDocument,
      setActiveDocument,
      activeDraft,
      setActiveDraft,
      theme,
      toggleTheme,
      mobileNavOpen,
      setMobileNavOpen,
      settingsOpen,
      setSettingsOpen,
      privacyOpen,
      setPrivacyOpen,
      helpOpen,
      setHelpOpen,
      notifications,
      addNotification,
      markAllNotificationsRead
    }}>
      {children}
    </LegalContext.Provider>
  );
}

export const useLegal = () => useContext(LegalContext);
