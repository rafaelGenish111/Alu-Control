import React, { useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Trash2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const DeletedOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('userInfo'));
  const token = user?.token;
  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const fetchDeletedOrders = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/deleted`, config);
      setOrders(res.data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [config]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchDeletedOrders(); }, [fetchDeletedOrders]);

  const restoreOrder = async (orderId) => {
    if (!window.confirm(t('restore_order_confirm') || 'Restore this order?')) return;
    setRestoringId(orderId);
    try {
      await axios.post(`${API_URL}/orders/${orderId}/restore`, {}, config);
      fetchDeletedOrders();
    } catch (e) {
      console.error(e);
      alert(t('error_restoring_order') || 'Error restoring order');
    } finally {
      setRestoringId(null);
    }
  };

  const getDaysRemaining = (deletedAt) => {
    if (!deletedAt) return 0;
    const deleted = new Date(deletedAt);
    const now = new Date();
    const daysSince = Math.floor((now - deleted) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - daysSince);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Trash2 className="text-red-500" /> {t('deleted_orders') || 'Deleted Orders'}
      </h2>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="p-4">{t('order_col')}</th>
              <th className="p-4">{t('client')}</th>
              <th className="p-4">{t('region')}</th>
              <th className="p-4">{t('deleted_date') || 'Deleted Date'}</th>
              <th className="p-4">{t('days_remaining') || 'Days Remaining'}</th>
              <th className="p-4">{t('action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-400">{t('loading')}</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">{t('no_deleted_orders') || 'No deleted orders'}</td></tr>
            ) : (
              orders.map((o) => {
                const displayOrderNumber = o.manualOrderNumber || o.orderNumber || o._id;
                const daysRemaining = getDaysRemaining(o.deletedAt);
                return (
                  <tr
                    key={o._id}
                    className="hover:bg-slate-800/30 transition"
                  >
                    <td className="p-4 font-mono text-red-300">#{displayOrderNumber}</td>
                    <td className="p-4 font-semibold text-white">{o.clientName}</td>
                    <td className="p-4">{o.region || '—'}</td>
                    <td className="p-4 text-slate-500">{o.deletedAt ? new Date(o.deletedAt).toLocaleDateString() : '—'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${daysRemaining > 3 ? 'bg-emerald-500/20 text-emerald-300' : daysRemaining > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>
                        {daysRemaining} {t('days') || 'days'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => restoreOrder(o._id)}
                        disabled={restoringId === o._id}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                      >
                        <RotateCcw size={14} /> {restoringId === o._id ? t('restoring') || 'Restoring...' : t('restore') || 'Restore'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeletedOrders;

