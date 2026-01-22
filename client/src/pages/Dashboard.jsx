import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/dist/locale/es';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, Package, Users, Factory, CheckCircle, Clock } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { API_URL } from '../config/api';

moment.updateLocale('en', {
    week: { dow: 1 }
});
moment.updateLocale('es', {
    week: { dow: 1 }
});

const localizer = momentLocalizer(moment);

const Dashboard = () => {
    const { t, i18n } = useTranslation();
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({
        openOrders: 0,
        customers: 0,
        productionOrders: 0,
        pendingApproval: 0
    });
    const [loading, setLoading] = useState(true);

    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('userInfo'));
        } catch (e) {
            return null;
        }
    }, []);

    const token = user?.token;
    const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
    const currentLang = (i18n.language || 'en').startsWith('es') ? 'es' : 'en';

    useEffect(() => {
        moment.updateLocale(currentLang, {
            week: { dow: 1 }
        });
    }, [currentLang]);

    const isRestricted = ['installer', 'production'].includes(user?.role);

    const fetchData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [ordersRes, repairsRes, customersRes] = await Promise.all([
                axios.get(`${API_URL}/orders`, config),
                axios.get(`${API_URL}/repairs`, config),
                axios.get(`${API_URL}/orders/customers/list`, config).catch(() => ({ data: [] }))
            ]);

            let relevantOrders = ordersRes.data.filter(o => !o.deletedAt);
            let relevantRepairs = repairsRes.data;

            if (isRestricted) {
                relevantOrders = ordersRes.data.filter((order) => {
                    if (order.deletedAt) return false;
                    const installers = Array.isArray(order.installers) ? order.installers : [];
                    return installers.some((inst) => {
                        const id = typeof inst === 'string' ? inst : inst?._id;
                        return String(id) === String(user?._id);
                    });
                });

                relevantRepairs = repairsRes.data.filter((r) => {
                    const installers = Array.isArray(r.installers) ? r.installers : [];
                    return installers.some((inst) => String(inst) === String(user?._id));
                });
            }

            // Calculate stats
            const openOrders = relevantOrders.filter(o => 
                !['completed', 'cancelled'].includes(o.status)
            ).length;
            
            const productionOrders = relevantOrders.filter(o => 
                ['materials_pending', 'production_pending', 'in_production', 'production'].includes(o.status)
            ).length;
            
            const pendingApproval = relevantOrders.filter(o => 
                o.status === 'pending_approval'
            ).length + relevantRepairs.filter(r => r.status === 'pending_approval').length;

            const customers = new Set(relevantOrders.map(o => o.clientName?.toLowerCase())).size;

            setStats({
                openOrders,
                customers,
                productionOrders,
                pendingApproval
            });

            // Calendar events
            const calendarEvents = relevantOrders
                .filter((order) => order.installDateStart && order.installDateEnd)
                .map((order) => {
                    const displayOrderNumber = order.manualOrderNumber || order.orderNumber || '';
                    return {
                        id: order._id,
                        type: 'installation',
                        title: `${order.clientName} (${displayOrderNumber})`,
                        start: new Date(order.installDateStart),
                        end: new Date(order.installDateEnd),
                        resource: { ...order, __type: 'order' },
                        allDay: true
                    };
                });

            const repairEvents = relevantRepairs
                .filter((r) => r.installDateStart && r.installDateEnd)
                .map((r) => {
                    const horaText = r.hora ? ` - ${r.hora}` : '';
                    const orderNumber = r.manualOrderNumber || '';
                    return {
                        id: r._id,
                        type: 'repair',
                        title: `Arreglo: ${r.clientName}${orderNumber ? ` (${orderNumber})` : ''}${horaText}`,
                        start: new Date(r.installDateStart),
                        end: new Date(r.installDateEnd),
                        resource: { ...r, __type: 'repair' },
                        allDay: true
                    };
                });

            setEvents([...calendarEvents, ...repairEvents]);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    }, [config, isRestricted, user?._id, token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const messages = useMemo(() => ({
        next: currentLang === 'es' ? 'Siguiente' : 'Next',
        previous: currentLang === 'es' ? 'Anterior' : 'Back',
        today: currentLang === 'es' ? 'Hoy' : 'Today',
        month: currentLang === 'es' ? 'Mes' : 'Month',
        week: currentLang === 'es' ? 'Semana' : 'Week',
        day: currentLang === 'es' ? 'Día' : 'Day',
        agenda: currentLang === 'es' ? 'Agenda' : 'Agenda',
        date: currentLang === 'es' ? 'Fecha' : 'Date',
        time: currentLang === 'es' ? 'Hora' : 'Time',
        event: currentLang === 'es' ? 'Evento' : 'Event',
        noEventsInRange: currentLang === 'es' ? 'No hay eventos.' : 'No events in this range.',
        showMore: total => `+${total} ${currentLang === 'es' ? 'más' : 'more'}`
    }), [currentLang]);

    return (
        <div className="flex flex-col gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">{t('sidebar_active_orders')}</p>
                            <p className="text-3xl font-bold text-white">{stats.openOrders}</p>
                        </div>
                        <Package className="text-blue-500" size={32} />
                    </div>
                </div>
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">{t('sidebar_customers')}</p>
                            <p className="text-3xl font-bold text-white">{stats.customers}</p>
                        </div>
                        <Users className="text-emerald-500" size={32} />
                    </div>
                </div>
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">{t('sidebar_production')}</p>
                            <p className="text-3xl font-bold text-white">{stats.productionOrders}</p>
                        </div>
                        <Factory className="text-amber-500" size={32} />
                    </div>
                </div>
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">{t('sidebar_financial')}</p>
                            <p className="text-3xl font-bold text-white">{stats.pendingApproval}</p>
                        </div>
                        <CheckCircle className="text-purple-500" size={32} />
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="h-[calc(100vh-300px)] flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <CalendarIcon className="text-blue-500" /> {t('calendar')}
                </h2>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex-1 text-white">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-slate-400">{t('loading')}</p>
                        </div>
                    ) : (
                        <Calendar
                            key={currentLang}
                            localizer={localizer}
                            events={events}
                            culture={currentLang}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            messages={messages}
                            eventPropGetter={(event) => {
                                if (event.type === 'repair') {
                                    return { style: { backgroundColor: '#92400e', borderColor: '#92400e' } };
                                }
                                return {};
                            }}
                            onSelectEvent={(event) => {
                                if (event.type === 'repair') window.location.href = `/repairs`;
                                else window.location.href = `/orders/${event.id}`;
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

