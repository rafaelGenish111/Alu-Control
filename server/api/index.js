// Vercel serverless function entry point
// This file is used when deploying to Vercel
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('../app');

// Connect to MongoDB (cached connection)
let isConnected = false;

const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('✅ MongoDB Connected (Vercel)');
        }
        isConnected = true;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        isConnected = false;
        throw error;
    }
};

// Export handler for Vercel
module.exports = async (req, res) => {
    // Connect to DB if not connected
    try {
        await connectDB();
    } catch (error) {
        return res.status(500).json({ error: 'Database connection failed' });
    }

    // Handle the request
    return app(req, res);
};
