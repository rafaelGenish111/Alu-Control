import React, { useCallback, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Camera, CheckCircle, Loader, RefreshCw, FileText, ClipboardList, X, Save, Menu, Calendar, User, Trash2, Edit2, Plus, Settings, Sun, Moon, Monitor, LogOut } from 'lucide-react';
import { API_URL } from '../config/api';
import NoteModal from '../components/NoteModal';
import MasterPlanPreviewModal from '../components/MasterPlanPreviewModal';
import { useDarkMode } from '../contexts/DarkModeContext';

const InstallerApp = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { darkMode, changeDarkMode } = useDarkMode();
    const isRTL = i18n.language === 'he';
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState(null);
    const [range, setRange] = useState('today'); // today | tomorrow | week
    const [noteOrderId, setNoteOrderId] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [takeListJob, setTakeListJob] = useState(null);
    const [takeListDraft, setTakeListDraft] = useState([]);
    const [savingTakeList, setSavingTakeList] = useState(false);
    const [newTakeListItem, setNewTakeListItem] = useState('');
    const [editingTakeItemIndex, setEditingTakeItemIndex] = useState(null);
    const [editingTakeItemText, setEditingTakeItemText] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const user = JSON.parse(localStorage.getItem('userInfo'));
    const token = user?.token;
    const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

    const isAssignedToMe = useCallback((order) => {
        const installers = Array.isArray(order.installers) ? order.installers : [];
        return installers.some((inst) => {
            const id = typeof inst === 'string' ? inst : inst?._id;
            return String(id) === String(user?._id);
        });
    }, [user?._id]);

    const inRange = useCallback((dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return false;

        const startOfDay = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
        const today = startOfDay(new Date());

        if (range === 'today') {
            const end = new Date(today);
            end.setDate(end.getDate() + 1);
            return d >= today && d < end;
        }
        if (range === 'tomorrow') {
            const start = new Date(today);
            start.setDate(start.getDate() + 1);
            const end = new Date(today);
            end.setDate(end.getDate() + 2);
            return d >= start && d < end;
        }
        // week
        const end = new Date(today);
        end.setDate(end.getDate() + 7);
        return d >= today && d < end;
    }, [range]);

    const isOverdue = useCallback((job) => {
        if (!job.installDateStart) return false;
        const now = new Date();
        const deadline = job.installDateEnd ? new Date(job.installDateEnd) : new Date(job.installDateStart);
        if (Number.isNaN(deadline.getTime())) return false;
        return deadline.getTime() < now.getTime();
    }, []);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const [ordersRes, repairsRes] = await Promise.all([
                axios.get(`${API_URL}/orders`, config),
                axios.get(`${API_URL}/repairs`, config)
            ]);

            const myOrderJobs = ordersRes.data
                .filter((o) => ['scheduled', 'install'].includes(o.status)) // keep legacy
                .filter(isAssignedToMe)
                .filter((o) => !o.installDateStart || inRange(o.installDateStart) || isOverdue({ ...o, installDateEnd: o.installDateEnd }))
                .map((o) => ({ ...o, __type: 'order' }));

            const myRepairJobs = repairsRes.data
                .filter((r) => ['scheduled', 'in_progress'].includes(r.status))
                .filter((r) => {
                    const installers = Array.isArray(r.installers) ? r.installers : [];
                    return installers.some((inst) => String(inst) === String(user?._id));
                })
                .filter((r) => !r.installDateStart || inRange(r.installDateStart) || isOverdue({ ...r, installDateEnd: r.installDateEnd }))
                .map((r) => ({ ...r, __type: 'repair' }));

            setJobs([...myOrderJobs, ...myRepairJobs]);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            setLoading(false);
        }
    }, [config, inRange, isAssignedToMe, isOverdue, user?._id]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    const handleFileUpload = async (e, job) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingId(job._id);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            const isVideo = file.type.startsWith('video/');
            if (job.__type === 'repair') {
                await axios.post(`${API_URL}/repairs/${job._id}/media`, {
                    url: uploadRes.data.url,
                    type: isVideo ? 'video' : 'photo',
                    name: file.name || 'Installation proof'
                }, config);
            } else {
                await axios.put(`${API_URL}/orders/${job._id}/files`, {
                    url: uploadRes.data.url,
                    type: 'site_photo',
                    name: 'Installation Proof'
                }, config);
            }
            alert(t('file_uploaded'));
            setUploadingId(null);
            fetchJobs();
        } catch (e) {
            console.error('Upload error:', e);
            const errorMessage = e.response?.data?.message || e.message || 'Upload failed';
            alert(errorMessage);
            setUploadingId(null);
        }
    };

    const finishJob = async (job) => {
        if (!window.confirm(t('finish_job') + '?')) return;
        try {
            if (job.__type === 'repair') {
                const response = await axios.post(`${API_URL}/repairs/${job._id}/close`, {}, config);
                if (response.data && response.data.status) {
                    // Success
                }
            } else {
                const response = await axios.put(`${API_URL}/orders/${job._id}/status`, { status: 'pending_approval' }, config);
                if (response.data && response.data.status) {
                    // Success
                }
            }
            fetchJobs();
        } catch (e) {
            console.error('Error finishing job:', e);
            const errorMessage = e.response?.data?.message || e.message || t('error') || 'Error';
            alert(`${t('error') || 'Error'}: ${errorMessage}`);
        }
    };

    const openTakeList = (job) => {
        const list = Array.isArray(job.installTakeList) ? job.installTakeList : [];
        setTakeListJob(job);
        setTakeListDraft(list);
        setNewTakeListItem('');
        setEditingTakeItemIndex(null);
        setEditingTakeItemText('');
    };

    const closeTakeList = () => {
        setTakeListJob(null);
        setTakeListDraft([]);
        setSavingTakeList(false);
        setNewTakeListItem('');
        setEditingTakeItemIndex(null);
        setEditingTakeItemText('');
    };

    const startEditingTakeItem = (index, currentText) => {
        setEditingTakeItemIndex(index);
        setEditingTakeItemText(currentText);
    };

    const saveEditingTakeItem = () => {
        if (editingTakeItemIndex !== null && editingTakeItemText.trim()) {
            const updated = [...takeListDraft];
            updated[editingTakeItemIndex] = { ...updated[editingTakeItemIndex], label: editingTakeItemText.trim() };
            setTakeListDraft(updated);
            setEditingTakeItemIndex(null);
            setEditingTakeItemText('');
        }
    };

    const cancelEditingTakeItem = () => {
        setEditingTakeItemIndex(null);
        setEditingTakeItemText('');
    };

    const addTakeListItem = () => {
        if (newTakeListItem.trim()) {
            setTakeListDraft([...takeListDraft, { label: newTakeListItem.trim(), done: false }]);
            setNewTakeListItem('');
        }
    };

    const removeTakeListItem = (index) => {
        setTakeListDraft(takeListDraft.filter((_, i) => i !== index));
    };

    const saveTakeList = async () => {
        if (!takeListJob) return;
        setSavingTakeList(true);
        try {
            if (takeListJob.__type === 'repair') {
                await axios.put(`${API_URL}/repairs/${takeListJob._id}/install-take-list`, {
                    installTakeList: takeListDraft
                }, config);
            } else {
                await axios.put(`${API_URL}/orders/${takeListJob._id}/install-take-list`, {
                    installTakeList: takeListDraft
                }, config);
            }
            setSavingTakeList(false);
            closeTakeList();
            fetchJobs();
        } catch (e) {
            console.error(e);
            setSavingTakeList(false);
            alert(t('error_saving_checklist') || 'Error saving checklist');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <div className={`min-h-screen dark:bg-slate-950 bg-white dark:text-slate-100 text-gray-900 pb-20 ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header with Logo and Hamburger Menu */}
            <div className="sticky top-0 z-40 dark:bg-slate-900 bg-white border-b dark:border-slate-800 border-gray-200 px-4 py-3 flex items-center justify-between mb-4">
                <img src="/logo.jpg" alt="Dynamica" className="h-14 object-contain" />
                <div className="flex items-center gap-2">
                    <button onClick={fetchJobs} className="dark:bg-slate-800 bg-gray-100 p-2 rounded-full dark:text-slate-400 text-gray-600 active:scale-95">
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="dark:bg-slate-800 bg-gray-100 p-2 rounded-full dark:text-slate-400 text-gray-600 active:scale-95"
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {/* Hamburger Menu Dropdown */}
            {isMenuOpen && (
                <div className={`fixed top-16 ${isRTL ? 'left-4' : 'right-4'} z-50 dark:bg-slate-900 bg-white border dark:border-slate-800 border-gray-200 rounded-xl shadow-2xl p-2 min-w-[200px]`}>
                    <button
                        onClick={() => {
                            navigate('/calendar');
                            setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:dark:bg-slate-800 hover:bg-gray-100 dark:text-white text-gray-900 transition ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                        <Calendar size={20} />
                        <span>{t('sidebar_calendar')}</span>
                    </button>
                    <button
                        onClick={() => {
                            setShowProfile(true);
                            setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:dark:bg-slate-800 hover:bg-gray-100 dark:text-white text-gray-900 transition ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                        <Settings size={20} />
                        <span>{t('settings')}</span>
                    </button>
                </div>
            )}

            {/* Settings Modal */}
            {showProfile && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="dark:bg-slate-900 bg-white w-full max-w-md rounded-2xl border dark:border-slate-700 border-gray-200 shadow-2xl p-6">
                        <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-between items-center mb-6`}>
                            <h3 className="text-xl font-bold dark:text-white text-gray-900">{t('settings')}</h3>
                            <button onClick={() => setShowProfile(false)} className="dark:text-slate-400 text-gray-600 hover:dark:text-white hover:text-gray-900">
                                <X size={24} />
                            </button>
                        </div>

                        {/* User Info Section */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-xs dark:text-slate-400 text-gray-600 block mb-1">{t('name')}</label>
                                <div className="dark:text-white text-gray-900 font-medium">{user?.name || '-'}</div>
                            </div>
                            <div>
                                <label className="text-xs dark:text-slate-400 text-gray-600 block mb-1">{t('email')}</label>
                                <div className="dark:text-white text-gray-900 font-medium">{user?.email || '-'}</div>
                            </div>
                            <div>
                                <label className="text-xs dark:text-slate-400 text-gray-600 block mb-1">{t('phone')}</label>
                                <div className="dark:text-white text-gray-900 font-medium">{user?.phone || '-'}</div>
                            </div>
                            <div>
                                <label className="text-xs dark:text-slate-400 text-gray-600 block mb-1">{t('role')}</label>
                                <div className="dark:text-white text-gray-900 font-medium">{t(`role_${user?.role}`) || user?.role || '-'}</div>
                            </div>
                        </div>

                        {/* Display Mode Section */}
                        <div className="mb-6">
                            <h4 className="text-sm font-bold dark:text-white text-gray-900 mb-3 flex items-center gap-2">
                                <Moon size={16} /> {t('display_mode')}
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => changeDarkMode('light')}
                                    className={`px-4 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${darkMode === 'light'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold'
                                        : 'border-gray-300 dark:border-slate-700 dark:bg-slate-800 bg-white dark:text-white text-gray-900 hover:border-blue-300 dark:hover:border-blue-600'
                                        }`}
                                >
                                    <Sun size={20} />
                                    <span className="text-xs">{t('light_mode')}</span>
                                </button>
                                <button
                                    onClick={() => changeDarkMode('dark')}
                                    className={`px-4 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${darkMode === 'dark'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold'
                                        : 'border-gray-300 dark:border-slate-700 dark:bg-slate-800 bg-white dark:text-white text-gray-900 hover:border-blue-300 dark:hover:border-blue-600'
                                        }`}
                                >
                                    <Moon size={20} />
                                    <span className="text-xs">{t('dark_mode')}</span>
                                </button>
                                <button
                                    onClick={() => changeDarkMode('auto')}
                                    className={`px-4 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${darkMode === 'auto'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold'
                                        : 'border-gray-300 dark:border-slate-700 dark:bg-slate-800 bg-white dark:text-white text-gray-900 hover:border-blue-300 dark:hover:border-blue-600'
                                        }`}
                                >
                                    <Monitor size={20} />
                                    <span className="text-xs">{t('auto_mode')}</span>
                                </button>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} mt-6 pt-6 border-t dark:border-slate-800 border-gray-200`}>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold inline-flex items-center gap-2"
                            >
                                <LogOut size={18} /> {t('logout')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Close menu when clicking outside */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}

            <div className="p-4">
                <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-between items-center mb-6`}>
                    <h2 className="text-2xl font-bold dark:text-white text-gray-900">{t('my_tasks')}</h2>
                </div>

                <div className={`flex gap-2 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <button
                        type="button"
                        onClick={() => setRange('today')}
                        className={`px-4 py-2 rounded-2xl text-sm font-bold border transition ${range === 'today' ? 'bg-blue-600 text-white border-blue-500' : 'dark:bg-slate-900 bg-gray-100 dark:text-slate-300 text-gray-700 dark:border-slate-800 border-gray-300'
                            }`}
                    >
                        {t('today') || 'Today'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setRange('tomorrow')}
                        className={`px-4 py-2 rounded-2xl text-sm font-bold border transition ${range === 'tomorrow' ? 'bg-blue-600 text-white border-blue-500' : 'dark:bg-slate-900 bg-gray-100 dark:text-slate-300 text-gray-700 dark:border-slate-800 border-gray-300'
                            }`}
                    >
                        {t('tomorrow') || 'Tomorrow'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setRange('week')}
                        className={`px-4 py-2 rounded-2xl text-sm font-bold border transition ${range === 'week' ? 'bg-blue-600 text-white border-blue-500' : 'dark:bg-slate-900 bg-gray-100 dark:text-slate-300 text-gray-700 dark:border-slate-800 border-gray-300'
                            }`}
                    >
                        {t('next_7_days') || 'Next 7 days'}
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center mt-20 dark:text-slate-400 text-gray-600">
                        <Loader className="animate-spin mb-4" size={32} />
                        <p>{t('loading')}</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className={`text-center dark:text-slate-500 text-gray-600 mt-20 dark:bg-slate-900/50 bg-gray-50 p-8 rounded-3xl border dark:border-slate-800 border-gray-200`}>
                        <CheckCircle className="mx-auto mb-4 dark:text-slate-600 text-gray-400" size={48} />
                        <p className="text-lg font-medium">{t('no_installs')}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {jobs.map(job => {
                            // Check for Master Plan
                            const masterPlan = job.files && job.files.find(f => f.type === 'master_plan');
                            const overdue = isOverdue(job);

                            return (
                                <div key={job._id} className={`dark:bg-slate-900 bg-white rounded-3xl p-6 shadow-xl border relative overflow-hidden ${overdue ? 'border-red-600 dark:bg-red-950/20 bg-red-50' : 'dark:border-slate-800 border-gray-200'}`}>

                                    {/* --- MASTER PLAN BANNER (THE NEW PART) --- */}
                                    {masterPlan && (
                                        <button
                                            type="button"
                                            onClick={() => setPreviewUrl(masterPlan.url)}
                                            className={`w-full block bg-indigo-600 hover:bg-indigo-500 text-white p-5 rounded-2xl mb-6 text-center font-bold shadow-lg shadow-indigo-900/40 border border-indigo-400 flex items-center justify-center gap-3 active:scale-95 transition ${isRTL ? 'flex-row-reverse' : ''}`}
                                        >
                                            <FileText size={24} />
                                            <span className="text-xl">{t('view_master_plan')}</span>
                                        </button>
                                    )}

                                    <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 text-white text-xs font-bold px-4 py-1.5 ${isRTL ? 'rounded-br-2xl' : 'rounded-bl-2xl'} ${overdue ? 'bg-red-600' : 'bg-blue-600'}`}>
                                        {overdue ? (t('overdue') || 'OVERDUE') : (range === 'today' ? (t('today') || 'TODAY') : range === 'tomorrow' ? (t('tomorrow') || 'TOMORROW') : (t('next_7_days') || 'NEXT 7 DAYS'))}
                                    </div>

                                    <h3 className={`text-xl font-bold dark:text-white text-gray-900 mb-1 ${isRTL ? 'pl-12' : 'pr-12'}`}>{job.clientName}</h3>
                                    {job.__type === 'repair' && (
                                        <div className="text-xs font-bold text-amber-600 dark:text-amber-300 mb-2">{t('repairs')}</div>
                                    )}

                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.clientAddress || '')}`}
                                        target="_blank" rel="noreferrer"
                                        className={`text-blue-600 dark:text-blue-400 text-sm mb-6 flex items-center gap-2 underline underline-offset-4 ${isRTL ? 'flex-row-reverse' : ''}`}
                                    >
                                        <MapPin size={16} /> {job.clientAddress}
                                    </a>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.clientAddress || '')}`}
                                            target="_blank" rel="noreferrer"
                                            className="dark:bg-slate-800 bg-gray-100 hover:dark:bg-slate-700 hover:bg-gray-200 text-blue-600 dark:text-blue-400 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition active:scale-95 border dark:border-slate-700 border-gray-300"
                                        >
                                            <MapPin /> {t('google_maps') || 'Google Maps'}
                                        </a>
                                        <a
                                            href={`tel:${job.clientPhone}`}
                                            className="dark:bg-slate-800 bg-gray-100 hover:dark:bg-slate-700 hover:bg-gray-200 text-emerald-600 dark:text-emerald-400 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition active:scale-95 border dark:border-slate-700 border-gray-300"
                                        >
                                            <Phone /> {t('call') || 'Call'}
                                        </a>
                                    </div>

                                    {/* Installation checklist (collapsed -> modal) */}
                                    <button
                                        type="button"
                                        onClick={() => openTakeList(job)}
                                        className={`w-full mb-4 dark:bg-slate-800 bg-gray-100 hover:dark:bg-slate-700 hover:bg-gray-200 dark:text-white text-gray-900 py-3 rounded-2xl font-bold text-sm border dark:border-slate-700 border-gray-300 inline-flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                                    >
                                        <ClipboardList size={18} /> {t('what_to_take') || 'Installation checklist'} {Array.isArray(job.installTakeList) && job.installTakeList.length > 0 && `(${job.installTakeList.length})`}
                                    </button>

                                    {/* Existing Photos Gallery */}
                                    {job.files && job.files.filter(f => f.type !== 'master_plan').length > 0 && (
                                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                            {job.files.filter(f => f.type !== 'master_plan').map((file, idx) => (
                                                <a key={idx} href={file.url} target="_blank" rel="noreferrer" className="block w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-slate-600 shadow-sm">
                                                    <img src={file.url} alt="proof" className="w-full h-full object-cover" />
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upload & Finish */}
                                    <div className="dark:bg-black/20 bg-gray-50 rounded-2xl p-4 border dark:border-white/5 border-gray-200">
                                        <label className={`block w-full dark:bg-slate-800 bg-gray-100 border-2 border-dashed dark:border-slate-600 border-gray-300 active:border-blue-500 dark:text-slate-400 text-gray-700 py-4 rounded-xl text-center cursor-pointer transition mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                            {uploadingId === job._id ? (
                                                <span className={`flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 ${isRTL ? 'flex-row-reverse' : ''}`}><Loader className="animate-spin" /> {t('uploading')}</span>
                                            ) : (
                                                <span className={`flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}><Camera /> {t('upload_proof')}</span>
                                            )}
                                            <input type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={(e) => handleFileUpload(e, job)} />
                                        </label>

                                        <button
                                            onClick={() => finishJob(job)}
                                            className={`w-full bg-emerald-600 active:bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition ${isRTL ? 'flex-row-reverse' : ''}`}
                                        >
                                            <CheckCircle /> {t('finish_job')}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setNoteOrderId(job._id)}
                                            className={`w-full mt-3 dark:bg-slate-800 bg-gray-100 hover:dark:bg-slate-700 hover:bg-gray-200 dark:text-white text-gray-900 py-3 rounded-xl font-bold text-sm border dark:border-slate-700 border-gray-300 ${isRTL ? 'flex-row-reverse' : ''}`}
                                        >
                                            {t('add_note')}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {noteOrderId && (
                    <NoteModal
                        orderId={noteOrderId}
                        stage="installation"
                        onClose={() => setNoteOrderId(null)}
                        onSaved={fetchJobs}
                    />
                )}

                {previewUrl && (
                    <MasterPlanPreviewModal
                        url={previewUrl}
                        title={t('master_plan')}
                        onClose={() => setPreviewUrl('')}
                    />
                )}

                {takeListJob && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="dark:bg-slate-900 bg-white w-full max-w-lg rounded-2xl border dark:border-slate-700 border-gray-200 shadow-2xl flex flex-col max-h-[90vh]">
                            <div className={`p-5 border-b dark:border-slate-800 border-gray-200 flex ${isRTL ? 'flex-row-reverse' : ''} justify-between items-center flex-shrink-0`}>
                                <div>
                                    <h3 className="text-lg font-bold dark:text-white text-gray-900">{t('install_checklist_title')}</h3>
                                    <p className="text-xs dark:text-slate-400 text-gray-600 mt-1">{takeListJob.clientName}</p>
                                </div>
                                <button type="button" onClick={closeTakeList} className="dark:text-slate-400 text-gray-600 hover:dark:text-white hover:text-gray-900">
                                    <X />
                                </button>
                            </div>

                            <div className="p-5 space-y-2 overflow-y-auto flex-1 min-h-0">
                                {takeListDraft.length === 0 ? (
                                    <div className="dark:text-slate-500 text-gray-600 text-sm">{t('no_checklist_items')}</div>
                                ) : (
                                    takeListDraft.map((it, idx) => (
                                        <div key={`${it.label}-${idx}`} className={`flex items-center gap-3 dark:bg-slate-950/40 bg-gray-50 border dark:border-slate-800 border-gray-200 rounded-xl px-3 py-2 text-sm dark:text-slate-200 text-gray-900 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                            <input
                                                type="checkbox"
                                                className="accent-emerald-500"
                                                checked={Boolean(it.done)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setTakeListDraft((prev) => prev.map((p, i) => (i === idx ? { ...p, done: checked } : p)));
                                                }}
                                            />
                                            {editingTakeItemIndex === idx ? (
                                                <div className={`flex-1 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                    <input
                                                        type="text"
                                                        value={editingTakeItemText}
                                                        onChange={(e) => setEditingTakeItemText(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                saveEditingTakeItem();
                                                            } else if (e.key === 'Escape') {
                                                                cancelEditingTakeItem();
                                                            }
                                                        }}
                                                        className="flex-1 dark:bg-slate-800 bg-white border dark:border-slate-600 border-gray-300 rounded-lg px-3 py-1.5 dark:text-white text-gray-900 text-sm"
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={saveEditingTakeItem}
                                                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                                                        title={t('save')}
                                                    >
                                                        <Save size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={cancelEditingTakeItem}
                                                        className="dark:text-slate-400 text-gray-600 hover:dark:text-slate-300 hover:text-gray-900"
                                                        title={t('cancel')}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className={`flex-1 ${it.done ? 'line-through dark:text-slate-500 text-gray-500' : ''}`}>{it.label}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditingTakeItem(idx, it.label)}
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                                        title={t('edit')}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTakeListItem(idx)}
                                                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                                        title={t('remove')}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-5 border-t dark:border-slate-800 border-gray-200 flex-shrink-0 space-y-2">
                                <input
                                    type="text"
                                    value={newTakeListItem}
                                    onChange={(e) => setNewTakeListItem(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            addTakeListItem();
                                        }
                                    }}
                                    placeholder={t('add_new_item')}
                                    className="w-full dark:bg-slate-800 bg-white border dark:border-slate-600 border-gray-300 rounded-lg px-3 py-2 dark:text-white text-gray-900 placeholder:dark:text-slate-500 placeholder:text-gray-500 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={addTakeListItem}
                                    className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold inline-flex items-center justify-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
                                >
                                    <Plus size={16} /> {t('add')}
                                </button>
                            </div>

                            <div className={`p-5 border-t dark:border-slate-800 border-gray-200 flex ${isRTL ? 'justify-start' : 'justify-end'} gap-3 flex-shrink-0`}>
                                <button type="button" onClick={closeTakeList} className="px-4 py-2 dark:text-slate-400 text-gray-600 hover:dark:text-white hover:text-gray-900">
                                    {t('close')}
                                </button>
                                <button
                                    type="button"
                                    onClick={saveTakeList}
                                    disabled={savingTakeList}
                                    className={`px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                                >
                                    <Save size={18} /> {savingTakeList ? t('saving') : t('save')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstallerApp;