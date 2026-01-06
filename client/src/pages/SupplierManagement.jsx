import React, { useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Truck, Plus, Trash2, User, Phone, Clock, Edit2, Save, X } from 'lucide-react';
import { API_URL } from '../config/api';

const SupplierManagement = () => {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({ name: '', contactPerson: '', phone: '', leadTime: 7, category: 'Aluminum' });
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', contactPerson: '', phone: '', leadTime: 7, category: 'Aluminum' });
  const [savingSupplier, setSavingSupplier] = useState(false);
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const token = user?.token;
  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/suppliers`, config);
      setSuppliers(res.data);
    } catch (e) { console.error(e); }
  }, [config]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/suppliers`, formData, config);
      alert('Supplier added!');
      setFormData({ name: '', contactPerson: '', phone: '', leadTime: 7, category: 'Aluminum' });
      fetchSuppliers();
    } catch (e) {
      console.error(e);
      alert('Error adding supplier');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    try {
      await axios.delete(`${API_URL}/suppliers/${id}`, config);
      fetchSuppliers();
    } catch (e) {
      console.error(e);
      alert('Error deleting');
    }
  };

  const startEdit = (supplier) => {
    setEditingSupplier(supplier._id);
    setEditFormData({
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone || '',
      leadTime: supplier.leadTime || 7,
      category: supplier.category || 'Aluminum'
    });
  };

  const cancelEdit = () => {
    setEditingSupplier(null);
    setEditFormData({ name: '', contactPerson: '', phone: '', leadTime: 7, category: 'Aluminum' });
  };

  const saveSupplier = async (id) => {
    setSavingSupplier(true);
    try {
      await axios.put(`${API_URL}/suppliers/${id}`, editFormData, config);
      setSavingSupplier(false);
      setEditingSupplier(null);
      fetchSuppliers();
    } catch (e) {
      console.error(e);
      setSavingSupplier(false);
      alert('Error updating supplier');
    }
  };

  // Client-side guard (server also enforces)
  if (!['super_admin', 'admin'].includes(user?.role)) {
    return <div className="text-white p-8">Access denied.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Truck className="text-orange-500" /> {t('supplier_management')}
      </h2>

      {/* Form */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4">{t('add_supplier')}</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder={t('name')} required className="bg-slate-900 border border-slate-600 rounded-lg p-2 text-white"
            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />

          <input type="text" placeholder={t('contact_person')} className="bg-slate-900 border border-slate-600 rounded-lg p-2 text-white"
            value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} />

          <input type="text" placeholder={t('phone')} className="bg-slate-900 border border-slate-600 rounded-lg p-2 text-white"
            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs whitespace-nowrap">{t('lead_time')}:</span>
            <input type="number" className="bg-slate-900 border border-slate-600 rounded-lg p-2 text-white w-full"
              value={formData.leadTime} onChange={e => setFormData({ ...formData, leadTime: e.target.value })} />
          </div>

          <select className="bg-slate-900 border border-slate-600 rounded-lg p-2 text-white"
            value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
            <option value="Aluminum">Aluminum</option>
            <option value="Glass">Glass</option>
            <option value="Hardware">Hardware</option>
            <option value="Other">Other</option>
          </select>

          <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2">
            <Plus size={18} /> {t('add_supplier')}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map(s => (
          <div key={s._id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow hover:border-orange-500/50 transition relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <button onClick={() => startEdit(s)} className="text-slate-600 hover:text-blue-500">
                <Edit2 size={18} />
              </button>
              <button onClick={() => handleDelete(s._id)} className="text-slate-600 hover:text-red-500">
                <Trash2 size={18} />
              </button>
            </div>

            {editingSupplier === s._id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
                  placeholder={t('name')}
                />
                <input
                  type="text"
                  value={editFormData.contactPerson}
                  onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
                  placeholder={t('contact_person')}
                />
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
                  placeholder={t('phone')}
                />
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs whitespace-nowrap">{t('lead_time')}:</span>
                  <input
                    type="number"
                    value={editFormData.leadTime}
                    onChange={(e) => setEditFormData({ ...editFormData, leadTime: e.target.value })}
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
                  />
                </div>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
                >
                  <option value="Aluminum">Aluminum</option>
                  <option value="Glass">Glass</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Other">Other</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveSupplier(s._id)}
                    disabled={savingSupplier}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> {t('save')}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg px-4"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-orange-500 font-bold">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{s.name}</h4>
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">{s.category}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-400">
                  <p className="flex items-center gap-2"><User size={14} /> {s.contactPerson || '-'}</p>
                  <p className="flex items-center gap-2"><Phone size={14} /> {s.phone || '-'}</p>
                  <p className="flex items-center gap-2"><Clock size={14} /> {s.leadTime} days</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupplierManagement;