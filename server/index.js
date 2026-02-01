// server/index.js
require('dotenv').config(); // טעינת משתני סביבה בהתחלה
const mongoose = require('mongoose');
const app = require('./app');
const Order = require('./models/Order');

// 1. הגדרת הפורט - קודם כל מהסביבה, ואז ברירת מחדל
const PORT = process.env.PORT || 5001;

// 2. פונקציית ניקוי עבודות ישנות (מבוצעת פעם ביום)
const cleanupDeletedOrders = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const result = await Order.deleteMany({
      deletedAt: { $ne: null, $lt: sevenDaysAgo }
    });
    
    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} deleted orders older than 7 days`);
    }
  } catch (error) {
    console.error('❌ Error cleaning up deleted orders:', error);
  }
};

// 3. פונקציית ההפעלה
const startServer = async () => {
  try {
    // חיבור למסד הנתונים
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // הרצת השרת
    // חשוב מאוד: להוסיף '0.0.0.0' כדי ש-Railway יוכל לגשת לשרת
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Waiting for requests...`);
    });

    // הרצת ניקוי ראשוני
    cleanupDeletedOrders();

    // הגדרת ניקוי יומי (כל 24 שעות)
    // 24 * 60 * 60 * 1000 = 86400000 milliseconds
    setInterval(cleanupDeletedOrders, 24 * 60 * 60 * 1000);
    console.log('🧹 Cleanup job scheduled to run daily');

  } catch (error) {
    console.error('❌ Server Error:', error);
    process.exit(1); // יציאה מסודרת במקרה של שגיאה קריטית
  }
};

startServer();