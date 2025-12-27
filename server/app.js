// server/app.js
const express = require('express');
const cors = require('cors');

// הערנו את כל הראוטים כדי לבודד שגיאות בקבצים האלו
// const authRoutes = require('./routes/authRoutes');
// const orderRoutes = require('./routes/orderRoutes');
// const uploadRoutes = require('./routes/uploadRoutes');
// const supplierRoutes = require('./routes/supplierRoutes');
// const productRoutes = require('./routes/productRoutes');
// const repairRoutes = require('./routes/repairRoutes');

const app = express();

// לוג בסיסי כדי שנראה שהשרת חי
app.use((req, res, next) => {
    console.log(`📡 Request: ${req.method} ${req.url}`);
    next();
});

// CORS הכי פשוט שיש - פתוח לכולם זמנית לבדיקה
app.use(cors({
    origin: '*', 
    credentials: true
}));

app.use(express.json()); 

// ראוט בדיקה פשוט
app.get('/', (req, res) => {
    res.status(200).send('✅ Server is SAFE and RUNNING!');
});

// הערנו את השימוש בראוטים
// app.use('/api/auth', authRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/upload', uploadRoutes);
// app.use('/api/suppliers', supplierRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/repairs', repairRoutes);

module.exports = app;