// server/index.js
require('dotenv').config(); // טעינת משתני סביבה בהתחלה
const mongoose = require('mongoose');
const app = require('./app');

// 1. הגדרת הפורט - קודם כל מהסביבה, ואז ברירת מחדל
const PORT = process.env.PORT || 5000;

// 2. פונקציית ההפעלה
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

  } catch (error) {
    console.error('❌ Server Error:', error);
    process.exit(1); // יציאה מסודרת במקרה של שגיאה קריטית
  }
};

startServer();