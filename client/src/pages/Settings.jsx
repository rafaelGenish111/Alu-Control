import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Globe, Moon, Sun, Monitor, Info, User, Building2, Mail, Phone, Shield } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { darkMode, changeDarkMode } = useDarkMode();
  const [currentLang, setCurrentLang] = useState('he');

  // טעינת הגדרות מ-localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'he';
    setCurrentLang(savedLang);
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  const user = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isRTL = currentLang === 'he';

  // שינוי שפה
  const changeLanguage = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('lang', lang);
    i18n.changeLanguage(lang);
  };

  return (
    <div className={`min-h-screen dark:bg-slate-950 bg-white p-4 md:p-8 ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2 flex items-center gap-3">
            <SettingsIcon size={32} className="text-primary" />
            {t('settings') || 'הגדרות'}
          </h1>
          <p className="dark:text-slate-400 text-gray-600">
            {t('settings_description') || 'נהל את ההגדרות וההעדפות שלך'}
          </p>
        </div>

        {/* App Info Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border dark:border-slate-800 border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Info size={24} className="text-primary" />
            <h2 className="text-xl font-bold dark:text-white text-gray-900">
              {t('app_info') || 'פרטי האפליקציה'}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 size={20} className="dark:text-slate-400 text-gray-600" />
              <div>
                <p className="text-sm dark:text-slate-400 text-gray-600">{t('app_name') || 'שם האפליקציה'}</p>
                <p className="font-semibold dark:text-white text-gray-900">Glass Dynamics</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield size={20} className="dark:text-slate-400 text-gray-600" />
              <div>
                <p className="text-sm dark:text-slate-400 text-gray-600">{t('version') || 'גרסה'}</p>
                <p className="font-semibold dark:text-white text-gray-900">1.0.0</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User size={20} className="dark:text-slate-400 text-gray-600" />
              <div>
                <p className="text-sm dark:text-slate-400 text-gray-600">{t('logged_in_as') || 'מחובר כ'}</p>
                <p className="font-semibold dark:text-white text-gray-900">{user?.name || 'Unknown'}</p>
                <p className="text-xs dark:text-slate-400 text-gray-600">{user?.email || ''}</p>
              </div>
            </div>

            {user?.tenantId && (
              <div className="flex items-center gap-3">
                <Building2 size={20} className="dark:text-slate-400 text-gray-600" />
                <div>
                  <p className="text-sm dark:text-slate-400 text-gray-600">{t('tenant') || 'דייר'}</p>
                  <p className="font-semibold dark:text-white text-gray-900">{user.tenantId}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border dark:border-slate-800 border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe size={24} className="text-primary" />
            <h2 className="text-xl font-bold dark:text-white text-gray-900">
              {t('language_settings') || 'הגדרות שפה'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => changeLanguage('he')}
              className={`px-6 py-4 rounded-xl border-2 transition-all ${currentLang === 'he'
                ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary font-bold'
                : 'border-slate-300 dark:border-slate-700 dark:bg-slate-800 bg-white dark:text-white text-gray-900 hover:border-primary/50'
                }`}
            >
              <div className="text-lg font-semibold mb-1">עברית</div>
              <div className="text-xs dark:text-slate-400 text-gray-600">Hebrew</div>
            </button>

            <button
              onClick={() => changeLanguage('en')}
              className={`px-6 py-4 rounded-xl border-2 transition-all ${currentLang === 'en'
                ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary font-bold'
                : 'border-slate-300 dark:border-slate-700 dark:bg-slate-800 bg-white dark:text-white text-gray-900 hover:border-primary/50'
                }`}
            >
              <div className="text-lg font-semibold mb-1">English</div>
              <div className="text-xs dark:text-slate-400 text-gray-600">אנגלית</div>
            </button>

            <button
              onClick={() => changeLanguage('es')}
              className={`px-6 py-4 rounded-xl border-2 transition-all ${currentLang === 'es'
                ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary font-bold'
                : 'border-slate-300 dark:border-slate-700 dark:bg-slate-800 bg-white dark:text-white text-gray-900 hover:border-primary/50'
                }`}
            >
              <div className="text-lg font-semibold mb-1">Español</div>
              <div className="text-xs dark:text-slate-400 text-gray-600">ספרדית</div>
            </button>
          </div>
        </div>

        {/* Dark Mode Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border dark:border-slate-800 border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Moon size={24} className="text-primary" />
            <h2 className="text-xl font-bold dark:text-white text-gray-900">
              {t('display_mode') || 'מצב תצוגה'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => {
                console.log('🔆 Light mode button clicked');
                changeDarkMode('light');
              }}
              className={`px-6 py-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${darkMode === 'light'
                ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary font-bold'
                : 'border-slate-300 dark:border-slate-700 dark:bg-slate-800 bg-white dark:text-white text-gray-900 hover:border-primary/50'
                }`}
            >
              <Sun size={20} />
              <div>
                <div className="text-lg font-semibold">{t('light_mode') || 'יום'}</div>
                <div className="text-xs dark:text-slate-400 text-gray-600">{t('light_mode_desc') || 'מצב בהיר'}</div>
              </div>
            </button>

            <button
              onClick={() => changeDarkMode('dark')}
              className={`px-6 py-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${darkMode === 'dark'
                ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary font-bold'
                : 'border-slate-300 dark:border-slate-700 dark:bg-slate-800 bg-white dark:text-white text-gray-900 hover:border-primary/50'
                }`}
            >
              <Moon size={20} />
              <div>
                <div className="text-lg font-semibold">{t('dark_mode') || 'לילה'}</div>
                <div className="text-xs dark:text-slate-400 text-gray-600">{t('dark_mode_desc') || 'מצב כהה'}</div>
              </div>
            </button>

            <button
              onClick={() => changeDarkMode('auto')}
              className={`px-6 py-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${darkMode === 'auto'
                ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary font-bold'
                : 'border-slate-300 dark:border-slate-700 dark:bg-slate-800 bg-white dark:text-white text-gray-900 hover:border-primary/50'
                }`}
            >
              <Monitor size={20} />
              <div>
                <div className="text-lg font-semibold">{t('auto_mode') || 'אוטומטי'}</div>
                <div className="text-xs dark:text-slate-400 text-gray-600">{t('auto_mode_desc') || 'לפי שעה'}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Additional Settings Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border dark:border-slate-800 border-gray-200 p-6">
          <h2 className="text-xl font-bold dark:text-white text-gray-900 mb-6">
            {t('additional_settings') || 'הגדרות נוספות'}
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl dark:bg-slate-800 bg-white">
              <div>
                <p className="font-semibold dark:text-white text-gray-900">
                  {t('notifications') || 'התראות'}
                </p>
                <p className="text-sm dark:text-slate-400 text-gray-600">
                  {t('notifications_desc') || 'קבל התראות על עדכונים חשובים'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl dark:bg-slate-800 bg-white">
              <div>
                <p className="font-semibold dark:text-white text-gray-900">
                  {t('email_notifications') || 'התראות אימייל'}
                </p>
                <p className="text-sm dark:text-slate-400 text-gray-600">
                  {t('email_notifications_desc') || 'קבל עדכונים במייל'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
