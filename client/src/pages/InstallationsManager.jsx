import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Truck, Calendar, MapPin, Users, CheckCircle, Clock } from 'lucide-react';
import SchedulingModal from '../components/SchedulingModal';
import { API_URL } from '../config/api';

const InstallationsManager = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // למודל השיבוץ
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders`, config);
      setOrders(res.data);
      setLoading(false);
    } catch (error) { console.error(error); setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  // פונקציית אישור סופי (סגירת הזמנה)
  const handleApprove = async (orderId) => {
    if(!window.confirm(t('approve_close') + '?')) return;
    try {
      await axios.post(`${API_URL}/orders/install/approve`, { orderId }, config);
      fetchOrders();
    } catch (error) { alert('Error approving'); }
  };

  // --- הקסם: סינון לסלים (Buckets) ---
  const readyToSchedule = orders.filter(o => o.status === 'ready_for_install');
  const scheduled = orders.filter(o => o.status === 'scheduled');
  const pendingApproval = orders.filter(o => o.status === 'pending_approval');

  // רכיב כרטיס בודד לשימוש חוזר
  const OrderCard = ({ order, actionBtn }) => (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm hover:border-blue-500/50 transition mb-3">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-white text-sm">{order.clientName}</h4>
        <span className="text-xs font-mono text-slate-500">#{order.orderNumber}</span>
      </div>
      <p className="text-xs text-slate-400 flex items-center gap-1 mb-2"><MapPin size={12}/> {order.clientAddress}</p>
      
      {/* תצוגת צוות ותאריכים (אם יש) */}
      {order.installDateStart && (
        <div className="bg-slate-900/50 p-2 rounded mb-3 text-xs border border-slate-700/50">
          <p className="text-emerald-400 flex items-center gap-1 mb-1">
            <Calendar size={12}/> {new Date(order.installDateStart).toLocaleDateString()} - {new Date(order.installDateEnd).toLocaleDateString()}
          </p>
          <p className="text-blue-300 flex items-center gap-1">
            <Users size={12}/> {order.installers?.length || 0} Installers
          </p>
        </div>
      )}

      {actionBtn}
    </div>
  );

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Truck className="text-emerald-500" /> {t('installations_center')}
      </h2>

      {/* Kanban Columns Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        
        {/* Column 1: Ready to Schedule */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-900 rounded-t-2xl flex justify-between items-center">
            <h3 className="font-bold text-slate-300 flex items-center gap-2"><Clock size={18}/> {t('col_ready')}</h3>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">{readyToSchedule.length}</span>
          </div>
          <div className="p-3 overflow-y-auto flex-1 custom-scrollbar">
            {readyToSchedule.map(order => (
              <OrderCard key={order._id} order={order} 
                actionBtn={
                  <button onClick={() => setSelectedOrder(order)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-bold mt-2">
                    {t('schedule_job')}
                  </button>
                } 
              />
            ))}
          </div>
        </div>

        {/* Column 2: Scheduled / In Progress */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-900 rounded-t-2xl flex justify-between items-center">
            <h3 className="font-bold text-blue-300 flex items-center gap-2"><Calendar size={18}/> {t('col_scheduled')}</h3>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">{scheduled.length}</span>
          </div>
          <div className="p-3 overflow-y-auto flex-1 custom-scrollbar">
            {scheduled.map(order => (
              <OrderCard key={order._id} order={order} 
                actionBtn={<div className="text-center text-xs text-slate-500 py-1">In Progress</div>} 
              />
            ))}
          </div>
        </div>

        {/* Column 3: Pending Approval */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-900 rounded-t-2xl flex justify-between items-center">
            <h3 className="font-bold text-emerald-400 flex items-center gap-2"><CheckCircle size={18}/> {t('col_pending_approval')}</h3>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">{pendingApproval.length}</span>
          </div>
          <div className="p-3 overflow-y-auto flex-1 custom-scrollbar">
            {pendingApproval.map(order => (
              <OrderCard key={order._id} order={order} 
                actionBtn={
                  <button onClick={() => handleApprove(order._id)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-bold mt-2">
                    {t('approve_close')}
                  </button>
                } 
              />
            ))}
          </div>
        </div>

      </div>

      {selectedOrder && (
        <SchedulingModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onSuccess={fetchOrders} 
        />
      )}
    </div>
  );
};

export default InstallationsManager;