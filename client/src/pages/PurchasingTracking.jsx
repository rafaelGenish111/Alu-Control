import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Truck, CheckSquare, ChevronDown, ChevronUp, User, Calendar } from 'lucide-react';
import { API_URL } from '../config/api';

const PurchasingTracking = () => {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState([]);
  const [expandedSupplier, setExpandedSupplier] = useState(null);

  const user = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/procurement/tracking`, config);
      setSuppliers(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleArrival = async (orderId, materialId, currentStatus) => {
    try {
      await axios.post(`${API_URL}/orders/procurement/arrive-item`, {
          orderId, materialId, isArrived: !currentStatus
      }, config);
      fetchData(); // רענון כדי לראות את ה-V מתעדכן
    } catch (error) { alert('Error updating status'); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Truck className="text-emerald-500" /> מעקב רכש וקבלת סחורה
      </h2>

      <div className="space-y-4">
        {suppliers.map(group => (
            <div key={group._id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                
                {/* Supplier Header */}
                <div 
                    onClick={() => setExpandedSupplier(expandedSupplier === group._id ? null : group._id)}
                    className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-800/50 transition"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-emerald-500 font-bold border border-slate-700">
                            {group._id.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{group._id}</h3>
                            <p className="text-sm text-slate-400">{group.items.filter(i => !i.isArrived).length} פריטים בדרך</p>
                        </div>
                    </div>
                    {expandedSupplier === group._id ? <ChevronUp className="text-slate-500"/> : <ChevronDown className="text-slate-500"/>}
                </div>

                {/* Items Checklist (Expandable) */}
                {expandedSupplier === group._id && (
                    <div className="border-t border-slate-800 bg-slate-950/30 p-4">
                        <div className="space-y-2">
                            {group.items.map((item, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${item.isArrived ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-slate-900 border-slate-800'}`}>
                                    
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => toggleArrival(item.orderId, item.materialId, item.isArrived)}
                                            className={`w-6 h-6 rounded border flex items-center justify-center transition ${item.isArrived ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600 hover:border-emerald-500'}`}
                                        >
                                            {item.isArrived && <CheckSquare size={14}/>}
                                        </button>
                                        
                                        <div>
                                            <p className={`text-sm font-medium ${item.isArrived ? 'text-slate-500 line-through' : 'text-white'}`}>
                                                {item.quantity}x {item.description}
                                            </p>
                                            <div className="flex gap-3 text-xs text-slate-500 mt-1">
                                                <span className="text-blue-400 font-mono">#{item.orderNumber}</span>
                                                <span>{item.clientName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right text-xs text-slate-500">
                                        <div className="flex items-center justify-end gap-1"><User size={10}/> {item.orderedBy}</div>
                                        <div className="flex items-center justify-end gap-1"><Calendar size={10}/> {new Date(item.orderedAt).toLocaleDateString()}</div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ))}
        {suppliers.length === 0 && <div className="text-white text-center py-10">אין הזמנות רכש פתוחות</div>}
      </div>
    </div>
  );
};

export default PurchasingTracking;