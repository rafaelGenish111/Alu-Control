import React, { useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Hammer, CheckCircle, FileText, ExternalLink, Play } from 'lucide-react';
import { API_URL } from '../config/api';
import NoteModal from '../components/NoteModal';

const Production = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noteOrderId, setNoteOrderId] = useState(null);
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const token = user?.token;
    const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

    const fetchProductionOrders = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/orders`, config);
            const statusesForProduction = new Set(['materials_pending', 'production_pending', 'production', 'in_production']);
            const prodOrders = res.data.filter((o) => statusesForProduction.has(o.status));
            setOrders(prodOrders);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }, [config]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchProductionOrders(); }, [fetchProductionOrders]);

    const startProduction = async (orderId) => {
        if (!window.confirm('Start production for this order?')) return;
        try {
            await axios.put(`${API_URL}/orders/${orderId}/status`, { status: 'in_production' }, config);
            fetchProductionOrders();
        } catch (e) {
            console.error(e);
            alert('Error updating status');
        }
    };

    const finishProduction = async (orderId) => {
        if (!window.confirm('Finish production and send to scheduling?')) return;
        try {
            await axios.put(`${API_URL}/orders/${orderId}/status`, { status: 'ready_for_install' }, config);
            fetchProductionOrders();
        } catch (e) {
            console.error(e);
            alert('Error updating status');
        }
    };

    const computeStatus = (order, materialTypes) => {
        const materials = Array.isArray(order.materials) ? order.materials : [];
        const relevant = materials.filter((m) => materialTypes.includes(m.materialType));
        if (relevant.length === 0) return 'Not relevant';
        const allArrived = relevant.every((m) => m.isArrived);
        return allArrived ? 'Waiting for installation' : 'Waiting for materials';
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
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="p-4">Order #</th>
                                <th className="p-4">Client</th>
                                <th className="p-4">Glass</th>
                                <th className="p-4">Paint</th>
                                <th className="p-4">Materials</th>
                                <th className="p-4">Plan</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {orders.map((order) => {
                                const masterPlan = order.files && order.files.find((f) => f.type === 'master_plan');
                                const displayOrderNumber = order.manualOrderNumber || order.orderNumber || order._id;

                                const glassStatus = computeStatus(order, ['Glass']);
                                const paintStatus = computeStatus(order, ['Paint']);
                                const materialsStatus = computeStatus(order, ['Aluminum', 'Hardware', 'Other']);

                                return (
                                    <tr key={order._id} className="hover:bg-slate-800/30 transition">
                                        <td className="p-4 font-mono text-amber-400">#{displayOrderNumber}</td>
                                        <td className="p-4 font-semibold text-white">{order.clientName}</td>
                                        <td className="p-4">{glassStatus}</td>
                                        <td className="p-4">{paintStatus}</td>
                                        <td className="p-4">{materialsStatus}</td>
                                        <td className="p-4">
                                            {masterPlan ? (
                                                <a
                                                    href={masterPlan.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-indigo-300 hover:text-indigo-200"
                                                >
                                                    <FileText size={14} /> View <ExternalLink size={12} />
                                                </a>
                                            ) : (
                                                <span className="text-slate-600">—</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {order.status !== 'in_production' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => startProduction(order._id)}
                                                        className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 border border-slate-700"
                                                    >
                                                        <Play size={14} /> Start
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setNoteOrderId(order._id)}
                                                    className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700"
                                                >
                                                    Add note
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => finishProduction(order._id)}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                                                >
                                                    <CheckCircle size={14} /> Ready for scheduling
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {noteOrderId && (
                <NoteModal
                    orderId={noteOrderId}
                    stage="production"
                    onClose={() => setNoteOrderId(null)}
                    onSaved={fetchProductionOrders}
                />
            )}
        </div>
    );
};

export default Production;