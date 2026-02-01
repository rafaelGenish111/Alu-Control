import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { X, Save } from 'lucide-react';
import { API_URL } from '../config/api';

const NoteModal = ({ orderId, stage = 'general', onClose, onSaved }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const user = JSON.parse(localStorage.getItem('userInfo'));
  const token = user?.token;
  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const save = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await axios.post(`${API_URL}/orders/${orderId}/notes`, { stage, text }, config);
      setText('');
      onSaved?.();
      onClose?.();
    } catch (e) {
      console.error(e);
      alert(t('error_saving_note'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="dark:bg-slate-900 bg-white w-full max-w-lg rounded-2xl border dark:border-slate-700 border-gray-200 shadow-2xl">
        <div className="p-5 border-b dark:border-slate-800 border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold dark:text-white text-gray-900">{t('add_note')}</h3>
            <p className="text-xs dark:text-slate-400 text-gray-600 mt-1">{t('stage')}: {stage}</p>
          </div>
          <button type="button" onClick={onClose} className="dark:text-slate-400 text-gray-600 hover:dark:text-white hover:text-gray-900">
            <X />
          </button>
        </div>

        <div className="p-5">
          <textarea
            className="w-full dark:bg-slate-800 bg-gray-50 border dark:border-slate-600 border-gray-300 rounded-lg p-3 dark:text-white text-gray-900 text-sm"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('write_note_placeholder')}
          />
        </div>

        <div className="p-5 border-t dark:border-slate-800 border-gray-200 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 dark:text-slate-400 text-gray-600 hover:dark:text-white hover:text-gray-900">
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || !text.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold inline-flex items-center gap-2"
          >
            <Save size={18} /> {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;




