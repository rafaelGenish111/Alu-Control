// server/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // החזרנו את helmet
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const repairRoutes = require('./routes/repairRoutes');

const app = express();

// לוג לכל בקשה נכנסת - כדי לראות שהכל מתחבר
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toISOString()}] Incoming: ${req.method} ${req.originalUrl || req.url}`);
    console.log(`   Origin: ${req.headers.origin || 'none'}`);
    console.log(`   Host: ${req.headers.host}`);
    console.log(`   Path: ${req.path}`);
    next();
});

// הגדרת מקור מורשה
// אם אין משתנה סביבה, ברירת מחדל היא הכתובת של ורסל שלך (ליתר ביטחון)
const allowedOrigin = process.env.CORS_ORIGIN || 'https://glass-dynamics.vercel.app';

const corsOptions = {
    origin: (origin, callback) => {
        // מאפשר בקשות ללא origin (כמו Postman) או מהמקור המורשה
        if (!origin || origin === allowedOrigin) {
            callback(null, true);
            return;
        }

        // בפיתוח: מאפשר localhost וכתובות IP מקומיות
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
        const isLocalNetwork = /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(origin);

        // ב-Vercel: מאפשר כתובות vercel.app
        const isVercel = origin.includes('vercel.app');

        if (isLocalhost || isLocalNetwork || isVercel) {
            callback(null, true);
            return;
        }

        console.log(`🚫 Blocked CORS from: ${origin} (allowed: ${allowedOrigin})`);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // חובה ל-Login
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// הפעלת CORS
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // התיקון הקריטי ל-Express 5

// הגדרות אבטחה (Helmet) - עם אישור לתמונות ומשאבים חיצוניים
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json());

// === Mount all API under /api (single router so path matching is explicit) ===
const apiRouter = express.Router();
apiRouter.get('/', (req, res) => {
    res.json({ ok: true, message: 'API is up' });
});
apiRouter.use('/auth', authRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/suppliers', supplierRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/repairs', repairRoutes);
app.use('/api', apiRouter);

// ראוט בדיקה
app.get('/', (req, res) => {
    res.send('Glass Dynamic API is LIVE and READY! 🚀');
});

// 404 – רק אם אף נתיב לא התאים (מזהה שזה השרת שלנו)
app.use((req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl || req.url}`);
    res.status(404).json({
        success: false,
        message: 'Route not found on this server',
        path: req.originalUrl || req.url,
        method: req.method,
        server: 'local-development',
        timestamp: new Date().toISOString(),
    });
});

module.exports = app;