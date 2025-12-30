import axios from 'axios';

// התיקון: הוספתי export לפני ה-const כדי שקבצים אחרים יוכלו להשתמש בזה
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor לבקשות: הוספת הטוקן לכל בקשה יוצאת
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor לתשובות: טיפול גלובלי בשגיאות אבטחה
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // זיהוי שגיאות אבטחה (401 - לא מורשה, 403 - אין גישה)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      // מניעת לולאה אינסופית: אם אנחנו כבר בלוגין, לא צריך לעשות כלום
      if (!window.location.pathname.includes('/login')) {
        console.warn('Session expired or invalid user. Logging out...');
        
        // 1. מחיקת המידע מהאחסון המקומי
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // 2. הפניה "קשה" לדף הלוגין
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;