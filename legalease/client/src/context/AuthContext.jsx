import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('legalease_token') || null);
  const [customApiKey, setCustomApiKey] = useState(localStorage.getItem('legalease_gemini_api_key') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.user) {
            setUser(res.user);
          }
        } catch (err) {
          console.warn('[Auth] Token invalid or expired, clearing session.');
          localStorage.removeItem('legalease_token');
          setToken(null);
          setUser(null);
        }
      } else {
        // Auto-seed demo guest session so user can freely interact immediately
        setUser({
          id: 'usr_demo_counsel_001',
          name: 'Advocate Priya Sharma',
          email: 'advocate.sharma@legalease.in',
          role: 'Senior Counsel',
          organization: 'Apex Legal Chambers, Delhi',
          jurisdiction: 'India (Supreme Court & High Courts)'
        });
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.token) {
      localStorage.setItem('legalease_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.token) {
      localStorage.setItem('legalease_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const demoLogin = async () => {
    const res = await api.demoLogin();
    if (res.token) {
      localStorage.setItem('legalease_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('legalease_token');
    setToken(null);
    setUser(null);
  };

  const saveCustomApiKey = (key) => {
    setCustomApiKey(key);
    if (key) {
      localStorage.setItem('legalease_gemini_api_key', key);
    } else {
      localStorage.removeItem('legalease_gemini_api_key');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      demoLogin,
      logout,
      customApiKey,
      saveCustomApiKey
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
