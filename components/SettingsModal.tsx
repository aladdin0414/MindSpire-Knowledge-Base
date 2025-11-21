import React from 'react';
import { Modal } from './Modal';
import { Language, Theme } from '../types';
import { Moon, Sun, Monitor, Globe, Type, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  autoSave: boolean;
  setAutoSave: (enabled: boolean) => void;
  translations: any;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  setLanguage,
  theme,
  setTheme,
  autoSave,
  setAutoSave,
  translations: t
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.settings}>
      <div className="space-y-6">
        
        {/* Language Section */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <Globe size={16} className="mr-2 text-slate-500" />
            {t.language}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                language === 'en' 
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('zh')}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                language === 'zh' 
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              中文 (简体)
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-100"></div>

        {/* Appearance Section */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <Sun size={16} className="mr-2 text-slate-500" />
            {t.appearance}
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                theme === 'light'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sun size={20} className="mb-1" />
              <span className="text-xs">{t.light}</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                theme === 'dark'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Moon size={20} className="mb-1" />
              <span className="text-xs">{t.dark}</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                theme === 'system'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Monitor size={20} className="mb-1" />
              <span className="text-xs">{t.system}</span>
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-100"></div>

        {/* Editor Section */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <Type size={16} className="mr-2 text-slate-500" />
            {t.editor}
          </h4>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center">
              <Save size={18} className="text-slate-500 mr-3" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">{t.autoSave}</span>
                <span className="text-xs text-slate-500">{t.autoSaveDesc}</span>
              </div>
            </div>
            <button 
              onClick={() => setAutoSave(!autoSave)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoSave ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoSave ? 'translate-x-6' : 'translate-x-1'}`} 
              />
            </button>
          </div>
        </div>

        <div className="pt-4 text-center">
          <p className="text-xs text-slate-400">MindSpire v1.0.0</p>
        </div>

      </div>
    </Modal>
  );
};