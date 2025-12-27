// server/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const repairRoutes = require('./routes/repairRoutes');

const app = express();

// הגדרת המקור המורשה
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
console.log(`🔒 CORS Configured for origin: ${allowedOrigin}`);

// הגדרת אפשרויות CORS
const corsOptions = {
    origin: (origin, callback) => {
        // לוג לכל בקשה כדי שנראה בדיוק מה מגיע
        if (origin) {
            console.log(`🔔 Incoming Request from Origin: ${origin}`);
        }

        // אישור בקשות ללא Origin (כמו Postman) או בקשות מהמקור המורשה
        if (!origin || origin === allowedOrigin || origin === 'http://localhost:5173') {
            callback(null, true);
        } else {
            console.log(`🚫 Blocked Request from: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // חובה ל-Login
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// הפעלת CORS
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// הגדרות אבטחה נוספות (Helmet)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

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