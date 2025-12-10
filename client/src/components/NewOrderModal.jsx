import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2, Search, CheckCircle, Loader } from 'lucide-react';
import { API_URL } from '../config/api';

const NewOrderModal = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();

  // נתוני טופס לקוח
  const [client, setClient] = useState({ name: '', phone: '', email: '', address: '', workflow: 'A' });

  // נתוני פריטים
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ productType: '', description: '', supplier: '' });

  // רשימות עזר (מהשרת)
  const [productsList, setProductsList] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);

  // סטייטים ללוגיקה
  const [isSearching, setIsSearching] = useState(false);
  const [clientFound, setClientFound] = useState(false);
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  // טעינת רשימות (מוצרים וספקים) בטעינה הראשונית
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, supRes] = await Promise.all([
          axios.get(`${API_URL}/products`, config),
          axios.get(`${API_URL}/suppliers`, config)
        ]);
        setProductsList(prodRes.data);
        setSuppliersList(supRes.data);
      } catch (error) { console.error("Error loading lists", error); }
    };
    fetchData();
  }, []);

  // בדיקת לקוח קיים לפי טלפון
  const handlePhoneBlur = async () => {
    if (!client.phone || client.phone.length < 9) return;

    setIsSearching(true);
    setClientFound(false);

    try {
      const res = await axios.get(`${API_URL}/orders/clients/lookup/${client.phone}`, config);

      if (res.data.found) {
        setClient(prev => ({
          ...prev,
          name: res.data.clientName,
          address: res.data.clientAddress || '',
          email: res.data.clientEmail || ''
        }));
        setClientFound(true);
      }
    } catch (error) {
      console.error("Error looking up client", error);
    } finally {
      setIsSearching(false);
    }
  };

  // בחירת מוצר (לוגיקה חכמה)
  const handleProductSelect = (e) => {
    const selectedName = e.target.value;

    // נסה למצוא את המוצר ברשימה כדי למשוך פרטים
    const productData = productsList.find(p => p.name === selectedName);

    if (productData) {
      setCurrentItem({
        productType: productData.name,
        description: productData.description || '', // מילוי אוטומטי
        supplier: productData.supplier || ''      // מילוי אוטומטי
      });
    } else {
      // אם זה מוצר חדש (טקסט חופשי), רק עדכן את השם
      setCurrentItem({ ...currentItem, productType: selectedName });
    }
  };

  const addItem = () => {
    if (!currentItem.productType) return;
    // אם לא נבחר ספק, נשים ברירת מחדל כדי לא לשבור את המערכת
    const itemToAdd = {
      ...currentItem,
      supplier: currentItem.supplier || 'General'
    };
    setItems([...items, itemToAdd]);
    setCurrentItem({ productType: '', description: '', supplier: '' }); // איפוס שורה
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (!client.name || items.length === 0) return alert('Fill details and add items');

    try {
      await axios.post(`${API_URL}/orders`, {
        clientName: client.name,
        clientPhone: client.phone,
        clientEmail: client.email,
        clientAddress: client.address,
        workflow: client.workflow,
        items: items
      }, config);

      onSuccess();
      onClose();
    } catch (error) {
      alert('Error creating order');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 w-full max-w-3xl rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">

        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{t('new_order')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* פרטי לקוח */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="relative">
              <label className="text-xs text-slate-400 block mb-1">{t('phone')}</label>
              <div className="relative">
                <input
                  type="text"
                  className={`w-full bg-slate-800 border ${clientFound ? 'border-emerald-500' : 'border-slate-600'} rounded-lg p-2 text-white pl-10`}
                  value={client.phone}
                  onChange={e => setClient({ ...client, phone: e.target.value })}
                  onBlur={handlePhoneBlur}
                  placeholder="Enter phone to auto-fill..."
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isSearching ? <Loader className="animate-spin text-blue-500" size={16} /> :
                    clientFound ? <CheckCircle className="text-emerald-500" size={16} /> :
                      <Search className="text-slate-500" size={16} />}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Email</label>
              <input type="email" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
                value={client.email} onChange={e => setClient({ ...client, email: e.target.value })} />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">{t('client_name')}</label>
              <input type="text" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
                value={client.name} onChange={e => setClient({ ...client, name: e.target.value })} />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">{t('address')}</label>
              <input type="text" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
                value={client.address} onChange={e => setClient({ ...client, address: e.target.value })} />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-slate-400 block mb-1">{t('workflow')}</label>
              <select className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
                value={client.workflow} onChange={e => setClient({ ...client, workflow: e.target.value })}>
                <option value="A">Route A (Regular)</option>
                <option value="B">Route B (+Paint)</option>
                <option value="C">Route C (Supply Only)</option>
              </select>
            </div>
          </div>

          {/* הוספת פריטים */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <h3 className="text-sm font-bold text-white mb-3">{t('items')}</h3>

            <div className="flex flex-col md:flex-row gap-2 mb-4 items-end">

              {/* בחירת מוצר (Smart Input) */}
              <div className="flex-1 w-full">
                <label className="text-[10px] text-slate-500 block mb-1">{t('product')}</label>
                <input
                  list="products-list"
                  placeholder={t('select_product')}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm"
                  value={currentItem.productType}
                  onChange={handleProductSelect}
                />
                <datalist id="products-list">
                  {productsList.map(p => <option key={p._id} value={p.name} />)}
                </datalist>
              </div>

              {/* תיאור */}
              <div className="flex-[2] w-full">
                <label className="text-[10px] text-slate-500 block mb-1">{t('description')}</label>
                <input
                  type="text"
                  placeholder="Auto-filled from product..."
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm"
                  value={currentItem.description}
                  onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })}
                />
              </div>

              {/* ספק */}
              <div className="flex-1 w-full">
                <label className="text-[10px] text-slate-500 block mb-1">{t('supplier')}</label>
                <select className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm"
                  value={currentItem.supplier} onChange={e => setCurrentItem({ ...currentItem, supplier: e.target.value })}>
                  <option value="">Select Supplier</option>
                  {suppliersList.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <button onClick={addItem} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg mb-[1px]">
                <Plus size={20} />
              </button>
            </div>

            {/* רשימת הפריטים שנוספו */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-700 text-sm">
                  <span className="text-white">
                    <span className="font-bold">{item.productType}</span> - {item.description}
                    <span className="text-blue-400 text-xs ml-2">({item.supplier})</span>
                  </span>
                  <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                </div>
              ))}
              {items.length === 0 && <p className="text-slate-500 text-xs text-center py-2">No items yet</p>}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">{t('cancel')}</button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg">
            {t('save_order')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewOrderModal;