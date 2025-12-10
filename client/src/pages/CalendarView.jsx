import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // ייבוא סטיילים בסיסיים
import { API_URL } from '../config/api';

const localizer = momentLocalizer(moment);

const CalendarView = () => {
    const { t } = useTranslation();
    const [events, setEvents] = useState([]);
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get(`${API_URL}/orders`, config);

                // --- לוגיקת סינון חכמה ---
                let relevantOrders = res.data;

                // אם המשתמש הוא מתקין - הצג רק את ההזמנות שהוא משובץ בהן
                if (user.role === 'installer') {
                    relevantOrders = res.data.filter(order =>
                        order.installers && order.installers.some(inst => inst._id === user._id)
                    );
                }
                // אחרת (מנהלים/שיווק/ייצור) - מציגים הכל (כבר משוייך למשתנה)

                // המרה לפורמט של הלוח שנה
                const calendarEvents = relevantOrders
                    .filter(order => order.installDateStart && order.installDateEnd) // רק מה שמשובץ
                    .map(order => ({
                        id: order._id,
                        title: `${order.clientName} (${order.orderNumber})`, // מה כתוב בקוביה
                        start: new Date(order.installDateStart),
                        end: new Date(order.installDateEnd),
                        resource: order, // שמירת המידע המלא ללחיצה עתידית
                        allDay: true // התקנות הן בדרך כלל יום שלם
                    }));

                setEvents(calendarEvents);
            } catch (error) {
                console.error(error);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <CalendarIcon className="text-blue-500" /> {t('calendar')}
            </h2>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex-1 text-white">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    messages={{
                        next: t('next'),
                        previous: t('previous'),
                        today: t('today'),
                        month: t('month'),
                        week: t('week'),
                        day: t('day')
                    }}
                    // אופציונלי: לחיצה על אירוע פותחת את ההזמנה
                    onSelectEvent={(event) => window.location.href = `/orders/${event.id}`}
                />
            </div>
        </div>
    );
};

export default CalendarView;