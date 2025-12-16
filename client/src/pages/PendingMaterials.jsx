import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Check, Clock, AlertCircle } from 'lucide-react';
import { API_URL } from '../config/api';

const PendingMaterials = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/procurement/pending`, config);
      setItems(res.data);
      setLoading(false);
    } catch (error) { console.error(error); setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleOrder = async (orderId, materialId) => {
    if(!window.confirm("Mark this item as ORDERED?")) return;
    try {
      await axios.post(`${API_URL}/orders/procurement/order-item`, { orderId, materialId }, config);
      fetchItems(); // רענון - השורה תיעלם כי היא עברה ל-Purchasing
    } catch (error) { alert('Error'); }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <ShoppingCart className="text-orange-500" /> פריטים להזמנה (Pending)
      </h2>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="p-4">תאריך הזמנה</th>
              <th className="p-4">מס' הזמנה</th>
              <th className="p-4">לקוח</th>
              <th className="p-4">ספק</th>
              <th className="p-4">פריט / תיאור</th>
              <th className="p-4">כמות</th>
              <th className="p-4">פעולה</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition">
                <td className="p-4 whitespace-nowrap text-slate-500">
                   {new Date(item.orderDate).toLocaleDateString()}
                </td>
                <td className="p-4 font-mono text-blue-400">#{item.orderNumber}</td>
                <td className="p-4 font-bold text-white">{item.clientName}</td>
                <td className="p-4 text-orange-300">{item.supplier}</td>
                <td className="p-4">
                    <span className="text-xs uppercase bg-slate-800 px-1 rounded border border-slate-700 mr-2">{item.materialType}</span>
                    {item.description}
                </td>
                <td className="p-4">{item.quantity}</td>
                <td className="p-4">
                    <button 
                        onClick={() => handleOrder(item.orderId, item.materialId)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-lg"
                    >
                        <Check size={14}/> הוזמן
                    </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
                <tr><td colSpan="7" className="p-10 text-center text-slate-500">אין פריטים שממתינים להזמנה 🎉</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingMaterials;