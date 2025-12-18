import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { API_URL } from '../config/api';

const CalendarView = () => {
    const { t, i18n } = useTranslation();
    const [events, setEvents] = useState([]);
    const [showInstallations, setShowInstallations] = useState(true);
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const token = user?.token;
    const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

    const lang = (i18n.language || 'en').startsWith('es') ? 'es' : 'en';
    const localizer = useMemo(() => {
        // Must be synchronous: moment.locale() doesn't trigger re-render by itself
        moment.locale(lang);
        return momentLocalizer(moment);
    }, [lang]);

    const isRestricted = ['installer', 'production'].includes(user?.role);

    const fetchOrders = useCallback(async () => {
        try {
            const [ordersRes, repairsRes] = await Promise.all([
                axios.get(`${API_URL}/orders`, config),
                axios.get(`${API_URL}/repairs`, config)
            ]);

            let relevantOrders = ordersRes.data;
            let relevantRepairs = repairsRes.data;

            if (isRestricted) {
                relevantOrders = ordersRes.data.filter((order) => {
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
                .map((r) => ({
                    id: r._id,
                    type: 'repair',
                    title: `REPAIR: ${r.clientName} (${r.manualOrderNumber})`,
                    start: new Date(r.installDateStart),
                    end: new Date(r.installDateEnd),
                    resource: { ...r, __type: 'repair' },
                    allDay: true
                }));

            setEvents([...calendarEvents, ...repairEvents]);
        } catch (e) {
            console.error(e);
        }
    }, [config, isRestricted, user?._id]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const visibleEvents = useMemo(() => {
        if (!showInstallations) return [];
        return events;
    }, [events, showInstallations]);

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <CalendarIcon className="text-blue-500" /> {t('calendar')}
            </h2>

            {['super_admin', 'admin', 'office'].includes(user?.role) && (
                <div className="mb-4 flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                        <input
                            type="checkbox"
                            checked={showInstallations}
                            onChange={(e) => setShowInstallations(e.target.checked)}
                            className="accent-blue-500"
                        />
                        Installations
                    </label>
                </div>
            )}

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex-1 text-white">
                <Calendar
                    key={lang}
                    localizer={localizer}
                    events={visibleEvents}
                    culture={lang}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    messages={{
                        next: lang === 'es' ? 'Siguiente' : 'Next',
                        previous: lang === 'es' ? 'Anterior' : 'Previous',
                        today: lang === 'es' ? 'Hoy' : 'Today',
                        month: lang === 'es' ? 'Mes' : 'Month',
                        week: lang === 'es' ? 'Semana' : 'Week',
                        day: lang === 'es' ? 'Día' : 'Day',
                        agenda: lang === 'es' ? 'Agenda' : 'Agenda'
                    }}
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
            </div>
        </div>
    );
};

export default CalendarView;