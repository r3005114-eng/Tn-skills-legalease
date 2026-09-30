import React, { useState } from 'react';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useLegal } from '../context/LegalContext';
import { Key, Shield, User, Check, Building, Globe } from 'lucide-react';

export default function SettingsModal() {
  const { settingsOpen, setSettingsOpen, jurisdiction, setJurisdiction, addNotification } = useLegal();
  const { user, customApiKey, saveCustomApiKey } = useAuth();

  const [apiKeyInput, setApiKeyInput] = useState(customApiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    saveCustomApiKey(apiKeyInput.trim());
    setSavedSuccess(true);
    addNotification('Settings Updated', 'API credentials and workspace configurations updated.');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <Modal
      isOpen={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      title="Workspace Settings & API Configuration"
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* User Info Section */}
        <div className="space-y-3 pb-5 border-b border-slate-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>Practitioner & Chamber Profile</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Name</label>
              <input
                type="text"
                disabled
                value={user?.name || 'Advocate Priya Sharma'}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 opacity-80 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Designation</label>
              <input
                type="text"
                disabled
                value={user?.role || 'Senior Counsel'}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 opacity-80 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Organization / Chamber</label>
              <input
                type="text"
                disabled
                value={user?.organization || 'Apex Legal Chambers, Delhi'}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 opacity-80 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Primary Jurisdiction</label>
              <input
                type="text"
                disabled
                value={jurisdiction}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 opacity-80 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Gemini API Key Configuration */}
        <div className="space-y-3 pb-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-blue-400" />
              <span>Google Gemini AI Configuration</span>
            </h4>
            <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
              gemini-3.8-flash
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            By default, LegalEase utilizes the server-side configured Gemini 3.8 Flash model. If you wish to provide your own API key, enter it below. Your key is stored strictly in your browser and transmitted via HTTPS headers only to your own backend.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Custom Gemini API Key (Optional)
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy... (Leave empty to use server default)"
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 font-mono"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Leave blank to run on system fallback or server-configured environment keys.
            </span>
          </div>
        </div>

        {/* Save button and status */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            {savedSuccess && (
              <>
                <Check className="w-4 h-4" />
                <span>Configurations updated successfully!</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
