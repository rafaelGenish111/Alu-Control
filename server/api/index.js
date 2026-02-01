// Vercel serverless function entry point
// This file is used when deploying to Vercel
// Note: dotenv is not needed in Vercel - environment variables are provided automatically
const mongoose = require('mongoose');
const app = require('../app');

// Connect to MongoDB (cached connection)
let isConnected = false;

const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    // Check if MONGO_URI is set
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        const error = new Error('MONGO_URI environment variable is not set');
        console.error('❌ MongoDB Connection Error:', error.message);
        console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('mongo')));
        throw error;
    }

    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(mongoUri);
            console.log('✅ MongoDB Connected (Vercel)');
        }
        isConnected = true;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        isConnected = false;
        throw error;
    }
};

// Export handler for Vercel
module.exports = async (req, res) => {
    try {
        // Connect to DB if not connected
        await connectDB();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return res.status(500).json({
            error: 'Database connection failed',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }

    // Handle the request
    try {
        return await app(req, res);
    } catch (error) {
        console.error('❌ Request handler error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
