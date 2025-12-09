import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Shield, CheckCircle, AlertCircle, User, Trash2 } from 'lucide-react';

const AdminPanel = () => {
  const { t } = useTranslation();

  // State ליצירה ולרשימה
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'installer', language: 'es' });
  const [message, setMessage] = useState(null);

  const API_URL = 'http://localhost:5000/api';
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  // שליפת רשימת העובדים
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/users`, config);
      setUsers(res.data);
    } catch (error) { console.error("Error fetching users"); }
  };

  useEffect(() => { fetchUsers(); }, []);

  // יצירת עובד חדש
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth/create-user`, formData, config);
      setMessage({ type: 'success', text: t('success') });
      setFormData({ name: '', email: '', password: '', role: 'installer', language: 'es' });
      fetchUsers(); // רענון הטבלה
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || t('error') });
    }
  };

  // מחיקת עובד (אופציונלי - דורש הוספת ראוט מתאים בשרת אם תרצה)
  const handleDelete = async (id) => {
    alert("Delete functionality coming soon (Requires backend implementation)");
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'admin': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'installer': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'production': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <Shield className="text-blue-500" /> {t('admin_panel')}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* צד ימין: טופס הוספה */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl sticky top-4">
            <h3 className="text-xl text-white font-bold mb-6 flex items-center gap-2">
              <User size={20} /> {t('create_user')}
            </h3>

            {message && (
              <div className={`p-3 rounded-lg mb-4 text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">{t('name')}</label>
                <input type="text" required className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white text-sm"
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">{t('email')}</label>
                <input type="email" required className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white text-sm"
                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">{t('password')}</label>
                <input type="password" required className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white text-sm"
                  value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t('role')}</label>
                  <select className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white text-sm"
                    value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                    <option value="installer">Installer</option>
                    <option value="production">Production</option>
                    <option value="office">Office</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Lang</label>
                  <select className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white text-sm"
                    value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })}>
                    <option value="es">ES</option>
                    <option value="en">EN</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl mt-2 transition shadow-lg">
                {t('create_user')}
              </button>
            </form>
          </div>
        </div>

        {/* צד שמאל: רשימת עובדים */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="p-5 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">מצבת כוח אדם ({users.length})</h3>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/30 text-slate-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-4">שם העובד</th>
                  <th className="p-4">אימייל (שם משתמש)</th>
                  <th className="p-4">תפקיד</th>
                  <th className="p-4">שפה</th>
                  {/* <th className="p-4 w-10"></th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-xs">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getRoleBadge(u.role)}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-xs uppercase">{u.language}</td>
                    {/* <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(u._id)} className="text-slate-600 hover:text-red-500 transition">
                                        <Trash2 size={16}/>
                                    </button>
                                </td> 
                                */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;