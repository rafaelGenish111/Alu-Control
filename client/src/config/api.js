import axios from 'axios';

// בפיתוח (npm run dev): תמיד proxy – הבקשות ל-/api עוברות אוטומטית ל-5001. בפרודקשן: VITE_API_URL או ברירת מחדל.
const isDev = typeof import.meta.env.DEV !== 'undefined' && import.meta.env.DEV;

let API_URL;
if (isDev) {
  // בפיתוח מקומי - השתמש ב-proxy
  API_URL = '/api';
} else {
  // ב-production - בדוק אם יש VITE_API_URL
  const viteApiUrl = import.meta.env.VITE_API_URL;
  if (viteApiUrl && String(viteApiUrl).trim() !== '') {
    // אם יש VITE_API_URL, השתמש בו (הסר /api אם קיים והוסף מחדש)
    API_URL = String(viteApiUrl).replace(/\/api\/?$/, '') + '/api';
  } else {
    // אם אין VITE_API_URL, השתמש ב-rewrite דרך vercel.json (נתיב יחסי)
    // זה יעבוד רק אם vercel.json מוגדר נכון
    API_URL = '/api';
  }
}

// Debug log
console.log('🔧 API Config:', {
  isDev,
  API_URL,
  viteApiUrl: import.meta.env.VITE_API_URL,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A'
});

export { API_URL };

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor לבקשות: הוספת הטוקן לכל בקשה יוצאת
api.interceptors.request.use(
  (config) => {
    // הטוקן נשמר ב-userInfo (JSON) או ב-token (legacy)
    let token = null;
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        token = user.token;
      }
    } catch (e) {
      // אם אין userInfo, נסה לקרוא מ-token ישירות (legacy)
      token = localStorage.getItem('token');
    }

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
        localStorage.removeItem('userInfo');

        // 2. הפניה "קשה" לדף הלוגין
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;