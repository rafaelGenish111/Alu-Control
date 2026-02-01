import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, Factory, Shield, LogOut, Smartphone, Menu, X, Clock, Truck, Calendar as CalendarIcon, CheckCircle, Wrench, Search, Trash2, Package, Settings } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useDarkMode } from '../contexts/DarkModeContext';

const Layout = () => {
  const { t, i18n } = useTranslation();
  const { isDark } = useDarkMode();
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

  // Detect current language (en/es/he)
  const currentLang = (i18n.language || 'en').startsWith('he') ? 'he' : (i18n.language || 'en').startsWith('es') ? 'es' : 'en';
  const isRTL = currentLang === 'he';

  // Toggle language between en -> es -> he -> en
  const toggleLanguage = () => {
    let next;
    if (currentLang === 'en') next = 'es';
    else if (currentLang === 'es') next = 'he';
    else next = 'en';
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
      label: t('sidebar_dashboard') || 'Dashboard',
      path: '/',
      icon: <LayoutDashboard size={20} />,
      roles: ['super_admin', 'admin', 'office']
    },
    {
      label: t('sidebar_active_orders'),
      path: '/orders',
      icon: <Package size={20} />,
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
      label: t('sidebar_deleted') || 'Deleted Orders',
      path: '/deleted',
      icon: <Trash2 size={20} />,
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
    {
      label: t('sidebar_settings') || 'הגדרות',
      path: '/settings',
      icon: <Settings size={20} />,
      roles: ['all']
    },
  ];

  const getLanguageButtonText = () => {
    if (currentLang === 'en') return t('español') || 'ES';
    if (currentLang === 'es') return t('hebrew') || 'עברית';
    return t('english') || 'EN';
  };

  return (
    <div
      className={`flex h-screen dark:bg-slate-950 bg-white dark:text-slate-100 text-gray-900 font-sans overflow-hidden ${isRTL ? 'rtl' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >

      {/* Mobile Header */}
      <div className={`md:hidden fixed top-0 ${isRTL ? 'right-0' : 'left-0'} right-0 h-16 dark:bg-slate-900 bg-white border-b dark:border-slate-800 border-gray-200 flex items-center ${isRTL ? 'flex-row-reverse' : ''} justify-between px-4 z-40`}>
        <img src="/logo.jpg" alt="Dynamica" className="h-14 object-contain" />
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="dark:text-white text-gray-900 p-2">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50 w-64 dark:bg-slate-900 bg-white ${isRTL ? 'border-l' : 'border-r'} dark:border-slate-800 border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:block">
          <img src="/logo.jpg" alt="Dynamica" className="h-16 object-contain mb-2" />
          <p className="text-xs dark:text-slate-400 text-gray-600 mt-1">{user?.name} ({user?.role})</p>
        </div>

        <div className="p-6 md:hidden mt-16">
          <p className="text-sm dark:text-slate-400 text-gray-600">{t('hello')} {user?.name}</p>
        </div>

        {/* Global Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 dark:text-slate-400 text-gray-500`} size={18} />
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
              className={`w-full dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-xl ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 text-sm dark:text-white text-gray-900 dark:placeholder:text-slate-500 placeholder:text-gray-400 focus:outline-none focus:border-blue-500`}
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-lg' : 'dark:text-slate-400 text-gray-600 hover:dark:bg-slate-800 hover:bg-gray-200 hover:dark:text-white hover:text-gray-900'
                  }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={`p-4 border-t dark:border-slate-800 border-gray-200 pb-20 md:pb-4`}>
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
        <div className={`fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 ${isRTL ? 'md:pr-[16rem]' : 'md:pl-[16rem]'} pt-20 md:pt-8`}>
          <div className="dark:bg-slate-900 bg-white w-full max-w-2xl rounded-2xl border dark:border-slate-700 border-gray-200 shadow-2xl max-h-[80vh] flex flex-col">
            <div className={`p-5 border-b dark:border-slate-800 border-gray-200 flex ${isRTL ? 'flex-row-reverse' : ''} justify-between items-center`}>
              <div>
                <h3 className="text-lg font-bold dark:text-white text-gray-900">{t('global_search_results')}</h3>
                <p className="text-xs dark:text-slate-400 text-gray-600 mt-1">{searchResults.length} {t('active_col_order').toLowerCase()}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery('');
                }}
                className="dark:text-slate-400 text-gray-600 hover:dark:text-white hover:text-gray-900"
              >
                <X />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {isSearching ? (
                <div className="p-8 text-center dark:text-slate-400 text-gray-600">{t('global_search_loading')}</div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center dark:text-slate-500 text-gray-500">{t('global_search_no_results')}</div>
              ) : (
                <div className="divide-y dark:divide-slate-800 divide-gray-200">
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
                        className={`w-full p-4 ${isRTL ? 'text-right' : 'text-left'} hover:dark:bg-slate-800/50 hover:bg-gray-50 transition`}
                      >
                        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} justify-between`}>
                          <div className="flex-1">
                            <div className="font-mono text-blue-400 text-sm mb-1">#{displayOrderNumber}</div>
                            <div className="font-semibold dark:text-white text-gray-900">{order.clientName}</div>
                            <div className="text-xs dark:text-slate-400 text-gray-600 mt-1">
                              {order.region && <span>{order.region} • </span>}
                              {order.clientPhone && <span>{order.clientPhone}</span>}
                            </div>
                          </div>
                          <div className={isRTL ? 'mr-4' : 'ml-4'}>
                            <span className="text-xs px-2 py-1 rounded-lg dark:bg-slate-800 bg-gray-100 dark:text-slate-300 text-gray-700 border dark:border-slate-700 border-gray-300">
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

      <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 w-full dark:bg-slate-950 bg-white">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;