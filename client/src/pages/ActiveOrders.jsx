import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Plus, Package, Clock, CheckCircle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewOrderModal from '../components/NewOrderModal';
import { API_URL } from '../config/api';

const ActiveOrders = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'cancelled'
    const [orders, setOrders] = useState([]);
    const [cancelledOrders, setCancelledOrders] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingCancelled, setLoadingCancelled] = useState(false);
    const userInfo = localStorage.getItem('userInfo');
    const user = userInfo ? JSON.parse(userInfo) : null;

    const fetchOrders = useCallback(async () => {
        if (!user || !user.token) {
            console.error('User not authenticated');
            setLoading(false);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/orders`, config);

            // filter only non-completed and non-cancelled orders
            const active = res.data.filter(o => o.status !== 'completed' && o.status !== 'cancelled');

            setOrders(active);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('userInfo');
                navigate('/login');
            }
            setLoading(false);
        }
    }, [user, navigate]);

    const fetchCancelledOrders = useCallback(async () => {
        if (!user || !user.token) {
            console.error('User not authenticated');
            setLoadingCancelled(false);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_URL}/orders/deleted`, config);
            setCancelledOrders(res.data);
            setLoadingCancelled(false);
        } catch (error) {
            console.error('Error fetching cancelled orders:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('userInfo');
                navigate('/login');
            }
            setLoadingCancelled(false);
        }
    }, [user, navigate]);

    const restoreOrder = async (orderId) => {
        if (!user || !user.token) return;
        if (!window.confirm(t('restore_order_confirm') || 'Are you sure you want to restore this order?')) {
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`${API_URL}/orders/${orderId}/restore`, {}, config);
            fetchCancelledOrders();
            fetchOrders();
        } catch (error) {
            console.error('Error restoring order:', error);
            alert(t('error') + ': ' + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchOrders();
    }, []);

    useEffect(() => {
        if (activeTab === 'cancelled') {
            setLoadingCancelled(true);
            fetchCancelledOrders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'offer': return 'bg-slate-700 text-slate-300';
            case 'production': return 'bg-amber-500/20 text-amber-400';
            case 'install': return 'bg-blue-500/20 text-blue-400';
            case 'new': return 'bg-blue-500/20 text-blue-400';
            case 'materials_pending': return 'bg-orange-500/20 text-orange-400';
            case 'production_pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'in_production': return 'bg-amber-500/20 text-amber-400';
            case 'ready_for_install': return 'bg-green-500/20 text-green-400';
            case 'scheduled': return 'bg-blue-500/20 text-blue-400';
            case 'installed': return 'bg-purple-500/20 text-purple-400';
            case 'pending_approval': return 'bg-indigo-500/20 text-indigo-400';
            case 'completed': return 'bg-emerald-500/20 text-emerald-400';
            case 'cancelled': return 'bg-red-500/20 text-red-400';
            default: return 'bg-slate-700 text-white';
        }
    };

    const getStatusTranslation = (status) => {
        const statusKey = `status_${status}`;
        return t(statusKey) || status.toUpperCase();
    };

    const getDaysUntilDeletion = (deletedAt) => {
        if (!deletedAt) return null;
        const deleted = new Date(deletedAt);
        const sevenDaysLater = new Date(deleted.getTime() + 7 * 24 * 60 * 60 * 1000);
        const now = new Date();
        const diffMs = sevenDaysLater - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">{t('sidebar_active_orders')}</h2>
                {user && ['super_admin', 'admin', 'office'].includes(user.role) && activeTab === 'active' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium shadow-lg transition"
                    >
                        <Plus size={20} /> {t('active_add_new')}
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-800">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-3 font-medium transition ${
                        activeTab === 'active'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-slate-400 hover:text-slate-300'
                    }`}
                >
                    {t('active') || 'Active'}
                </button>
                <button
                    onClick={() => setActiveTab('cancelled')}
                    className={`px-6 py-3 font-medium transition ${
                        activeTab === 'cancelled'
                            ? 'text-red-400 border-b-2 border-red-400'
                            : 'text-slate-400 hover:text-slate-300'
                    }`}
                >
                    {t('cancelled') || 'Cancelled'}
                </button>
            </div>

            {/* Active Orders Table */}
            {activeTab === 'active' && (
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="p-4">{t('active_col_order')}</th>
                                <th className="p-4">{t('client_name')}</th>
                                <th className="p-4">{t('region')}</th>
                                <th className="p-4 text-center">{t('work_days')}</th>
                                <th className="p-4">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300 divide-y divide-slate-800">
                            {loading ? (<tr><td colSpan="5" className="p-8 text-center">{t('loading')}</td></tr>) :
                                orders.length === 0 ? (<tr><td colSpan="5" className="p-8 text-center text-slate-500">{t('no_open_orders')}</td></tr>) :
                                    orders.map((order) => {
                                        const displayOrderNumber = order.manualOrderNumber || order.orderNumber || order._id;

                                        return (
                                            <tr
                                                key={order._id}
                                                onClick={() => navigate(`/orders/${order._id}`)}
                                                className="hover:bg-slate-800/50 transition cursor-pointer"
                                            >
                                                <td className="p-4 font-mono text-blue-400">#{displayOrderNumber}</td>
                                                <td className="p-4 font-bold text-white">{order.clientName}</td>
                                                <td className="p-4">{order.region || order.clientAddress}</td>
                                                <td className="p-4 text-center">
                                                    <span className="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">
                                                        {order.estimatedInstallationDays || 1}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(order.status)}`}>
                                                        {getStatusTranslation(order.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Cancelled Orders Table */}
            {activeTab === 'cancelled' && (
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="p-4">{t('active_col_order')}</th>
                                <th className="p-4">{t('client_name')}</th>
                                <th className="p-4">{t('region')}</th>
                                <th className="p-4">{t('cancelled_date') || 'Cancelled Date'}</th>
                                <th className="p-4">{t('days_until_deletion') || 'Days Until Deletion'}</th>
                                <th className="p-4">{t('actions') || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300 divide-y divide-slate-800">
                            {loadingCancelled ? (
                                <tr><td colSpan="6" className="p-8 text-center">{t('loading')}</td></tr>
                            ) : cancelledOrders.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500">{t('no_cancelled_orders') || 'No cancelled orders'}</td></tr>
                            ) : (
                                cancelledOrders.map((order) => {
                                    const displayOrderNumber = order.manualOrderNumber || order.orderNumber || order._id;
                                    const daysLeft = getDaysUntilDeletion(order.deletedAt);

                                    return (
                                        <tr
                                            key={order._id}
                                            className="hover:bg-slate-800/50 transition"
                                        >
                                            <td 
                                                className="p-4 font-mono text-red-400 cursor-pointer"
                                                onClick={() => navigate(`/orders/${order._id}`)}
                                            >
                                                #{displayOrderNumber}
                                            </td>
                                            <td 
                                                className="p-4 font-bold text-white cursor-pointer"
                                                onClick={() => navigate(`/orders/${order._id}`)}
                                            >
                                                {order.clientName}
                                            </td>
                                            <td 
                                                className="p-4 cursor-pointer"
                                                onClick={() => navigate(`/orders/${order._id}`)}
                                            >
                                                {order.region || order.clientAddress || '—'}
                                            </td>
                                            <td className="p-4 text-slate-400">
                                                {order.deletedAt ? new Date(order.deletedAt).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="p-4">
                                                {daysLeft !== null && (
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                        daysLeft === 0 
                                                            ? 'bg-red-500/20 text-red-400' 
                                                            : daysLeft <= 2 
                                                            ? 'bg-orange-500/20 text-orange-400'
                                                            : 'bg-slate-800 text-slate-300'
                                                    }`}>
                                                        {daysLeft} {t('days') || 'days'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        restoreOrder(order._id);
                                                    }}
                                                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 transition"
                                                >
                                                    <RotateCcw size={14} />
                                                    {t('restore') || 'Restore'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && <NewOrderModal onClose={() => setIsModalOpen(false)} onSuccess={fetchOrders} />}
        </div>
    );
};

export default ActiveOrders;