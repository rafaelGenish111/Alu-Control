import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, MapPin, Phone, Mail, Package, FileText, CheckCircle,
  Loader, Image as ImageIcon,
  FileCheck, UploadCloud, ExternalLink, MessageSquare, ClipboardList, Plus, Trash2, Save, Edit2, Calendar
} from 'lucide-react';
import { API_URL } from '../config/api';
import MasterPlanPreviewModal from '../components/MasterPlanPreviewModal';

const ClientCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteStage, setNoteStage] = useState('general');
  const [takeListDraft, setTakeListDraft] = useState([]);
  const [newTakeItem, setNewTakeItem] = useState('');
  const [savingTakeList, setSavingTakeList] = useState(false);
  const [editingProducts, setEditingProducts] = useState(false);
  const [productsDraft, setProductsDraft] = useState([]);
  const [savingProducts, setSavingProducts] = useState(false);
  const [editingMaterials, setEditingMaterials] = useState(false);
  const [materialsDraft, setMaterialsDraft] = useState([]);
  const [savingMaterials, setSavingMaterials] = useState(false);
  const [suppliersList, setSuppliersList] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [editingClient, setEditingClient] = useState(false);
  const [clientDraft, setClientDraft] = useState({ clientName: '', clientPhone: '', clientEmail: '', clientAddress: '' });
  const [savingClient, setSavingClient] = useState(false);
  const [editingOrderGeneral, setEditingOrderGeneral] = useState(false);
  const [orderGeneralDraft, setOrderGeneralDraft] = useState({ manualOrderNumber: '', estimatedInstallationDays: 1, depositPaid: false, depositPaidAt: '', region: '' });
  const [savingOrderGeneral, setSavingOrderGeneral] = useState(false);
  const [editingInstallers, setEditingInstallers] = useState(false);
  const [installersDraft, setInstallersDraft] = useState({ installerIds: [], startDate: '', endDate: '' });
  const [savingInstallers, setSavingInstallers] = useState(false);
  const [installersList, setInstallersList] = useState([]);
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const token = user?.token;
  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/${id}`, config);
      setOrder(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [config, id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (!order) return;
    const existing = Array.isArray(order.installTakeList) ? order.installTakeList : [];
    if (existing.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTakeListDraft(existing);
      return;
    }
    // Start empty – user adds items as needed
    setTakeListDraft([]);
  }, [order]);

  useEffect(() => {
    if (!order) return;
    const existing = Array.isArray(order.products) ? order.products : [];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProductsDraft(existing);
  }, [order]);

  useEffect(() => {
    if (!order) return;
    const existing = Array.isArray(order.materials) ? order.materials : [];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMaterialsDraft(existing);
  }, [order]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(`${API_URL}/suppliers`, config);
        setSuppliersList(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSuppliers();
  }, [config]);

  useEffect(() => {
    const fetchInstallers = async () => {
      try {
        const res = await axios.get(`${API_URL}/orders/install/team-list`, config);
        setInstallersList(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchInstallers();
  }, [config]);

  useEffect(() => {
    if (!order) return;
    setClientDraft({
      clientName: order.clientName || '',
      clientPhone: order.clientPhone || '',
      clientEmail: order.clientEmail || '',
      clientAddress: order.clientAddress || ''
    });
    setOrderGeneralDraft({
      manualOrderNumber: order.manualOrderNumber || '',
      estimatedInstallationDays: order.estimatedInstallationDays || 1,
      depositPaid: order.depositPaid || false,
      depositPaidAt: order.depositPaidAt ? new Date(order.depositPaidAt).toISOString().slice(0, 10) : '',
      region: order.region || ''
    });
    const installerIds = Array.isArray(order.installers) ? order.installers.map(i => typeof i === 'string' ? i : i._id) : [];
    setInstallersDraft({
      installerIds,
      startDate: order.installDateStart ? new Date(order.installDateStart).toISOString().slice(0, 10) : '',
      endDate: order.installDateEnd ? new Date(order.installDateEnd).toISOString().slice(0, 10) : ''
    });
  }, [order]);

  const addNote = async () => {
    if (!noteText.trim()) return;
    try {
      await axios.post(`${API_URL}/orders/${id}/notes`, { stage: noteStage, text: noteText }, config);
      setNoteText('');
      setNoteStage('general');
      fetchOrder();
    } catch (e) {
      console.error(e);
      alert('Error saving note');
    }
  };

  const saveTakeList = async () => {
    setSavingTakeList(true);
    try {
      await axios.put(`${API_URL}/orders/${id}/install-take-list`, { installTakeList: takeListDraft }, config);
      setSavingTakeList(false);
      fetchOrder();
    } catch (e) {
      console.error(e);
      setSavingTakeList(false);
      alert('Error saving installation checklist');
    }
  };

  const saveProducts = async () => {
    setSavingProducts(true);
    try {
      await axios.put(`${API_URL}/orders/${id}/products`, { products: productsDraft }, config);
      setSavingProducts(false);
      setEditingProducts(false);
      fetchOrder();
    } catch (e) {
      console.error(e);
      setSavingProducts(false);
      alert('Error saving products');
    }
  };

  const saveMaterials = async () => {
    setSavingMaterials(true);
    try {
      await axios.put(`${API_URL}/orders/${id}/materials`, { materials: materialsDraft }, config);
      setSavingMaterials(false);
      setEditingMaterials(false);
      fetchOrder();
    } catch (e) {
      console.error(e);
      setSavingMaterials(false);
      alert('Error saving materials');
    }
  };

  const saveClientDetails = async () => {
    setSavingClient(true);
    try {
      await axios.put(`${API_URL}/orders/${id}/client`, clientDraft, config);
      setSavingClient(false);
      setEditingClient(false);
      fetchOrder();
    } catch (e) {
      console.error(e);
      setSavingClient(false);
      alert(t('error_updating_status'));
    }
  };

  const saveOrderGeneral = async () => {
    setSavingOrderGeneral(true);
    try {
      await axios.put(`${API_URL}/orders/${id}`, orderGeneralDraft, config);
      setSavingOrderGeneral(false);
      setEditingOrderGeneral(false);
      fetchOrder();
    } catch (e) {
      console.error(e);
      setSavingOrderGeneral(false);
      alert(t('error_updating_status'));
    }
  };

  const saveInstallers = async () => {
    setSavingInstallers(true);
    try {
      await axios.put(`${API_URL}/orders/${id}/installers`, installersDraft, config);
      setSavingInstallers(false);
      setEditingInstallers(false);
      fetchOrder();
    } catch (e) {
      console.error(e);
      setSavingInstallers(false);
      alert(t('error_updating_status'));
    }
  };

  const cancelOrder = async () => {
    if (!window.confirm(t('cancel_order_confirm') || 'Cancel this order?')) return;
    try {
      await axios.put(`${API_URL}/orders/${id}/status`, { status: 'cancelled' }, config);
      fetchOrder();
    } catch (e) {
      console.error(e);
      alert(t('error_updating_status'));
    }
  };

  const toggleInstaller = (installerId) => {
    const current = installersDraft.installerIds;
    if (current.includes(installerId)) {
      setInstallersDraft({ ...installersDraft, installerIds: current.filter(i => i !== installerId) });
    } else {
      setInstallersDraft({ ...installersDraft, installerIds: [...current, installerId] });
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingType(type);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      await axios.put(`${API_URL}/orders/${id}/files`, {
        url: uploadRes.data.url,
        type: type,
        name: file.name
      }, config);

      setUploadingType(null);
      alert(type === 'master_plan' ? t('plan_updated') : t('file_uploaded'));
      fetchOrder();
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || t('upload_error');
      alert(errorMessage);
      setUploadingType(null);
    }
  };

  if (loading) return <div className="dark:text-white text-gray-900 p-8">{t('loading')}</div>;
  if (!order) return <div className="dark:text-white text-gray-900 p-8">{t('order_not_found') || 'Order not found'}</div>;

  const masterPlan = order.files && order.files.find(f => f.type === 'master_plan');
  const otherFiles = order.files ? order.files.filter(f => f.type !== 'master_plan') : [];
  const displayOrderNumber = order.manualOrderNumber || order.orderNumber || order._id;

  const managementLink = (() => {
    switch (order.status) {
      case 'materials_pending':
        return { label: 'Open pending items', path: '/procurement/pending' };
      case 'production_pending':
      case 'in_production':
      case 'production':
        return { label: 'Open production', path: '/production' };
      case 'ready_for_install':
      case 'scheduled':
        return { label: 'Open scheduling', path: '/installations' };
      case 'install':
        return { label: 'Open calendar', path: '/calendar' };
      case 'pending_approval':
        return { label: 'Open approvals', path: '/approvals' };
      case 'completed':
        return { label: 'Open completed orders', path: '/completed' };
      default:
        return null;
    }
  })();

  return (
    <div className="max-w-6xl mx-auto text-slate-100 pb-10">

      <div className="flex justify-between items-center mb-6">
        <button onClick={() => {
          // Try to go back in history, fallback to home
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/');
          }
        }} className="flex items-center gap-2 text-slate-400 hover:text-white transition">
          <ArrowLeft size={20} /> {t('back_to_list')}
        </button>

        {managementLink && (
          <button
            type="button"
            onClick={() => navigate(managementLink.path)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold border border-slate-700"
          >
            {managementLink.label}
          </button>
        )}
      </div>

      {/* Header */}
      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl mb-6 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-white">
                {editingClient ? (
                  <input
                    type="text"
                    value={clientDraft.clientName}
                    onChange={(e) => setClientDraft({ ...clientDraft, clientName: e.target.value })}
                    className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-2xl font-bold"
                  />
                ) : (
                  order.clientName
                )}
              </h1>
              {!editingClient && (
                <button
                  onClick={() => setEditingClient(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold inline-flex items-center gap-2"
                >
                  <Edit2 size={14} /> {t('edit')}
                </button>
              )}
            </div>
            {editingClient ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t('address')}</label>
                  <input
                    type="text"
                    value={clientDraft.clientAddress}
                    onChange={(e) => setClientDraft({ ...clientDraft, clientAddress: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t('phone')}</label>
                  <input
                    type="text"
                    value={clientDraft.clientPhone}
                    onChange={(e) => setClientDraft({ ...clientDraft, clientPhone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t('email')}</label>
                  <input
                    type="email"
                    value={clientDraft.clientEmail}
                    onChange={(e) => setClientDraft({ ...clientDraft, clientEmail: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveClientDetails}
                    disabled={savingClient}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2"
                  >
                    <Save size={16} /> {savingClient ? t('loading') : t('save')}
                  </button>
                  <button
                    onClick={() => {
                      setEditingClient(false);
                      setClientDraft({
                        clientName: order.clientName || '',
                        clientPhone: order.clientPhone || '',
                        clientEmail: order.clientEmail || '',
                        clientAddress: order.clientAddress || ''
                      });
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-slate-400 mt-1 flex items-center gap-2"><MapPin size={16} /> {order.clientAddress}</p>
                <p className="text-slate-400 flex items-center gap-2"><Phone size={16} /> {order.clientPhone}</p>
                {order.clientEmail && (
                  <span className="flex items-center gap-2 hover:text-blue-400 transition cursor-pointer" title="Click to email">
                    <Mail size={16} className="text-blue-500" />
                    <a href={`mailto:${order.clientEmail}`}>{order.clientEmail}</a>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="text-right ml-6">
            <div className="flex items-center gap-3 mb-2">
              {editingOrderGeneral ? (
                <input
                  type="text"
                  value={orderGeneralDraft.manualOrderNumber}
                  onChange={(e) => setOrderGeneralDraft({ ...orderGeneralDraft, manualOrderNumber: e.target.value })}
                  className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-xl"
                />
              ) : (
                <div className="text-2xl font-mono text-slate-500">#{displayOrderNumber}</div>
              )}
              {!editingOrderGeneral && (
                <button
                  onClick={() => setEditingOrderGeneral(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold inline-flex items-center gap-2"
                >
                  <Edit2 size={14} /> {t('edit')}
                </button>
              )}
            </div>
            {editingOrderGeneral ? (
              <div className="space-y-3 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t('new_est_work_days')}</label>
                  <input
                    type="number"
                    value={orderGeneralDraft.estimatedInstallationDays}
                    onChange={(e) => setOrderGeneralDraft({ ...orderGeneralDraft, estimatedInstallationDays: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t('new_region')}</label>
                  <input
                    type="text"
                    value={orderGeneralDraft.region}
                    onChange={(e) => setOrderGeneralDraft({ ...orderGeneralDraft, region: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t('deposit_paid')}</label>
                  <label className="flex items-center gap-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={orderGeneralDraft.depositPaid}
                      onChange={(e) => setOrderGeneralDraft({ ...orderGeneralDraft, depositPaid: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>{t('paid')}</span>
                  </label>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t('new_deposit_date')}</label>
                  <input
                    type="date"
                    value={orderGeneralDraft.depositPaidAt}
                    onChange={(e) => setOrderGeneralDraft({ ...orderGeneralDraft, depositPaidAt: e.target.value })}
                    disabled={!orderGeneralDraft.depositPaid}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white disabled:opacity-50"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveOrderGeneral}
                    disabled={savingOrderGeneral}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2"
                  >
                    <Save size={16} /> {savingOrderGeneral ? t('loading') : t('save')}
                  </button>
                  <button
                    onClick={() => {
                      setEditingOrderGeneral(false);
                      setOrderGeneralDraft({
                        manualOrderNumber: order.manualOrderNumber || '',
                        estimatedInstallationDays: order.estimatedInstallationDays || 1,
                        depositPaid: order.depositPaid || false,
                        depositPaidAt: order.depositPaidAt ? new Date(order.depositPaidAt).toISOString().slice(0, 10) : '',
                        region: order.region || ''
                      });
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm text-slate-400 mb-1">{t('new_est_work_days')}: {order.estimatedInstallationDays || 1}</div>
                {order.region && <div className="text-sm text-slate-400 mb-1">{t('region')}: {order.region}</div>}
                {order.depositPaidAt && <div className="text-sm text-slate-400 mb-1">{t('new_deposit_date')}: {new Date(order.depositPaidAt).toLocaleDateString()}</div>}
                <span className={`px-3 py-1 rounded text-sm uppercase font-bold border inline-block mt-2 ${order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : order.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-blue-600/20 text-blue-300 border-blue-500/30'}`}>
                  {order.status}
                </span>
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <button
                    onClick={cancelOrder}
                    className="mt-2 block w-full bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold"
                  >
                    {t('cancel_order') || 'Cancel Order'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* RIGHT COLUMN: Master Plan + Items */}
        <div className="lg:col-span-2 space-y-6">

          {/* Master Plan Card */}
          <div className="dark:bg-gradient-to-br dark:from-indigo-900 dark:to-slate-900 bg-gradient-to-br bg-indigo-50 from-indigo-50 to-blue-50 rounded-2xl border dark:border-indigo-500/50 border-indigo-300 p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><FileCheck size={100} /></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <h3 className="text-xl font-bold dark:text-white text-gray-900 flex items-center gap-2">
                  <FileCheck className="dark:text-indigo-400 text-indigo-600" /> {t('master_plan')}
                </h3>
                <p className="dark:text-indigo-200 text-indigo-700 text-sm mt-1">{t('master_plan_desc')}</p>
              </div>

              <label className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer shadow-lg transition flex items-center gap-2">
                {uploadingType === 'master_plan' ? <Loader className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                {masterPlan ? t('replace_plan') : t('upload_plan')}
                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'master_plan')} disabled={!!uploadingType} />
              </label>
            </div>

            {masterPlan ? (
              <div className="mt-6 dark:bg-slate-950/50 bg-white/80 rounded-xl p-4 flex items-center justify-between border dark:border-indigo-500/30 border-indigo-200">
                <div className="flex items-center gap-4">
                  <div className="dark:bg-indigo-500/20 bg-indigo-100 p-3 rounded-lg dark:text-indigo-300 text-indigo-700"><FileText size={24} /></div>
                  <div>
                    <p className="font-bold dark:text-white text-gray-900 truncate max-w-[200px]">{masterPlan.name}</p>
                    <p className="dark:text-slate-400 text-gray-600 text-xs">{new Date(masterPlan.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewUrl(masterPlan.url)}
                  className="bg-indigo-600 dark:bg-white dark:text-indigo-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 dark:hover:bg-indigo-50 transition"
                >
                  {t('open_plan')}
                </button>
              </div>
            ) : (
              <div className="mt-6 border-2 border-dashed dark:border-indigo-500/30 border-indigo-300 rounded-xl h-20 flex items-center justify-center dark:text-indigo-300/50 text-indigo-500/50 text-sm">
                {t('no_plan')}
              </div>
            )}
          </div>

          {/* What to take to installation */}
          <div className="dark:bg-slate-900 bg-white rounded-2xl border dark:border-slate-800 border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-bold flex items-center gap-2 text-lg dark:text-white text-gray-900">
                <ClipboardList className="text-emerald-400" /> {t('what_to_take') || 'What to take to installation'}
              </h3>
              <button
                type="button"
                onClick={saveTakeList}
                disabled={savingTakeList}
                className="dark:bg-slate-800 bg-gray-100 hover:dark:bg-slate-700 hover:bg-gray-200 disabled:opacity-50 dark:text-white text-gray-900 px-4 py-2 rounded-xl text-sm font-bold border dark:border-slate-700 border-gray-300 inline-flex items-center gap-2"
              >
                <Save size={16} /> {savingTakeList ? t('loading') : t('save')}
              </button>
            </div>

            <div className="space-y-2">
              {takeListDraft.length === 0 ? (
                <div className="dark:text-slate-500 text-gray-600 text-sm py-4 text-center border border-dashed dark:border-slate-700 border-gray-300 rounded-xl">
                  {t('no_items_yet') || 'No items yet. Add items below.'}
                </div>
              ) : (
                takeListDraft.map((it, idx) => (
                  <div key={`${it.label}-${idx}`} className="flex items-center justify-between gap-3 dark:bg-slate-950/40 bg-gray-50 border dark:border-slate-800 border-gray-200 rounded-xl px-3 py-2">
                    <label className="flex items-center gap-3 text-sm dark:text-slate-200 text-gray-900 w-full">
                      <input
                        type="checkbox"
                        className="accent-emerald-500"
                        checked={Boolean(it.done)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setTakeListDraft((prev) => prev.map((p, i) => (i === idx ? { ...p, done: checked } : p)));
                        }}
                      />
                      <span className={it.done ? 'line-through dark:text-slate-500 text-gray-500' : ''}>{it.label}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setTakeListDraft((prev) => prev.filter((_, i) => i !== idx))}
                      className="dark:text-slate-500 text-gray-600 hover:text-red-400"
                      title={t('remove')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={newTakeItem}
                onChange={(e) => setNewTakeItem(e.target.value)}
                placeholder={t('add_item') || 'Add item...'}
                className="flex-1 dark:bg-slate-800 bg-gray-50 border dark:border-slate-700 border-gray-300 rounded-xl px-4 py-2 dark:text-white text-gray-900 dark:placeholder:text-slate-500 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => {
                  const label = newTakeItem.trim();
                  if (!label) return;
                  setTakeListDraft((prev) => [...prev, { label, done: false }]);
                  setNewTakeItem('');
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold inline-flex items-center gap-2"
              >
                <Plus size={16} /> {t('add')}
              </button>
            </div>
          </div>

          {/* Products for Client Table */}
          <div className="dark:bg-slate-900 bg-white rounded-2xl border dark:border-slate-800 border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2 text-lg dark:text-white text-gray-900"><Package className="text-blue-400" /> {t('new_products_title')}</h3>
              {!editingProducts ? (
                <button
                  onClick={() => setEditingProducts(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2"
                >
                  <Edit2 size={16} /> {t('edit')}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingProducts(false);
                      const existing = Array.isArray(order.products) ? order.products : [];
                      setProductsDraft(existing);
                    }}
                    className="dark:bg-slate-700 bg-gray-200 hover:dark:bg-slate-600 hover:bg-gray-300 dark:text-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={saveProducts}
                    disabled={savingProducts}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2"
                  >
                    <Save size={16} /> {savingProducts ? t('loading') : t('save')}
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className={`w-full text-sm dark:text-slate-300 text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <thead className="text-xs uppercase dark:bg-slate-800/50 bg-gray-100 dark:text-slate-400 text-gray-600">
                  <tr>
                    <th className="p-3">{t('new_col_type')}</th>
                    <th className="p-3">{t('new_col_desc')}</th>
                    <th className="p-3">{t('qty')}</th>
                    {editingProducts && <th className="p-3">{t('actions')}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800/50 divide-gray-200">
                  {productsDraft.length === 0 ? (
                    <tr>
                      <td colSpan={editingProducts ? 4 : 3} className={`p-4 ${isRTL ? 'text-right' : 'text-center'} dark:text-slate-500 text-gray-600`}>{t('no_products') || 'No products'}</td>
                    </tr>
                  ) : (
                    productsDraft.map((product, i) => (
                      <tr key={i}>
                        <td className="p-3">
                          {editingProducts ? (
                            <input
                              type="text"
                              value={product.type || ''}
                              onChange={(e) => {
                                const updated = [...productsDraft];
                                updated[i] = { ...updated[i], type: e.target.value };
                                setProductsDraft(updated);
                              }}
                              className="w-full dark:bg-slate-800 bg-gray-50 border dark:border-slate-600 border-gray-300 rounded-lg px-3 py-2 dark:text-white text-gray-900 text-sm"
                            />
                          ) : (
                            <span className="font-medium dark:text-white text-gray-900">{product.type || '-'}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {editingProducts ? (
                            <input
                              type="text"
                              value={product.description || ''}
                              onChange={(e) => {
                                const updated = [...productsDraft];
                                updated[i] = { ...updated[i], description: e.target.value };
                                setProductsDraft(updated);
                              }}
                              className="w-full dark:bg-slate-800 bg-gray-50 border dark:border-slate-600 border-gray-300 rounded-lg px-3 py-2 dark:text-white text-gray-900 text-sm"
                            />
                          ) : (
                            <span className="dark:text-slate-300 text-gray-700">{product.description || '-'}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {editingProducts ? (
                            <input
                              type="number"
                              value={product.quantity || 1}
                              onChange={(e) => {
                                const updated = [...productsDraft];
                                updated[i] = { ...updated[i], quantity: parseInt(e.target.value) || 1 };
                                setProductsDraft(updated);
                              }}
                              className="w-full dark:bg-slate-800 bg-gray-50 border dark:border-slate-600 border-gray-300 rounded-lg px-3 py-2 dark:text-white text-gray-900 text-sm"
                              min="1"
                            />
                          ) : (
                            <span className="dark:text-slate-300 text-gray-700">{product.quantity || 1}</span>
                          )}
                        </td>
                        {editingProducts && (
                          <td className="p-3">
                            <button
                              onClick={() => {
                                setProductsDraft(productsDraft.filter((_, idx) => idx !== i));
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {editingProducts && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setProductsDraft([...productsDraft, { type: '', description: '', quantity: 1 }]);
                    }}
                    className="dark:bg-slate-800 bg-gray-100 hover:dark:bg-slate-700 hover:bg-gray-200 dark:text-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2"
                  >
                    <Plus size={16} /> {t('add_product') || 'Add Product'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Items Table (Materials) */}
          <div className="dark:bg-slate-900 bg-white rounded-2xl border dark:border-slate-800 border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2 text-lg dark:text-white text-gray-900"><Package className="text-blue-400" /> {t('items')}</h3>
              {!editingMaterials ? (
                <button
                  onClick={() => setEditingMaterials(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2"
                >
                  <Edit2 size={16} /> {t('edit')}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingMaterials(false);
                      const existing = Array.isArray(order.materials) ? order.materials : [];
                      setMaterialsDraft(existing);
                    }}
                    className="dark:bg-slate-700 bg-gray-200 hover:dark:bg-slate-600 hover:bg-gray-300 dark:text-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={saveMaterials}
                    disabled={savingMaterials}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2"
                  >
                    <Save size={16} /> {savingMaterials ? t('loading') : t('save')}
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className={`w-full text-sm dark:text-slate-300 text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <thead className="text-xs uppercase dark:bg-slate-800/50 bg-gray-100 dark:text-slate-400 text-gray-600">
                  <tr>
                    <th className="p-3">{t('product') || t('new_mat_glass')}</th>
                    <th className="p-3">{t('description') || t('new_col_desc')}</th>
                    <th className="p-3">{t('supplier') || t('new_select_supplier')}</th>
                    <th className="p-3">{t('qty')}</th>
                    {editingMaterials && <th className="p-3">{t('actions')}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800/50 divide-gray-200">
                  {materialsDraft.length === 0 ? (
                    <tr>
                      <td colSpan={editingMaterials ? 5 : 4} className={`p-4 ${isRTL ? 'text-right' : 'text-center'} dark:text-slate-500 text-gray-600`}>{t('no_materials') || 'No materials'}</td>
                    </tr>
                  ) : (
                    materialsDraft.map((item, i) => {
                      const productLabel = item.materialType || item.productType || item.type || '-';
                      const supplierLabel = item.supplier || '-';
                      const isOrdered = typeof item.isOrdered === 'boolean' ? item.isOrdered : false;

                      return (
                        <tr key={i}>
                          <td className="p-3">
                            {editingMaterials ? (
                              <select
                                value={item.materialType || ''}
                                onChange={(e) => {
                                  const updated = [...materialsDraft];
                                  updated[i] = { ...updated[i], materialType: e.target.value };
                                  setMaterialsDraft(updated);
                                }}
                                className="w-full dark:bg-slate-800 bg-gray-50 border dark:border-slate-600 border-gray-300 rounded-lg px-3 py-2 dark:text-white text-gray-900 text-sm"
                              >
                                <option value="Glass">{t('new_mat_glass')}</option>
                                <option value="Aluminum">{t('new_mat_aluminum')}</option>
                                <option value="Paint">{t('new_mat_paint')}</option>
                                <option value="Hardware">{t('new_mat_hardware')}</option>
                                <option value="PVC">{t('new_mat_pvc')}</option>
                                <option value="Other">{t('new_mat_other')}</option>
                              </select>
                            ) : (
                              <span className="font-medium dark:text-white text-gray-900">{productLabel}</span>
                            )}
                          </td>
                          <td className="p-3">
                            {editingMaterials ? (
                              <input
                                type="text"
                                value={item.description || ''}
                                onChange={(e) => {
                                  const updated = [...materialsDraft];
                                  updated[i] = { ...updated[i], description: e.target.value };
                                  setMaterialsDraft(updated);
                                }}
                                className="w-full dark:bg-slate-800 bg-gray-50 border dark:border-slate-600 border-gray-300 rounded-lg px-3 py-2 dark:text-white text-gray-900 text-sm"
                              />
                            ) : (
                              <span className="dark:text-slate-300 text-gray-700">{item.description || '-'}</span>
                            )}
                          </td>
                          <td className="p-3">
                            {editingMaterials ? (
                              <select
                                value={item.supplier || ''}
                                onChange={(e) => {
                                  const updated = [...materialsDraft];
                                  updated[i] = { ...updated[i], supplier: e.target.value };
                                  setMaterialsDraft(updated);
                                }}
                                className="w-full dark:bg-slate-800 bg-gray-50 border dark:border-slate-600 border-gray-300 rounded-lg px-3 py-2 dark:text-white text-gray-900 text-sm"
                              >
                                <option value="">{t('new_select_supplier')}</option>
                                {suppliersList.map(s => (
                                  <option key={s._id} value={s.name}>{s.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="dark:text-blue-300 text-blue-600">{supplierLabel}</span>
                            )}
                          </td>
                          <td className="p-3">
                            {editingMaterials ? (
                              <input
                                type="number"
                                value={item.quantity || 1}
                                onChange={(e) => {
                                  const updated = [...materialsDraft];
                                  updated[i] = { ...updated[i], quantity: parseInt(e.target.value) || 1 };
                                  setMaterialsDraft(updated);
                                }}
                                className="w-full dark:bg-slate-800 bg-gray-50 border dark:border-slate-600 border-gray-300 rounded-lg px-3 py-2 dark:text-white text-gray-900 text-sm"
                                min="1"
                              />
                            ) : (
                              <span className="dark:text-slate-300 text-gray-700">{item.quantity || 1}</span>
                            )}
                          </td>
                          {editingMaterials && (
                            <td className="p-3">
                              <button
                                onClick={() => {
                                  setMaterialsDraft(materialsDraft.filter((_, idx) => idx !== i));
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              {editingMaterials && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setMaterialsDraft([...materialsDraft, { materialType: 'Glass', description: '', supplier: '', quantity: 1 }]);
                    }}
                    className="dark:bg-slate-800 bg-gray-100 hover:dark:bg-slate-700 hover:bg-gray-200 dark:text-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2"
                  >
                    <Plus size={16} /> {t('add_material') || 'Add Material'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Notes */}
          <div className="dark:bg-slate-900 bg-white rounded-2xl border dark:border-slate-800 border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2 text-lg dark:text-white text-gray-900"><MessageSquare className="text-cyan-400" /> {t('notes')}</h3>
            </div>

            <div className="space-y-3 mb-5">
              {(order.notes || []).length === 0 ? (
                <div className="dark:text-slate-500 text-gray-600 text-sm">{t('no_notes')}</div>
              ) : (
                (order.notes || []).slice().reverse().map((n, idx) => (
                  <div key={idx} className="dark:bg-slate-950/30 bg-gray-50 border dark:border-slate-800 border-gray-200 rounded-xl p-4">
                    <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-between items-center text-xs dark:text-slate-500 text-gray-600 mb-2`}>
                      <span className="uppercase">{n.stage || 'general'}</span>
                      <span>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</span>
                    </div>
                    <div className="dark:text-slate-200 text-gray-900 text-sm whitespace-pre-wrap">{n.text}</div>
                    <div className="text-xs dark:text-slate-500 text-gray-600 mt-2">{t('by') || 'by'} {n.createdBy || t('system') || 'System'}</div>
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-1">
                <label className="text-xs dark:text-slate-400 text-gray-600 block mb-1">{t('stage')}</label>
                <select
                  className="w-full dark:bg-slate-800 bg-gray-50 border dark:border-slate-600 border-gray-300 rounded-lg p-2 dark:text-white text-gray-900 text-sm"
                  value={noteStage}
                  onChange={(e) => setNoteStage(e.target.value)}
                >
                  <option value="general">{t('general') || 'General'}</option>
                  <option value="order">{t('order_col')}</option>
                  <option value="procurement">{t('procurement') || 'Procurement'}</option>
                  <option value="production">{t('production') || 'Production'}</option>
                  <option value="scheduling">{t('scheduling') || 'Scheduling'}</option>
                  <option value="installation">{t('installation') || 'Installation'}</option>
                  <option value="approval">{t('approval') || 'Approval'}</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="text-xs dark:text-slate-400 text-gray-600 block mb-1">{t('add_note')}</label>
                <textarea
                  className="w-full dark:bg-slate-800 bg-gray-50 border dark:border-slate-600 border-gray-300 rounded-lg p-2 dark:text-white text-gray-900 text-sm"
                  rows="3"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={t('write_note_placeholder')}
                />
              </div>
            </div>

            <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} mt-4`}>
              <button
                type="button"
                onClick={addNote}
                disabled={!noteText.trim()}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl font-bold"
              >
                {t('save')} {t('note') || t('notes')}
              </button>
            </div>
          </div>
        </div>

        {/* LEFT COLUMN: Installation Details + Gallery */}
        <div className="space-y-6">
          {/* Installation Details */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2 text-lg"><Calendar className="text-blue-400" /> {t('scheduled_date')}</h3>
              {!editingInstallers && (
                <button
                  onClick={() => setEditingInstallers(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold inline-flex items-center gap-2"
                >
                  <Edit2 size={14} /> {t('edit')}
                </button>
              )}
            </div>
            {editingInstallers ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t('start_date')}</label>
                  <input
                    type="date"
                    value={installersDraft.startDate}
                    onChange={(e) => setInstallersDraft({ ...installersDraft, startDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">{t('end_date')}</label>
                  <input
                    type="date"
                    value={installersDraft.endDate}
                    onChange={(e) => setInstallersDraft({ ...installersDraft, endDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-2">{t('installer_name')}</label>
                  <div className="bg-slate-800 border border-slate-600 rounded-xl p-2 max-h-40 overflow-y-auto">
                    {installersList.map(worker => (
                      <div key={worker._id}
                        onClick={() => toggleInstaller(worker._id)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${installersDraft.installerIds.includes(worker._id) ? 'bg-blue-600/20 border border-blue-500/50' : 'hover:bg-slate-700'
                          }`}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${installersDraft.installerIds.includes(worker._id) ? 'bg-blue-500 border-blue-500' : 'border-slate-500'
                          }`}>
                          {installersDraft.installerIds.includes(worker._id) && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className="text-sm text-white">{worker.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveInstallers}
                    disabled={savingInstallers}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2"
                  >
                    <Save size={16} /> {savingInstallers ? t('loading') : t('save')}
                  </button>
                  <button
                    onClick={() => {
                      setEditingInstallers(false);
                      const installerIds = Array.isArray(order.installers) ? order.installers.map(i => typeof i === 'string' ? i : i._id) : [];
                      setInstallersDraft({
                        installerIds,
                        startDate: order.installDateStart ? new Date(order.installDateStart).toISOString().slice(0, 10) : '',
                        endDate: order.installDateEnd ? new Date(order.installDateEnd).toISOString().slice(0, 10) : ''
                      });
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {order.installDateStart && (
                  <div className="text-sm text-slate-300">
                    <span className="text-slate-400">{t('start_date')}:</span> {new Date(order.installDateStart).toLocaleDateString()}
                  </div>
                )}
                {order.installDateEnd && (
                  <div className="text-sm text-slate-300">
                    <span className="text-slate-400">{t('end_date')}:</span> {new Date(order.installDateEnd).toLocaleDateString()}
                  </div>
                )}
                {order.installers && order.installers.length > 0 && (
                  <div className="text-sm text-slate-300">
                    <span className="text-slate-400">{t('installer_name')}:</span>
                    <div className="mt-1 space-y-1">
                      {order.installers.map((inst, idx) => {
                        const installerId = typeof inst === 'string' ? inst : inst._id || inst;
                        const installer = installersList.find(i => i._id === installerId);
                        const installerName = installer ? installer.name : (typeof inst === 'object' && inst.name ? inst.name : installerId);
                        return (
                          <div key={idx} className="text-slate-200">
                            {installerName}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {(!order.installDateStart && !order.installDateEnd && (!order.installers || order.installers.length === 0)) && (
                  <div className="text-sm text-slate-500">{t('no_installs')}</div>
                )}
              </div>
            )}
          </div>

          {/* Gallery */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg flex flex-col h-full">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg"><ImageIcon className="text-purple-400" /> {t('files_media')}</h3>
            <p className="text-xs text-slate-500 mb-4">{t('files_desc')}</p>

            <div className="flex-1 space-y-3 mb-6 overflow-y-auto min-h-[200px] max-h-[400px] pr-2 custom-scrollbar">
              {otherFiles.length > 0 ? (
                otherFiles.map((file, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-800 rounded-xl border border-slate-700 hover:border-purple-500/30 transition group">
                    <div className="w-12 h-12 bg-slate-700 rounded-lg overflow-hidden shrink-0 border border-slate-600">
                      {file.type === 'site_photo' || file.url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img src={file.url} alt="file" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><FileText size={20} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{file.name}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                      <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 mt-1 border border-slate-600">
                        {file.type === 'site_photo' ? 'Photo' : 'Doc'}
                      </span>
                    </div>
                    <a href={file.url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition">
                      <ExternalLink size={18} />
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-10 border-2 border-dashed border-slate-800 rounded-xl">{t('no_files_yet')}</div>
              )}
            </div>

            <label className={`block w-full border border-dashed ${uploadingType === 'document' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600 hover:border-purple-500 hover:bg-slate-800'} text-slate-300 p-4 rounded-xl transition text-sm text-center cursor-pointer relative`}>
              {uploadingType === 'document' ? (
                <span className="flex items-center justify-center gap-2"><Loader className="animate-spin" size={16} /> {t('uploading')}...</span>
              ) : (
                <span className="flex items-center justify-center gap-2 font-medium">+ {t('upload_doc')}</span>
              )}
              <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'document')} disabled={!!uploadingType} />
            </label>
          </div>
        </div>

      </div>

      {previewUrl && (
        <MasterPlanPreviewModal
          url={previewUrl}
          title={t('master_plan')}
          onClose={() => setPreviewUrl('')}
        />
      )}
    </div>
  );
};

export default ClientCard;