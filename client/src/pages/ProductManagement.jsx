import React, { useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Package, Plus, Trash2, Tag, Layers } from 'lucide-react';
import { API_URL } from '../config/api';

const ProductManagement = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Product form
    const [formData, setFormData] = useState({
        name: '', sku: '', category: '', description: '', supplier: '', dimensions: '', color: ''
    });
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const token = user?.token;
    const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

    // Load data
    const fetchData = useCallback(async () => {
        try {
            const [prodRes, supRes] = await Promise.all([
                axios.get(`${API_URL}/products`, config),
                axios.get(`${API_URL}/suppliers`, config)
            ]);
            setProducts(prodRes.data);
            setSuppliers(supRes.data);
        } catch (e) { console.error(e); }
    }, [config]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchData(); }, [fetchData]);

    // Unique categories list (for autocomplete)
    const existingCategories = [...new Set(products.map(p => p.category))];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/products`, formData, config);
            alert('Product Added!');
            setFormData({ name: '', sku: '', category: '', description: '', supplier: '', dimensions: '', color: '' });
            setIsModalOpen(false);
            fetchData();
        } catch (e) {
            console.error(e);
            alert('Error adding product');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete product?')) return;
        try {
            await axios.delete(`${API_URL}/products/${id}`, config);
            fetchData();
        } catch (e) {
            console.error(e);
            alert('Error');
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Package className="text-pink-500" /> {t('product_management')}
                </h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg">
                    <Plus size={20} /> {t('add_product')}
                </button>
            </div>

            {/* Product List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                    <div key={p._id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow hover:border-pink-500/50 transition relative group">
                        <button onClick={() => handleDelete(p._id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                            <Trash2 size={18} />
                        </button>

                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                                <Tag size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">{p.name}</h4>
                                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">{p.category}</span>
                            </div>
                        </div>

                        <div className="space-y-1 text-sm text-slate-400 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                            <p><span className="text-slate-500">SKU:</span> {p.sku || '-'}</p>
                            <p><span className="text-slate-500">Supplier:</span> {p.supplier || '-'}</p>
                            <p><span className="text-slate-500">Info:</span> {p.description || '-'}</p>
                            {(p.dimensions || p.color) && (
                                <p className="pt-1 mt-1 border-t border-slate-800 text-xs text-slate-500">
                                    {p.dimensions} {p.color ? `• ${p.color}` : ''}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal - Add Product */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6">{t('add_product')}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">{t('product')} *</label>
                                    <input type="text" required className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">{t('category')} *</label>
                                    <input type="text" list="category-list" required className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
                                        value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="Type or select..." />
                                    <datalist id="category-list">
                                        {existingCategories.map(cat => <option key={cat} value={cat} />)}
                                    </datalist>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">{t('sku')}</label>
                                    <input type="text" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
                                        value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">{t('supplier')}</label>
                                    <select className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm"
                                        value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })}>
                                        <option value="">General</option>
                                        {suppliers.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 block mb-1">{t('description')}</label>
                                <textarea className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm" rows="2"
                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">{t('dimensions')}</label>
                                    <input type="text" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
                                        value={formData.dimensions} onChange={e => setFormData({ ...formData, dimensions: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">{t('color')}</label>
                                    <input type="text" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white"
                                        value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400">{t('cancel')}</button>
                                <button type="submit" className="px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-bold">{t('save_order')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;