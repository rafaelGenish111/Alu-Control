// server/app.js
const express = require('express');
const cors = require('cors');
// const helmet = require('helmet'); // מנוטרל זמנית לבדיקה
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const repairRoutes = require('./routes/repairRoutes');

const app = express();

// 1. מלכודת לוגים - חייבת להיות ראשונה!
// זה ידפיס לנו בדיוק איזו בקשה מגיעה, עוד לפני שהיא נחסמת
app.use((req, res, next) => {
    console.log(`📡 Incoming Request: ${req.method} ${req.url}`);
    console.log(`   Origin: ${req.headers.origin}`);
    next();
});

// 2. הגדרת CORS פשוטה וישירה
// אנחנו מגדירים את הכתובת הקשיחה כדי למנוע טעויות במשתני סביבה
const CLIENT_URL = "https://glass-dynamics.vercel.app";

app.use(cors({
    origin: CLIENT_URL,
    credentials: true, // חובה ל-Login
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// טיפול ב-Preflight עם התיקון ל-Express 5
app.options(/.*/, cors({ origin: CLIENT_URL, credentials: true }));

app.use(express.json()); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/repairs', repairRoutes);

app.get('/', (req, res) => {
    res.send('Glass Dynamic API is Running...');
});

module.exports = app;