import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Hammer, CheckCircle, AlertTriangle, FileText, ExternalLink } from 'lucide-react';

const Production = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:5000/api';
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    const fetchProductionOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/orders`, config);
            // Filter logic: show items in production
            const prodOrders = res.data.filter(o => o.status === 'production');
            setOrders(prodOrders);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => { fetchProductionOrders(); }, []);

    const moveToInstall = async (orderId) => {
        if (!window.confirm(t('mark_ready') + '?')) return;
        try {
            // Updates status to 'ready_for_install' so it appears in the Manager's schedule board
            await axios.put(`${API_URL}/orders/${orderId}/status`, { status: 'ready_for_install' }, config);
            fetchProductionOrders();
        } catch (error) { alert('Error updating status'); }
    };

    return (
        <div className="pb-10">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Hammer className="text-amber-500" size={32} /> {t('production_floor')}
            </h2>

            {loading ? (
                <div className="text-white">Loading...</div>
            ) : orders.length === 0 ? (
                <div className="bg-slate-800 p-12 rounded-2xl text-center border border-slate-700 opacity-50">
                    <Hammer className="mx-auto text-slate-500 mb-4" size={64} />
                    <h3 className="text-2xl text-white font-bold">{t('no_production')}</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => {
                        // Find the master plan file
                        const masterPlan = order.files && order.files.find(f => f.type === 'master_plan');

                        return (
                            <div key={order._id} className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative group flex flex-col">

                                {/* Card Header */}
                                <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-mono text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">#{order.orderNumber}</span>
                                            <h3 className="text-xl font-bold text-white mt-2">{order.clientName}</h3>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                            {order.workflow}
                                        </div>
                                    </div>
                                </div>

                                {/* --- MASTER PLAN BUTTON (IF EXISTS) --- */}
                                {masterPlan && (
                                    <div className="px-5 pt-4">
                                        <a
                                            href={masterPlan.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-900/20 transition transform hover:scale-[1.02]"
                                        >
                                            <FileText size={18} /> {t('view_master_plan')} <ExternalLink size={14} />
                                        </a>
                                    </div>
                                )}

                                {/* Items List */}
                                <div className="p-5 space-y-3 flex-1">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{t('material_status')}</p>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                            <div>
                                                <p className="text-sm text-white font-medium">{item.productType}</p>
                                                <p className="text-xs text-slate-400">{item.description}</p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                {item.isOrdered ? (
                                                    <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                                                        <CheckCircle size={12} /> {t('ordered')}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-red-400 text-xs font-bold">
                                                        <AlertTriangle size={12} /> {t('pending')}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-slate-500">{item.supplier}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Footer */}
                                <div className="p-5 border-t border-slate-800 bg-slate-900 mt-auto">
                                    <button
                                        onClick={() => moveToInstall(order._id)}
                                        className="w-full bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white border border-slate-700 hover:border-emerald-500 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={20} />
                                        {t('mark_ready')}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Production;