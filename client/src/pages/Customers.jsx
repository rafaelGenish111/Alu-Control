import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Search, Phone, MapPin, Calendar, Package } from 'lucide-react';
import { API_URL } from '../config/api';

const Customers = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const userInfo = localStorage.getItem('userInfo');
    const user = userInfo ? JSON.parse(userInfo) : null;

    useEffect(() => {
        const fetchCustomers = async () => {
            if (!user || !user.token) {
                console.error('User not authenticated');
                setLoading(false);
                return;
            }

            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const res = await axios.get(`${API_URL}/orders/customers/list`, config);
                setCustomers(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching customers:', error);
                if (error.response?.status === 401) {
                    // Token expired or invalid - redirect to login
                    localStorage.removeItem('userInfo');
                    navigate('/login');
                }
                setLoading(false);
            }
        };
        fetchCustomers();
    }, [user, navigate]);

    // Filter logic: search by name, phone or address
    const filteredCustomers = customers.filter(c =>
        c._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm)) ||
        (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto">

            {/* Header & search input */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3 self-start md:self-auto">
                    <Users className="text-purple-500" /> {t('customers')}
                </h2>

                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-slate-500" size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder={t('search_client_placeholder')}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl py-3 pl-10 pr-4 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Customers table */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs font-semibold">
                            <tr>
                                <th className="p-4">{t('client_name')}</th>
                                <th className="p-4">{t('phone')}</th>
                                <th className="p-4">{t('address')}</th>
                                <th className="p-4 text-center">{t('total_orders')}</th>
                                <th className="p-4">{t('last_activity')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300 divide-y divide-slate-800">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading customers...</td></tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No customers found.</td></tr>
                            ) : (
                                filteredCustomers.map((c, idx) => (
                                    <tr
                                        key={idx}
                                        onClick={() => navigate(`/customers/${encodeURIComponent(c._id)}`)}
                                        className="hover:bg-slate-800/50 transition cursor-pointer group"
                                    >
                                        <td className="p-4 font-bold text-white group-hover:text-purple-400 transition-colors flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                                                {c._id.charAt(0).toUpperCase()}
                                            </div>
                                            {c._id}
                                        </td>
                                        <td className="p-4 text-slate-400">{c.phone || '-'}</td>
                                        <td className="p-4 text-slate-400 max-w-[200px] truncate" title={c.address}>{c.address || '-'}</td>
                                        <td className="p-4 text-center">
                                            <span className="bg-slate-800 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-700">
                                                {c.totalOrders}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500 text-xs font-mono">
                                            {new Date(c.lastOrderDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 text-xs text-slate-500 text-right">
                Showing {filteredCustomers.length} results
            </div>
        </div>
    );
};

export default Customers;