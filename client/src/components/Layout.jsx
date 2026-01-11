import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, Factory, Shield, LogOut, Smartphone, Menu, X, Clock, Truck, Calendar as CalendarIcon, CheckCircle, Wrench, Search } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

const Layout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const user = JSON.parse(localStorage.getItem('userInfo'));
  const token = user?.token;
  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const currentLang = (i18n.language || 'en').startsWith('es') ? 'es' : 'en';
  const toggleLanguage = () => {
    const next = currentLang === 'en' ? 'es' : 'en';
    localStorage.setItem('lang', next);
    i18n.changeLanguage(next);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const performSearch = useCallback(async (query) => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      setShowSearchModal(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await axios.get(`${API_URL}/orders/search`, {
        ...config,
        params: { q: query.trim() }
      });
      setSearchResults(res.data || []);
      setShowSearchModal(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [config]);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const menuItems = [
    {
      label: t('sidebar_active_orders'),
      path: '/',
      icon: <LayoutDashboard size={20} />,
      roles: ['super_admin', 'admin', 'office']
    },
    {
      label: t('repairs'),
      path: '/repairs',
      icon: <Wrench size={20} />,
      roles: ['super_admin', 'admin', 'office']
    },
    {
      label: t('sidebar_pending_items'),
      path: '/procurement/pending',
      icon: <Clock size={20} />,
      roles: ['super_admin', 'admin', 'office']
    },
    {
      label: t('sidebar_purchasing'),
      path: '/procurement/tracking',
      icon: <Truck size={20} />,
      roles: ['super_admin', 'admin', 'office', 'production']
    },

    {
      label: t('sidebar_production'),
      path: '/production',
      icon: <Factory size={20} />,
      roles: ['super_admin', 'admin', 'office', 'production']
    },
    {
      label: t('sidebar_scheduling'),
      path: '/installations',
      icon: <CalendarIcon size={20} />,
      roles: ['super_admin', 'admin', 'office']
    },
    {
      label: t('sidebar_calendar'),
      path: '/calendar',
      icon: <CalendarIcon size={20} />,
      roles: ['super_admin', 'admin', 'office', 'production', 'installer']
    },
    {
      label: t('sidebar_financial'),
      path: '/approvals',
      icon: <CheckCircle size={20} />,
      roles: ['super_admin', 'admin', 'office']
    },
    {
      label: t('sidebar_completed'),
      path: '/completed',
      icon: <CheckCircle size={20} />,
      roles: ['super_admin', 'admin', 'office']
    },
    {
      label: t('sidebar_users'),
      path: '/admin',
      icon: <Shield size={20} />,
      roles: ['super_admin', 'admin', 'office']
    },
    {
      label: t('sidebar_customers'),
      path: '/customers',
      icon: <Users size={20} />,
      roles: ['super_admin', 'admin', 'office']
    },
    {
      label: t('sidebar_suppliers'),
      path: '/admin/suppliers',
      icon: <ShoppingCart size={20} />,
      roles: ['super_admin', 'admin', 'office']
    },
    {
      label: t('sidebar_installer_app'),
      path: '/installer',
      icon: <Smartphone size={20} />,
      roles: ['super_admin', 'admin', 'office', 'installer']
    },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40">
        <img src="/logo.jpg" alt="Dynamica" className="h-14 object-contain" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700"
            title={t('change_language')}
          >
            {currentLang === 'en' ? 'ES' : 'EN'}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white p-2">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:block">
          <img src="/logo.jpg" alt="Dynamica" className="h-16 object-contain mb-2" />
          <p className="text-xs text-slate-400 mt-1">{user?.name} ({user?.role})</p>
        </div>

        <div className="p-6 md:hidden mt-16">
          <p className="text-sm text-slate-400">{t('hello')} {user?.name}</p>
        </div>

        {/* Global Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery && searchResults.length > 0) {
                  setShowSearchModal(true);
                }
              }}
              placeholder={t('global_search_placeholder')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            if (item.roles[0] !== 'all' && !item.roles.includes(user?.role)) return null;

            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 pb-20 md:pb-4">
          <button
            type="button"
            onClick={toggleLanguage}
            className="mb-3 w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold border border-slate-700"
          >
            {currentLang === 'en' ? t('español') : t('english')}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm w-full">
            <LogOut size={16} /> {t('logout')}
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Search Results Modal */}
      {showSearchModal && searchQuery && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 md:pl-[16rem] pt-20 md:pt-8">
          <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">{t('global_search_results')}</h3>
                <p className="text-xs text-slate-400 mt-1">{searchResults.length} {t('active_col_order').toLowerCase()}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {isSearching ? (
                <div className="p-8 text-center text-slate-400">{t('global_search_loading')}</div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center text-slate-500">{t('global_search_no_results')}</div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {searchResults.map((order) => {
                    const displayOrderNumber = order.manualOrderNumber || order.orderNumber || order._id;
                    return (
                      <button
                        key={order._id}
                        type="button"
                        onClick={() => {
                          navigate(`/orders/${order._id}`);
                          setShowSearchModal(false);
                          setSearchQuery('');
                          setIsSidebarOpen(false);
                        }}
                        className="w-full p-4 text-left hover:bg-slate-800/50 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-mono text-blue-400 text-sm mb-1">#{displayOrderNumber}</div>
                            <div className="font-semibold text-white">{order.clientName}</div>
                            <div className="text-xs text-slate-400 mt-1">
                              {order.region && <span>{order.region} • </span>}
                              {order.clientPhone && <span>{order.clientPhone}</span>}
                            </div>
                          </div>
                          <div className="ml-4">
                            <span className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                              {order.status || '—'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;